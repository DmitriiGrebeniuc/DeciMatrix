type AnalyzeResultRequest = {
  decisionTitle: string;
  options: {
    id: string;
    name: string;
  }[];
  criteria: {
    id: string;
    name: string;
    importance: number;
  }[];
  scores: {
    optionId: string;
    criterionId: string;
    rating: string;
    value: number;
  }[];
  result: {
    winnerOptionId: string | null;
    outcome?: 'winner' | 'close_call' | 'tie';
    ranking: {
      optionId: string;
      optionName: string;
      matchPercent: number;
      rank: number;
    }[];
  };
};

type AiResultAnalysis = {
  summary: string;
  reasons: string[];
  cautions: string[];
  advice: string[];
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

type PreparedAnalysisData = {
  first: AnalyzeResultRequest['result']['ranking'][number];
  second: AnalyzeResultRequest['result']['ranking'][number] | null;
  differencePercent: number | null;
  sortedCriteria: AnalyzeResultRequest['criteria'];
  winnerScores: PreparedScore[];
  secondScores: PreparedScore[];
  criterionComparison: CriterionComparison[];
};

type PreparedScore = {
  criterionId: string;
  criterionName: string;
  importance: number;
  rating: string;
  value: number;
};

type CriterionComparison = {
  criterionId: string;
  criterionName: string;
  importance: number;
  winnerValue: number;
  competitorValue: number;
  diff: number;
};

declare const process: {
  env: {
    OPENROUTER_API_KEY?: string;
  };
};

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = 'openrouter/free';

const SYSTEM_PROMPT = `Ты работаешь как практичный аналитик решений в приложении DeciMatrix.

Пользователь сравнил варианты по критериям, важности и оценкам. Твоя задача - не повторять таблицу, а объяснить, что реально повлияло на результат и где пользователь может ошибиться в интерпретации.

Пиши по-русски, коротко, конкретно и полезно.

Главные правила:
- Не говори общие фразы вроде "проверьте важность критериев", если не объясняешь, какой именно критерий и почему.
- Не повторяй очевидное, что уже видно из рейтинга.
- Не утверждай, что победитель объективно лучший.
- Всегда подчеркивай, что результат верен только в рамках введенных критериев и оценок.
- Не придумывай факты о вариантах, которых нет в данных.
- Не используй технические слова: "коэффициент", "нормализация", "матрица", "алгоритм".
- Если разница маленькая, прямо скажи, что выбор неустойчивый.
- Если один критерий сильно повлиял на исход, назови его.
- Если у победителя есть слабая оценка по важному критерию, обязательно отметь это.
- Если есть критерий, изменение которого может поменять победителя, скажи об этом.
- Ответ строго в JSON без markdown.`;

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
    const analysis = await requestAnalysis(body, apiKey);
    res.status(200).json({ analysis });
  } catch {
    res.status(502).json({
      error: 'Не получилось получить AI-разбор. Попробуйте позже.',
    });
  }
}

function setCorsHeaders(res: ApiResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function parseRequestBody(body: unknown): AnalyzeResultRequest {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as AnalyzeResultRequest;
    } catch {
      return getEmptyRequest();
    }
  }

  if (body && typeof body === 'object') {
    return body as AnalyzeResultRequest;
  }

  return getEmptyRequest();
}

function getEmptyRequest(): AnalyzeResultRequest {
  return {
    decisionTitle: '',
    options: [],
    criteria: [],
    scores: [],
    result: {
      winnerOptionId: null,
      ranking: [],
    },
  };
}

function validateRequest(request: AnalyzeResultRequest): string | null {
  if (
    typeof request.decisionTitle !== 'string' ||
    request.decisionTitle.trim().length === 0
  ) {
    return 'decisionTitle is required';
  }

  if (!Array.isArray(request.options) || request.options.length < 2) {
    return 'options must contain at least 2 items';
  }

  if (!Array.isArray(request.criteria) || request.criteria.length < 2) {
    return 'criteria must contain at least 2 items';
  }

  if (!Array.isArray(request.scores)) {
    return 'scores must be an array';
  }

  if (
    !request.result ||
    !Array.isArray(request.result.ranking) ||
    request.result.ranking.length < 1
  ) {
    return 'result.ranking must contain at least 1 item';
  }

  return null;
}

async function requestAnalysis(
  request: AnalyzeResultRequest,
  apiKey: string
): Promise<AiResultAnalysis> {
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://decimatrix.app',
      'X-Title': 'DeciMatrix',
    },
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
      temperature: 0.25,
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

  return parseAnalysisResponse(content);
}

function buildUserPrompt(request: AnalyzeResultRequest): string {
  const prepared = prepareAnalysisData(request);

  return `Решение:
${request.decisionTitle.trim()}

Outcome:
${request.result.outcome ?? 'winner'}

Рейтинг:
${formatRanking(request.result.ranking)}

Разница между первым и вторым:
${formatDifference(prepared.differencePercent)}

Критерии по важности:
${formatCriteria(prepared.sortedCriteria)}

Оценки победителя:
${formatPreparedScores(prepared.winnerScores)}

Оценки ближайшего конкурента:
${formatPreparedScores(prepared.secondScores)}

Сравнение победителя и ближайшего конкурента по критериям:
${formatCriterionComparison(prepared.criterionComparison)}

Задача:
Сделай полезный разбор результата. Не повторяй очевидное. Объясни, что реально решило исход, где результат может быть спорным и что стоит проверить перед финальным выбором.

Ответ строго в JSON:

{
  "summary": "1-2 предложения. Конкретный вывод без банальности.",
  "reasons": [
    "Что именно решило исход. Упоминай конкретные критерии.",
    "Почему ближайший конкурент уступил или почему результат близкий."
  ],
  "cautions": [
    "Конкретные слабые места победителя или причины сомневаться.",
    "Если результат близкий, объясни почему это важно."
  ],
  "advice": [
    "Конкретный следующий шаг для пользователя.",
    "Например: пересмотри критерий X, добавь критерий Y, сравни сценарий где X важнее."
  ]
}`;
}

function prepareAnalysisData(
  request: AnalyzeResultRequest
): PreparedAnalysisData {
  const [first, second = null] = request.result.ranking;
  const sortedCriteria = [...request.criteria].sort(
    (left, right) => right.importance - left.importance
  );
  const winnerScores = first
    ? buildPreparedScores(request, first.optionId, sortedCriteria)
    : [];
  const secondScores = second
    ? buildPreparedScores(request, second.optionId, sortedCriteria)
    : [];
  const criterionComparison =
    first && second
      ? sortedCriteria.map((criterion) => {
          const winnerScore = findScore(
            request,
            first.optionId,
            criterion.id
          );
          const competitorScore = findScore(
            request,
            second.optionId,
            criterion.id
          );

          return {
            criterionId: criterion.id,
            criterionName: criterion.name,
            importance: criterion.importance,
            winnerValue: winnerScore?.value ?? 0,
            competitorValue: competitorScore?.value ?? 0,
            diff: (winnerScore?.value ?? 0) - (competitorScore?.value ?? 0),
          };
        })
      : [];

  return {
    first,
    second,
    differencePercent: second
      ? Math.abs(first.matchPercent - second.matchPercent)
      : null,
    sortedCriteria,
    winnerScores,
    secondScores,
    criterionComparison,
  };
}

function buildPreparedScores(
  request: AnalyzeResultRequest,
  optionId: string,
  criteria: AnalyzeResultRequest['criteria']
): PreparedScore[] {
  return criteria.map((criterion) => {
    const score = findScore(request, optionId, criterion.id);

    return {
      criterionId: criterion.id,
      criterionName: criterion.name,
      importance: criterion.importance,
      rating: score?.rating ?? 'нет оценки',
      value: score?.value ?? 0,
    };
  });
}

function findScore(
  request: AnalyzeResultRequest,
  optionId: string,
  criterionId: string
) {
  return request.scores.find(
    (score) => score.optionId === optionId && score.criterionId === criterionId
  );
}

function formatRanking(
  ranking: AnalyzeResultRequest['result']['ranking']
): string {
  return ranking
    .map(
      (item) =>
        `${item.rank}. ${item.optionName} - ${Math.round(
          item.matchPercent
        )}%`
    )
    .join('\n');
}

function formatDifference(value: number | null): string {
  if (value === null) {
    return 'нет второго варианта';
  }

  return `${roundToOneDecimal(value)}%`;
}

function formatCriteria(criteria: AnalyzeResultRequest['criteria']): string {
  return criteria
    .map((criterion) => `- ${criterion.name}: важность ${criterion.importance}/100`)
    .join('\n');
}

function formatPreparedScores(scores: PreparedScore[]): string {
  if (scores.length === 0) {
    return 'нет данных';
  }

  return scores
    .map(
      (score) =>
        `- ${score.criterionName}: ${score.rating}, value ${score.value}/10, importance ${score.importance}/100`
    )
    .join('\n');
}

function formatCriterionComparison(items: CriterionComparison[]): string {
  if (items.length === 0) {
    return 'нет второго варианта для сравнения';
  }

  return items
    .map(
      (item) =>
        `- ${item.criterionName}: победитель ${item.winnerValue}/10, конкурент ${item.competitorValue}/10, важность ${item.importance}/100, разница ${formatSignedNumber(item.diff)}`
    )
    .join('\n');
}

function formatSignedNumber(value: number): string {
  if (value > 0) {
    return `+${roundToOneDecimal(value)}`;
  }

  return `${roundToOneDecimal(value)}`;
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function parseAnalysisResponse(content: string): AiResultAnalysis {
  const jsonText = extractJson(content);
  const parsed = JSON.parse(jsonText) as Partial<AiResultAnalysis>;

  if (
    typeof parsed.summary !== 'string' ||
    !Array.isArray(parsed.reasons) ||
    !Array.isArray(parsed.cautions) ||
    !Array.isArray(parsed.advice)
  ) {
    throw new Error('Invalid analysis response');
  }

  const analysis: AiResultAnalysis = {
    summary: parsed.summary.trim(),
    reasons: normalizeStringList(parsed.reasons),
    cautions: normalizeStringList(parsed.cautions),
    advice: normalizeStringList(parsed.advice),
  };

  if (!analysis.summary) {
    throw new Error('Analysis summary is empty');
  }

  return analysis;
}

function normalizeStringList(values: unknown[]): string[] {
  return values
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 5);
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
