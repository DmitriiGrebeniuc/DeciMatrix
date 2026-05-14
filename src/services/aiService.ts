import { AI_API_BASE_URL } from '../constants/api';

export type SuggestCriteriaRequest = {
  decisionTitle: string;
  options: string[];
  existingCriteria?: string[];
};

export type SuggestCriteriaResponse = {
  criteria: string[];
};

export type AnalyzeResultRequest = {
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

export type AiResultAnalysis = {
  summary: string;
  reasons: string[];
  cautions: string[];
  advice: string[];
};

type AnalyzeResultResponse = {
  analysis: AiResultAnalysis;
};

export async function suggestCriteria(
  payload: SuggestCriteriaRequest
): Promise<string[]> {
  const response = await fetch(`${AI_API_BASE_URL}/api/suggest-criteria`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Criteria suggestion request failed');
  }

  const data = (await response.json()) as Partial<SuggestCriteriaResponse>;

  if (!Array.isArray(data.criteria)) {
    throw new Error('Invalid criteria suggestion response');
  }

  return data.criteria
    .filter((criterion): criterion is string => typeof criterion === 'string')
    .map((criterion) => criterion.trim())
    .filter(Boolean);
}

export async function analyzeResult(
  payload: AnalyzeResultRequest
): Promise<AiResultAnalysis> {
  const response = await fetch(`${AI_API_BASE_URL}/api/analyze-result`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Result analysis request failed');
  }

  const data = (await response.json()) as Partial<AnalyzeResultResponse>;
  const analysis = data.analysis;

  if (
    !analysis ||
    typeof analysis.summary !== 'string' ||
    !Array.isArray(analysis.reasons) ||
    !Array.isArray(analysis.cautions) ||
    !Array.isArray(analysis.advice)
  ) {
    throw new Error('Invalid result analysis response');
  }

  return {
    summary: analysis.summary.trim(),
    reasons: normalizeStringList(analysis.reasons),
    cautions: normalizeStringList(analysis.cautions),
    advice: normalizeStringList(analysis.advice),
  };
}

function normalizeStringList(values: unknown[]): string[] {
  return values
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim())
    .filter(Boolean);
}
