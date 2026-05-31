import type { DifficultyType, ProblemType } from '../schemas/mathSchema.js'

export function buildAnalyzePrompt(): string {
  return `당신은 한국 고등학교 수학 문제 이미지를 분석하는 AI입니다.

문제를 추출하고 유형을 분류해주세요. 반드시 아래 JSON 형식으로만 반환해. 마크다운 코드 펜스나 다른 텍스트 없이 순수 JSON만 출력할 것.
(Return ONLY valid JSON, no markdown fences)

분류 기준:
- "formula": 방정식, 부등식 등 직접 계산하여 답을 구하는 문제 (예: x²+3x-4=0 풀기, 식 단순화)
- "graph": 함수의 모양이나 특성을 시각적으로 이해해야 하는 문제 (예: 그래프 그리기, 교점 찾기, 함수 특성 분석, 극값 구하기)
- "application": 실생활 상황이나 조건을 수식으로 모델링해야 하는 활용 문제 (예: 속도/거리/시간, 넓이, 혼합물, 경우의 수, 확률)

아래 JSON 형식으로만 출력해:
{
  "problemType": "formula",
  "problemText": "이미지에 적힌 문제 전체 텍스트(한국어 그대로)",
  "latex": "주요 수식을 LaTeX로 표현 (예: f(x) = x^2 - 2x + 1)",
  "confidence": 90
}

규칙:
- problemText: 이미지에 보이는 텍스트를 정확히 그대로 복사, 한국어 보존
- latex: 주요 수식만 LaTeX 표기로 변환; 표준 LaTeX 표기법 사용
- confidence: 분류 확신도를 정수(0~100)로 표현 (90 이상=매우 명확, 70~89=대체로 명확, 70 미만=모호하거나 이미지 불선명)
- 반드시 JSON만 출력. 다른 텍스트 없음.`
}

const DIFFICULTY_HINTS: Record<DifficultyType, string> = {
  understanding:
    '학생이 문제가 무슨 뜻인지 파악하지 못하고 있습니다. 수식으로 넘어가기 전에 각 용어와 조건을 평이한 한국어로 풀어서 설명하는 데 집중하세요.',
  strategy:
    '학생이 문제는 이해하지만 어디서부터 시작해야 할지 모릅니다. 핵심 개념을 파악하고, 계산을 보여주기 전에 전체적인 풀이 접근법을 먼저 설명하세요.',
  midway:
    '학생이 중간까지 풀었지만 막혀 있습니다. 풀이 설정을 간략히 복습한 뒤, 대부분의 학생이 어렵게 느끼는 단계에 집중해서 자세히 설명하세요.',
  visual:
    '학생이 시각적·기하학적 직관이 필요한 상황입니다. 각 단계에서 수식이 어떻게 보이는지(도형, 그래프, 움직임)를 강조하여 설명하세요.',
}

const VISUAL_DATA_INSTRUCTIONS: Record<ProblemType, string> = {
  formula: `"visualData": {
  "type": "formula",
  "roots": [다항방정식 f(x)=0의 실수 근 배열 (있는 경우에만); 다항식이 아니거나 실근이 없으면 생략],
  "vertex": [이차식인 경우 꼭짓점 [vx, vy]; 해당 없으면 생략]
}`,
  graph: `"visualData": {
  "type": "graph",
  "expression": "Desmos용 LaTeX 함수식, 예: y = x^2 - 2x - 3",
  "domain": [minX, maxX],
  "roots": [x1, x2],
  "vertex": [vx, vy]
}
roots 또는 vertex가 존재하지 않거나 문제에서 관련 없으면 생략.`,
  application: `"visualData": {
  "type": "application",
  "rate": <수치 비율>,
  "unit": "<단위 문자열, 예: m/s>",
  "totalTime": <총 시간(숫자)>,
  "totalHeight": <총 높이 또는 거리(숫자)>
}
이 문제에 해당하는 필드만 포함. 관련 없는 필드는 생략.`,
}

export function buildSolvePrompt(
  problemText: string,
  problemType: ProblemType,
  difficultyType: DifficultyType,
): string {
  return `당신은 친절한 한국 고등학교 수학 선생님입니다. 학생이 막혀 있어 맞춤형 도움이 필요합니다.

문제 (한국어):
${problemText}

문제 유형: ${problemType}
학생의 어려움: ${difficultyType}

지도 방향: ${DIFFICULTY_HINTS[difficultyType]}

이 학생의 어려움에 맞는 단계별 풀이를 생성해주세요. 반드시 아래 JSON 형식으로만 반환해. 마크다운 코드 펜스나 다른 텍스트 없이 순수 JSON만 출력할 것.
(Return ONLY valid JSON, no markdown fences)

수학 풀이 원칙 (단계 구성 시 반드시 준수):
- 풀이 전 과정에서 계수는 정수로 유지; 풀이 중간에 소수나 가분수로 변환하지 말 것
- 인수분해가 가능하면 반드시 인수분해를 사용; 인수분해가 불가능한 경우에만 근의 공식 사용
- ax²+bx+c 형태의 이차식 인수분해는 반드시 "곱셈 교차 분해법"을 사용할 것:
  * (px+q)(rx+s)로 인수분해할 때 p×r = a, q×s = c를 만족하는 정수 쌍을 찾고
  * 교차 곱 ps + qr = b가 되는지 확인하는 방식
  * 단계 설명 시 "p와 r의 곱이 a, q와 s의 곱이 c, 교차 곱의 합이 b가 되는 쌍을 찾는다"고 명시할 것
  * 예시(3x²+11x+6): (x, 3x)와 (3, 2) 조합 → 교차 곱 x×2+3x×3 = 2x+9x = 11x → (x+3)(3x+2)
- 학생이 손으로 직접 풀 때의 순서와 동일하게 단계 구성; 건너뛰지 말 것
- 이항, 통분, 공통인수 묶기 등 모든 중간 단계를 명시적으로 표현
- 최종 답은 가장 간단한 정수 또는 분수 형태로 표현 (예: x = -1/2, x = -0.5로 쓰지 말 것)

아래 JSON 형식으로 출력해:
{
  "steps": [
    {
      "desc": "이 단계에서 무엇을 하는지, 왜 하는지 한국어로 설명",
      "latex": "이 단계에서 계산한 LaTeX 수식 (설명만으로 충분하면 빈 문자열)",
      "note": "이 학생에게 도움이 되는 선택적 한국어 힌트나 통찰 (불필요하면 생략)"
    }
  ],
  ${VISUAL_DATA_INSTRUCTIONS[problemType]},
  "stuckExplanation": "이 문제 유형에서 이 어려움 지점에 학생들이 주로 막히는 이유를 1~2문장 한국어로 설명"
}

규칙:
- desc, note, stuckExplanation은 모두 한국어로 작성
- 3~6단계 포함; 각 단계는 풀이를 실질적으로 진전시켜야 함
- latex는 유효한 LaTeX 형식으로 (\\frac, ^, _, \\sqrt 등 사용)
- 반드시 JSON만 출력. 다른 텍스트 없음.`
}

export function buildChatPrompt(problemText: string): string {
  return `너는 친절한 고등학교 수학 선생님이야.
학생이 아래 문제를 풀고 있어:

${problemText}

학생의 질문에 한국 고등학교 교육과정에 맞게 친절하고 간결하게 답해줘.
수식은 LaTeX(\\( \\) 형식)로 표현해줘.
답변은 3~5문장 이내로 간결하게 해줘.`
}
