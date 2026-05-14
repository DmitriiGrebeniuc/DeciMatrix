type SuggestCriteriaRequest = {
  decisionTitle: string;
  options: string[];
  existingCriteria?: string[];
};

type SuggestCriteriaResponse = {
  criteria: string[];
};

type ApiRequest = {
  method?: string;
  body?: unknown;
};

type ApiResponse = {
  setHeader: (name: string, value: string | string[]) => void;
  status: (statusCode: number) => ApiResponse;
  json: (body: unknown) => void;
  end: () => void;
};

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

declare const process: {
  env: {
    OPENROUTER_API_KEY?: string;
  };
};

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = 'openrouter/free';

const SYSTEM_PROMPT =
  'Ты помогаешь пользователю приложения DeciMatrix выбрать критерии для сравнения вариантов. Верни только короткий JSON без markdown. Критерии должны быть понятными, практичными и не дублировать существующие.';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    res.status(500).json({ error: 'AI service is not configured' });
    return;
  }

  const body = parseRequestBody(req.body);
  const validationError = validateRequest(body);

  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  try {
    const aiResponse = await requestCriteria(body, apiKey);
    res.status(200).json(aiResponse);
  } catch {
    res.status(502).json({
      error: 'Не получилось получить критерии. Попробуйте позже.',
    });
  }
}

function setCorsHeaders(res: ApiResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function parseRequestBody(body: unknown): SuggestCriteriaRequest {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as SuggestCriteriaRequest;
    } catch {
      return {
        decisionTitle: '',
        options: [],
      };
    }
  }

  if (body && typeof body === 'object') {
    return body as SuggestCriteriaRequest;
  }

  return {
    decisionTitle: '',
    options: [],
  };
}

function validateRequest(request: SuggestCriteriaRequest): string | null {
  if (
    typeof request.decisionTitle !== 'string' ||
    request.decisionTitle.trim().length === 0
  ) {
    return 'decisionTitle is required';
  }

  if (
    !Array.isArray(request.options) ||
    request.options.filter((option) => option.trim().length > 0).length < 2
  ) {
    return 'options must contain at least 2 items';
  }

  if (
    request.existingCriteria !== undefined &&
    !Array.isArray(request.existingCriteria)
  ) {
    return 'existingCriteria must be an array';
  }

  return null;
}

async function requestCriteria(
  request: SuggestCriteriaRequest,
  apiKey: string
): Promise<SuggestCriteriaResponse> {
  const openRouterHeaders = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://decimatrix.app',
    'X-Title': 'DeciMatrix',
  };

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: openRouterHeaders,
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: buildUserPrompt(request),
        },
      ],
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    throw new Error('OpenRouter request failed');
  }

  const payload = (await response.json()) as OpenRouterResponse;
  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('OpenRouter returned empty content');
  }

  return parseCriteriaResponse(content);
}

function buildUserPrompt(request: SuggestCriteriaRequest): string {
  const options = request.options
    .map((option) => option.trim())
    .filter(Boolean)
    .map((option) => `- ${option}`)
    .join('\n');
  const existingCriteria =
    request.existingCriteria
      ?.map((criterion) => criterion.trim())
      .filter(Boolean)
      .map((criterion) => `- ${criterion}`)
      .join('\n') || 'нет';

  return `Решение: ${request.decisionTitle.trim()}

Варианты:
${options}

Уже добавленные критерии:
${existingCriteria}

Предложи 5-8 критериев для сравнения этих вариантов.

Ответ строго в JSON:
{
  "criteria": ["...", "..."]
}`;
}

function parseCriteriaResponse(content: string): SuggestCriteriaResponse {
  const jsonText = extractJson(content);
  const parsed = JSON.parse(jsonText) as Partial<SuggestCriteriaResponse>;

  if (!Array.isArray(parsed.criteria)) {
    throw new Error('Invalid criteria response');
  }

  const criteria = parsed.criteria
    .filter((criterion): criterion is string => typeof criterion === 'string')
    .map((criterion) => criterion.trim())
    .filter(Boolean)
    .slice(0, 8);

  if (criteria.length === 0) {
    throw new Error('Criteria response is empty');
  }

  return { criteria };
}

function extractJson(content: string): string {
  const withoutFence = content
    .replace(/```json/gi, '```')
    .replace(/```/g, '')
    .trim();
  const jsonStart = withoutFence.indexOf('{');
  const jsonEnd = withoutFence.lastIndexOf('}');

  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
    throw new Error('JSON was not found in AI response');
  }

  return withoutFence.slice(jsonStart, jsonEnd + 1);
}
