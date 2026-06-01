import type { DifficultyType, ProblemType } from '../schemas/mathSchema.js'

export function buildAnalyzePrompt(): string {
  return `당신은 한국 고등학교 수학 문제 이미지를 분석하는 AI입니다.

문제를 추출하고 유형을 분류해주세요. 반드시 아래 JSON 형식으로만 반환해. 마크다운 코드 펜스나 다른 텍스트 없이 순수 JSON만 출력할 것.
(Return ONLY valid JSON, no markdown fences)

분류 기준 (우선순위 순서로 판단):
1. "graph" 유형:
   - 함수의 극값, 최댓값·최솟값, 개형을 묻는 문제
   - 미분을 통해 증감표를 작성해야 하는 문제
   - 두 함수의 교점, 넓이를 구하는 문제
   - 함수 그래프의 특징(점근선, 대칭축 등)을 묻는 문제

2. "application" 유형:
   - 경우의 수, 순열, 조합, 확률을 구하는 문제
   - 수열, 점화식 문제
   - 문제 상황을 표·그림·수형도로 정리해야 하는 문제

3. "formula" 유형 (위 두 유형에 해당하지 않는 경우):
   - 방정식, 부등식을 풀어 답을 구하는 문제
   - 치환, 인수분해, 근의 공식 등 대수적 계산이 주인 문제
   - 지수·로그·삼각 방정식 등

경계 케이스 판단 기준:
- 지수방정식/로그방정식 → formula (그래프보다 대수 계산이 핵심)
- 삼각함수 방정식 → formula
- 삼각함수 그래프의 특징 → graph
- 확률 계산 → application
- 미분·적분 계산만 → formula, 그래프 개형 → graph

아래 JSON 형식으로만 출력해:
{
  "problemType": "formula",
  "problemText": "이미지에 적힌 문제 전체 텍스트(한국어 그대로, 수식은 LaTeX로 변환)",
  "latex": "주요 수식을 LaTeX로 표현 (예: f(x) = x^2 - 2x + 1)",
  "confidence": 90,
  "problemSummary": "과목명 - 문제 유형 요약 (예: 대수 - 로그방정식, 공통수학1 - 이차부등식, 공통수학2 - 함수의 극값)"
}

규칙:
- problemText: 이미지에 보이는 텍스트를 정확히 그대로 복사, 한국어 보존. 수학 수식은 반드시 LaTeX 형식으로 변환해서 출력하세요. 인라인 수식은 $...$로, 블록 수식은 $$...$$로 감싸세요. 예: (1/3^15)^(1/n) → $\\\\left(\\\\frac{1}{3^{15}}\\\\right)^{\\\\frac{1}{n}}$
- latex: 주요 수식만 LaTeX 표기로 변환; 표준 LaTeX 표기법 사용
- confidence: 분류 확신도를 정수(0~100)로 표현 (90 이상=매우 명확, 70~89=대체로 명확, 70 미만=모호하거나 이미지 불선명)
- problemSummary: "과목명 - 주제" 형식으로 한국어 요약. 과목명은 고등학교 수학 교육과정 기준 (공통수학1, 공통수학2, 대수, 미적분, 확률과통계, 기하 중 하나), 주제는 구체적인 문제 유형 (예: 지수방정식, 이차부등식, 함수의 극값, 확률 계산 등)
- JSON 이스케이프 규칙: LaTeX 명령어의 역슬래시(\\)는 JSON 문자열 안에서 반드시 \\\\(이중 역슬래시)로 출력. 예: \\frac → \\\\frac, \\sqrt → \\\\sqrt, \\left → \\\\left
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
  "expression": "Desmos용 LaTeX 함수식, 반드시 y = f(x) 형태 (최종 계산된 수치 대입, 예: y = x^2 - 4x + 3)",
  "restrictedDomain": "정의역 제한 조건 (Desmos 조건식, 예: x > 0, 0 \\\\le x \\\\le 3). 제한 없으면 생략",
  "vertex": [vx, vy],
  "extremumLabel": "최솟값 또는 최댓값 표기 문자열 (예: 최솟값 = -1, 최댓값 = 5). 없으면 생략",
  "roots": [x1, x2]
}
주의:
- expression은 반드시 최종 수치(k=2 등 풀이로 얻은 값)를 대입한 결과로 작성할 것. 미지수 k가 남아 있으면 안 됨.
- 합성함수에서 치환 후 그래프를 그릴 경우, 치환 변수를 x로 교체하여 y = f(x) 형태로 작성 (예: t = (1/2)^x 치환 → y = x^2 - 4x + 3, x > 0).
- vertex, roots, extremumLabel, restrictedDomain은 존재하지 않거나 관련 없으면 생략.`,
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

단계별 함수 그래프 시각화 지침:
아래 경우에 해당하는 단계에는 반드시 다음 두 필드를 추가할 것:
  "graphType": "function",
  "expression": "<Desmos 호환 LaTeX 수식, 반드시 y = ... 형태로, x를 독립변수로 사용>"

추가해야 하는 경우:
1. 치환(substitution) 도입 단계: 합성함수의 안쪽 함수를 t = g(x)로 치환할 때, g(x)의 그래프(y = g(x))를 추가해 t의 범위를 시각적으로 보여줄 것
   예) t = (1/2)^x로 치환 → "expression": "y = \\left(\\frac{1}{2}\\right)^{x}"
2. 치환 변수의 범위 확인 단계: x의 전체 범위에서 t = g(x)가 어떤 값을 갖는지 그래프로 보여줄 때
3. 지수·로그·삼각함수의 그래프 특성이 풀이의 핵심인 단계

주의: expression은 반드시 y = ... 형태의 Desmos LaTeX이어야 하며, 숫자 분수는 \\frac으로, 지수는 ^{}으로 표기할 것. 상수 k처럼 문제에서 구해야 하는 미지수는 expression에 포함하지 말 것.

이차부등식 특별 지침 (문제가 ax²+bx+c > 0, ≥ 0, < 0, ≤ 0 형태를 포함하는 경우):
- 해의 범위를 결정하는 단계에 반드시 다음 추가 필드를 포함할 것:
  * "graphType": "quadratic_inequality" (고정값)
  * "expression": 이차함수 f(x) 식을 Desmos LaTeX 형식으로 (예: "x^{2}-5x+4", "2x^{2}+3x-5")
  * "satisfiedRange": 부등식을 만족하는 x 범위 배열 (Desmos 조건식 형식)
    - 내부 구간인 경우: ["r1 < x < r2"] (예: ["1 < x < 4"])
    - 외부 구간인 경우: ["x < r1", "x > r2"] (예: ["x < 1", "x > 4"])
    - 등호 포함 시: ["r1 \\le x \\le r2"] 또는 ["x \\le r1", "x \\ge r2"]

아래 JSON 형식으로 출력해:
{
  "steps": [
    {
      "summary": "이 단계를 한 줄로 요약 (예: '치환 적용', '인수분해', '근의 공식 적용', '해의 범위 확인')",
      "desc": "이 단계에서 무엇을 하는지, 왜 하는지 한국어로 설명",
      "latex": "이 단계에서 계산한 LaTeX 수식 (설명만으로 충분하면 빈 문자열)",
      "note": "이 학생에게 도움이 되는 선택적 한국어 힌트나 통찰 (불필요하면 생략)",
      "keyFormula": "이 단계에서 사용한 수학 공식의 이름과 일반형을 LaTeX로 표현. 반드시 문제 고유의 수치 없이 일반식으로 쓸 것. 예: 완전제곱식 a^2 - 2ab + b^2 = (a-b)^2, 근의 공식 x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}, 로그 성질 \\log_a MN = \\log_a M + \\log_a N. 일반적으로 알려진 공식이 없는 단계는 생략"
    }
  ],
  ${VISUAL_DATA_INSTRUCTIONS[problemType]},
  "stuckExplanation": "이 문제 유형에서 이 어려움 지점에 학생들이 주로 막히는 이유를 1~2문장 한국어로 설명"
}

규칙:
- summary, desc, note, stuckExplanation은 모두 한국어로 작성
- desc와 note에 수식이 등장하면 반드시 KaTeX 문법 사용: 인라인은 $...$, 블록은 $$...$$
  예) "근과 계수의 관계에서 $\\\\alpha + \\\\beta = 5$임을 이용한다"
- 3~6단계 포함; 각 단계는 풀이를 실질적으로 진전시켜야 함
- latex는 유효한 LaTeX 형식으로 (\\\\frac, ^, _, \\\\sqrt 등 사용)
- latex 필드에서 여러 계산 단계를 나열할 때 \\Rightarrow(⇒) 등의 화살표로 가로로 연결하지 말 것. 반드시 LaTeX 줄바꿈(\\\\\\\\)으로 세로로 나열할 것. 예: -k^2+3=-1 \\\\\\\\ k^2=4 \\\\\\\\ k=\\\\pm 2 \\\\\\\\ k=2
- note는 반드시 한 문장(30자 이내)으로 작성. 줄바꿈 없이 핵심 포인트만 간결하게.
- JSON 이스케이프 규칙: LaTeX 명령어의 역슬래시(\\)는 JSON 문자열 안에서 반드시 \\\\(이중 역슬래시)로 출력. 예: \\frac → \\\\frac, \\sqrt → \\\\sqrt, \\alpha → \\\\alpha, \\left → \\\\left
- 반드시 JSON만 출력. 다른 텍스트 없음.`
}

export function buildExplainPrompt(stepDesc: string, stepIndex: number): string {
  return `당신은 친절한 한국 고등학교 수학 선생님입니다.

다음은 수학 풀이의 ${stepIndex + 1}단계입니다:
${stepDesc}

고등학생이 이 단계를 이해하지 못했습니다. 더 쉽고 구체적으로, 예시를 들어가며 재설명해주세요.
- 왜 이 단계가 필요한지 먼저 설명하세요
- 계산 과정을 한 줄씩 천천히 풀어서 설명하세요
- KaTeX 형식의 수식을 사용하세요. 인라인 수식은 $...$, 블록 수식은 $$...$$로 감싸세요
- 3~5문장으로 간결하게, 하지만 핵심을 빠뜨리지 말고 설명하세요
- 마크다운 코드 펜스 없이 텍스트만 출력하세요`
}

export function buildChatPrompt(problemText: string): string {
  return `너는 친절한 고등학교 수학 선생님이야.
학생이 아래 문제를 풀고 있어:

${problemText}

학생의 질문에 한국 고등학교 교육과정에 맞게 친절하고 간결하게 답해줘.
모든 수식은 반드시 KaTeX 문법으로 출력해. 인라인 수식은 $...$, 블록 수식은 $$...$$로 감싸.
예) $f'(x) = 0$, $$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$
답변은 3~5문장 이내로 간결하게 해줘.`
}
