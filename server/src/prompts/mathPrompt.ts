import type { DifficultyType, ProblemType, Step } from '../schemas/mathSchema.js'

// [1단계 프롬프트] 이미지에서 문제 텍스트와 LaTeX를 추출하고, 우선순위 규칙으로 formula/graph/application 유형을 분류
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
  "problemSummary": "과목명 - 문제 유형 요약 (예: 대수 - 로그방정식, 공통수학1 - 이차부등식, 공통수학2 - 함수의 극값)",
  "hasFigure": false
}

규칙:
- problemText: 이미지에 보이는 텍스트를 정확히 그대로 복사, 한국어 보존. 수학 수식은 반드시 LaTeX 형식으로 변환해서 출력하세요. 인라인 수식은 $...$로, 블록 수식은 $$...$$로 감싸세요. 예: (1/3^15)^(1/n) → $\\\\left(\\\\frac{1}{3^{15}}\\\\right)^{\\\\frac{1}{n}}$
- latex: 주요 수식만 LaTeX 표기로 변환; 표준 LaTeX 표기법 사용
- confidence: 분류 확신도를 정수(0~100)로 표현 (90 이상=매우 명확, 70~89=대체로 명확, 70 미만=모호하거나 이미지 불선명)
- problemSummary: "과목명 - 주제" 형식으로 한국어 요약. 과목명은 고등학교 수학 교육과정 기준 (공통수학1, 공통수학2, 대수, 미적분, 확률과통계, 기하 중 하나), 주제는 구체적인 문제 유형 (예: 지수방정식, 이차부등식, 함수의 극값, 확률 계산 등)
- hasFigure: 이미지에 꼭짓점 레이블(A, B, C 등)이 붙은 기하 도형(삼각형, 사각형, 원, 직선도형 등)이 그려져 있으면 true, 그래프나 표가 아닌 순수 기하 도형 그림이 기준. 순수 텍스트 문제이면 false.
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
  "roots": [다항방정식 f(x)=0의 실수 근 배열 (있는 경우에만); 실근이 없으면 생략],
  "vertex": [이차식인 경우 꼭짓점 [vx, vy]; 해당 없으면 생략],
  "expression": "부등식 문제인 경우: f(x) 부분만 Desmos LaTeX로 (예: x^2-5x+4, \\\\left|x-2\\\\right|-3). 부등식이 아니면 생략",
  "inequalityExpr": "부등식 문제인 경우: 부등호 포함 완전한 Desmos LaTeX 부등식 (예: x^2-5x+4\\\\le0, 2x-3\\\\gt0, \\\\left|x-2\\\\right|\\\\lt3). 부등식이 아니면 생략"
}
규칙:
- expression과 inequalityExpr은 부등식(>, <, ≥, ≤)이 핵심인 문제에서만 반드시 포함
- inequalityExpr은 Desmos에서 직접 입력 가능한 형태로 (부호는 \\\\le \\\\ge \\\\lt \\\\gt 사용)
- roots, vertex, expression, inequalityExpr 모두 해당 없으면 생략`,
  graph: `"visualData": {
  "type": "graph",
  "expression": "Desmos용 LaTeX 함수식, 반드시 y = f(x) 형태 (최종 계산된 수치 대입)",
  "restrictedDomain": "정의역 제한 조건 (Desmos 조건식, 예: 0 \\\\le x \\\\le 2\\\\pi). 없으면 생략",
  "roots": [x1, x2, ...],
  "vertex": [vx, vy],
  "extremumLabel": "단일 극값 표기 문자열 (예: 최솟값 = -1). 없으면 생략",
  "asymptotes": ["Desmos LaTeX x값", ...],
  "extrema": [
    {"x": 소수값, "y": 소수값, "type": "max", "label": "최댓값 (표기)"},
    {"x": 소수값, "y": 소수값, "type": "min", "label": "최솟값 (표기)"}
  ]
}

asymptotes 규칙 (삼각함수 그래프에 적용):
- tan, cot, sec, csc처럼 수직 점근선이 있는 함수에만 포함
- 표시 범위 내 점근선의 x값을 Desmos LaTeX로 작성 (예: "\\\\frac{\\\\pi}{2}", "-\\\\frac{\\\\pi}{2}")
- sin, cos처럼 점근선이 없으면 생략

extrema 규칙 (최댓값·최솟값을 구하는 문제에 적용):
- restrictedDomain 범위 내 최댓값(max)·최솟값(min) 점을 모두 포함
- x는 소수 근사값 (예: π/3 → 1.0472), y는 정확한 값
- label은 "최댓값 (π/3, 2)" 형식으로 수학 표기 사용
- 단순히 그래프 모양만 보는 문제면 생략

기타 주의사항:
- expression은 반드시 최종 수치를 대입한 결과로. 미지수가 남아 있으면 안 됨.
- 합성함수 치환 후: 치환 변수를 x로 교체하여 y = f(x) 형태로 작성.
- 해당 없는 필드는 모두 생략.`,
  application: `문제 유형에 따라 아래 두 형식 중 하나를 선택하라.

[유형 A] 경우의 수·칠하기·배치 문제 (영역이나 자리에 색·값·사람을 배정하는 문제):
"visualData": {
  "type": "application",
  "interactive": {
    "type": "coloring",
    "stepIndex": <인터랙티브를 삽입할 단계 인덱스. 첫 번째 단계(인덱스 0) 직후에 배치하면 학생이 단계 설명을 읽은 뒤 바로 체험할 수 있다.>,
    "figure": {
      "cells": [...],
      "gridRows": <총 행 수>,
      "gridCols": <총 열 수>,
      "adjacency": [["A","B"], ...]
    },
    "numColors": <사용 가능한 색·값의 수>,
    "coloringOrder": ["A", "B", "C", ...],
    "prompt": "직접 색칠해보세요! 인접한 영역은 같은 색을 쓸 수 없어요."
  }
}

■ cells 작성 규칙 (가장 중요):
  - row·col은 0부터 시작. 왼쪽 위 셀이 row=0, col=0.
  - 문제 그림에서 특정 영역이 가로로 여러 칸을 차지하면 colSpan을 그 칸 수로 설정.
  - 세로로 여러 칸을 차지하면 rowSpan을 그 칸 수로 설정.

■ 구체적 예시 — 아래 그림과 같이 3열×2행, D가 A·B 아래 두 칸을 차지하는 경우:
  ┌───┬───┬───┐
  │ A │ B │ C │  ← row=0
  ├───┴───┼───┤
  │   D   │ E │  ← row=1  (D는 col=0에서 시작, colSpan=2)
  └───────┴───┘
  올바른 cells:
  [
    {"id":"A","row":0,"col":0,"colSpan":1},
    {"id":"B","row":0,"col":1,"colSpan":1},
    {"id":"C","row":0,"col":2,"colSpan":1},
    {"id":"D","row":1,"col":0,"colSpan":2},
    {"id":"E","row":1,"col":2,"colSpan":1}
  ]
  gridRows:2, gridCols:3

■ 잘못된 예시 (절대 하지 말 것):
  × row=2, col=1처럼 그리드 범위를 벗어난 값
  × 동일한 row·col 좌표를 두 셀이 공유
  × 실제 그림에 없는 빈 칸을 하나의 셀로 만들기

■ adjacency: 직접 맞닿아 있는 영역 쌍만 포함 (대각선 접촉 제외).
  위 예시: [["A","B"],["B","C"],["A","D"],["B","D"],["C","E"],["D","E"]]
  (A와 D는 A 바로 아래가 D이므로 인접. C와 D는 C의 아래가 E이고 D와 C는 떨어져 있으므로 비인접.)

■ coloringOrder: 곱의 법칙 설명에 가장 자연스러운 순서. 제약이 적은 영역부터 시작.
  모든 영역을 반드시 포함.

■ numColors 제한: 최대 7. 문제에서 사용 가능한 색·값이 7개를 초과하면 7로 설정.

■ 경우를 나눠야 하는 문제 (cases 필드 사용):
  핵심 원칙: 비인접(non-adjacent) 영역 쌍에서 두 영역이 같은 색이냐 다른 색이냐에 따라
  나중 영역의 선택지 수가 달라지면 → 반드시 cases 배열로 경우를 분리한다.

  판단 절차:
  1. coloringOrder를 순서대로 진행할 때, 마지막 쪽 영역 중 인접하지 않은 두 영역이
     "이미 선택된 영역들의 색"에 영향을 받아 선택지 수가 달라지는가?
  2. 그렇다면 그 두 영역이 "같은 색인 경우"와 "다른 색인 경우"로 나눠 각각 계산한다.

  구체적 예 (A/B/C/D/E 문제):
  - C(row0,col2)와 D(row1,col0~1)는 인접하지 않음
  - E의 선택지는 C와 D가 같은 색이면 4가지, 다른 색이면 3가지 → cases 필수
  - 경우 1: C = D → exampleColors에 C와 D에 같은 팔레트 인덱스 지정
  - 경우 2: C ≠ D → exampleColors에 C와 D에 다른 팔레트 인덱스 지정

  출력 형식:
  "caseIntro": "<비인접 쌍과 그 이유 설명. 예: C와 D는 인접하지 않으므로 같은 색이거나 다른 색일 수 있습니다. 이에 따라 E의 선택 가능한 색의 수가 달라지므로 두 경우로 나눕니다.>",
  "cases": [
    {
      "label": "경우 1",
      "description": "C와 D의 색이 같은 경우",
      "formula": "5 × 4 × 3 × 1 × 4 = 240",
      "count": 240,
      "exampleColors": {"C": "2", "D": "2"}
    },
    {
      "label": "경우 2",
      "description": "C와 D의 색이 다른 경우",
      "formula": "5 × 4 × 3 × 3 × 3 = 540",
      "count": 540,
      "exampleColors": {"C": "2", "D": "3"}
    }
  ],
  "totalFormula": "240 + 540 = 780"

  exampleColors 규칙 (중요):
  - 반드시 "경우를 정의하는 비인접 셀 쌍"만 포함. 나머지 셀은 학생이 직접 칠한다.
  - 색상은 팔레트 인덱스 문자열: "0"=빨간, "1"=파란, "2"=초록, "3"=노란, "4"=보라, "5"=주황, "6"=청록.
  - 경우 1(같은 색): 두 셀에 동일한 인덱스 → "C":"2", "D":"2"
  - 경우 2(다른 색): 두 셀에 다른 인덱스 → "C":"2", "D":"3"
  - exampleColors에 포함된 셀은 학생이 변경할 수 없도록 잠금 처리된다.

[유형 B] 그 외 활용문제 (속도·높이·속률 등 수치 모델링):
"visualData": {
  "type": "application",
  "rate": <수치 비율>,
  "unit": "<단위 문자열, 예: m/s>",
  "totalTime": <총 시간(숫자)>,
  "totalHeight": <총 높이 또는 거리(숫자)>
}
이 문제에 해당하는 필드만 포함. 관련 없는 필드는 생략.`,
}

// [2단계 프롬프트] 어려움 유형별 힌트(DIFFICULTY_HINTS)와 문제 유형별 시각화 명세(VISUAL_DATA_INSTRUCTIONS)를 조합해
// CoT 단계별 풀이(steps)와 visualData JSON을 생성하도록 지시
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

경우의 수·칠하기 문제(application) 단계 작성 특별 규칙:
- 단계 설명(desc)에서 "A는 B와 인접하고, B는 A·C·D와 인접하고..." 식으로 인접 관계를 텍스트·수식으로 나열하지 말 것.
  → 학생은 위에 표시되는 인터랙티브 그림에서 인접 관계를 직접 확인할 수 있으므로, 설명에는 "그림에서 인접 관계를 직접 확인해보세요" 정도로만 언급하고 나열은 생략.
- latex 필드에 인접 관계 목록(A-B, B-C, ...)을 수식으로 표현하지 말 것. latex는 경우의 수 계산식에만 사용.
- 단계는 ① 문제 파악(그림 확인 안내) → ② 칠하기 전략·순서 결정 → ③ 각 영역별 경우의 수 계산 → ④ 곱의 법칙으로 최종 답 계산 흐름으로 구성.

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
핵심 원칙: 각 단계에서 "지금 이 단계가 다루는 함수"를 그래프로 보여줄 것.
원래 복잡한 합성함수 그대로가 아니라, 치환 후 단순화된 함수·도함수 등 그 단계의 핵심 식을 시각화해야 학생에게 유익하다.

아래 경우에 해당하는 단계에는 반드시 다음 두 필드를 추가할 것:
  "graphType": "function",
  "expression": "<Desmos 호환 LaTeX 수식, 반드시 y = ... 형태로, 독립변수는 x>"

추가해야 하는 경우와 올바른 expression:
1. 치환 변수 범위 확인 단계: 원래 안쪽 함수 y = g(x) 그래프로 t의 범위 시각화
   예) t = (1/2)^x → "y = \\left(\\frac{1}{2}\\right)^{x}"
2. 치환 후 새 방정식 단계: 치환으로 얻은 새 함수를 그래프로 표현. t를 x로 대체하여 작성.
   예) t² - 10t + 5 = 0 → "y = x^{2} - 10x + 5"  (x절편이 두 근 t₁, t₂임을 시각 확인)
   예) t² - 26t + 25 = 0 → "y = x^{2} - 26x + 25"
   ※ 원래 25^x - 2·5^{x+1} + 5 같은 합성함수를 그대로 그리지 말 것 — 치환 후 단순 함수를 그릴 것
3. 도함수 계산 단계: 도함수 y = f'(x) 그래프로 부호 변화(영점) 시각화
   예) f'(x) = 3x² - 3 → "y = 3x^{2} - 3"
4. 극값 판별·대입 단계: 원래 함수 y = f(x) 그래프로 극대·극소 위치 확인
   예) f(x) = x³ - 3x → "y = x^{3} - 3x"
5. 지수·로그·삼각함수 그래프 특성이 풀이의 핵심인 단계
6. 아직 구하지 못한 미지수(k, a, m 등)가 포함된 함수를 다루는 단계: expression에 미지수를 그대로 포함하고, "parameters" 배열을 함께 출력할 것.
   예) f(t) = t² - 2kt + 3 에서 k를 아직 모름 → expression: "y = x^{2} - 2kx + 3", parameters: [{"name": "k", "defaultValue": 1, "min": -5, "max": 5, "step": 0.1}]
   학생이 k 슬라이더를 조작하면서 꼭짓점이 어떻게 움직이는지 직관적으로 확인할 수 있다.

미지수 포함 그래프 시 "parameters" 필드 작성 규칙:
  "parameters": [
    {
      "name": "미지수 이름 (단일 알파벳, 예: k, a, m)",
      "defaultValue": 합리적인 초깃값 (정수 권장),
      "min": 슬라이더 최솟값,
      "max": 슬라이더 최댓값,
      "step": 0.1
    }
  ]
- parameters는 expression에 미지수가 포함된 경우에만 추가. 수치가 모두 확정된 함수라면 생략.
- 미지수가 여러 개면 배열에 여러 항목 추가.
- min/max는 문제 맥락에서 합리적인 범위로 설정.

주의: expression은 반드시 y = ... 형태의 Desmos LaTeX이어야 하며, 분수는 \\frac으로, 지수는 ^{}으로 표기할 것.

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
      "keyFormula": "이 단계에서 사용한 수학 공식의 이름과 일반형. 한글 이름 뒤에 수식은 반드시 $...$로 감쌀 것. 예: '완전제곱식 $(a-b)^2 = a^2 - 2ab + b^2$', '근의 공식 $x = \\\\frac{-b \\\\pm \\\\sqrt{b^2-4ac}}{2a}$', '로그 성질 $\\\\log_a MN = \\\\log_a M + \\\\log_a N$'. 일반적으로 알려진 공식이 없는 단계는 생략"
    }
  ],
  ${VISUAL_DATA_INSTRUCTIONS[problemType]},
  "stuckExplanation": "이 문제 유형에서 이 어려움 지점에 학생들이 주로 막히는 이유를 1~2문장 한국어로 설명. 핵심 개념·행동·수식은 **굵게** 표시할 것 (예: **치환**, **도함수를 구한 뒤**)"
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

// [심화 설명 프롬프트] 학생이 이해하지 못한 풀이 단계를 받아 더 쉬운 설명과 예시로 재설명하도록 지시
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

// [3단계 프롬프트] 문제 텍스트와 풀이 단계를 바탕으로 기하 도형의 꼭짓점·선분·각도·채우기 좌표 JSON 생성을 지시
// 좌표계: x/y 모두 0~100 범위, 각도는 삼각함수로 정확히 계산하도록 명세
export function buildDiagramPrompt(problemText: string, steps: Step[]): string {
  const stepsText = steps
    .map((s, i) => {
      let line = `${i + 1}단계: ${s.desc}`
      if (s.latex) line += `\n   계산: ${s.latex}`
      if (s.note) line += `\n   핵심: ${s.note}`
      return line
    })
    .join('\n')

  return `당신은 수학 도형 시각화 전문가입니다.

아래 문제와 풀이를 분석하여 기하학적 상황을 JSON으로 반환하세요.
**반드시 JSON만 출력하세요. 설명, 분석, 계산 과정 등 JSON 이외의 텍스트를 절대 출력하지 마세요.**

## 문제
${problemText}

## 풀이 단계
${stepsText}

---

## 좌표계 규칙

- x: 0=왼쪽, 100=오른쪽  /  y: 0=아래, 100=위 (수학 표준 좌표계)
- 도형 전체가 x: 15~85, y: 15~85 범위 내에 배치

---

## 좌표 계산 원칙

### 각도 반영 (가장 중요)
풀이에서 구한 각도를 좌표에 정확히 반영하라:
- 기준 변을 수평/수직으로 놓고, 나머지 꼭짓점은 삼각함수로 계산
- 예) ∠ABC = 30°이고 BC가 수평: B=(20,20), C=(80,20) [BC=60px]
  BA 방향 = 수평에서 30° 위: A = B + 길이 × (cos150°, sin150°) = (20-52,20+30) = (-32, 50)
  → x 범위 벗어나면 B를 재배치

### 직각 처리
한 변은 수평(y 고정), 나머지는 수직(x 고정).
예) ∠C=90°: C=(20,20), B=(80,20), A=(20,80)

### 등변·비율 처리
변의 길이 비율 = 픽셀 거리 비율 (예: AC:BC = 1:√3 → 픽셀도 1:√3)

### 선분 위의 점
D가 CA 위에 있고 CD:CA = r → D = C + r × (A − C)

### angles 배열
- rightAngle: true 꼭짓점은 angles 배열 제외
- label에 풀이에서 구한 정확한 각도 값 표기
- highlight: true는 문제에서 핵심이 되는 각도에만 사용

---

## 레이블 형식 (유니코드만 사용, LaTeX 역슬래시 금지)

√2, √3, π, α, β, θ, °, 1/2, √3/2, √2-1  (이 형식으로 작성)
금지: \\sqrt{2}, \\frac{1}{2}, \\pi, \\alpha

---

## 채우기 색상 (fills 배열)

**반드시 fills 배열을 사용하라.** 색상 선택 기준:
- 문제 이미지에 색칠된 영역이 있으면 → 동일한 색상 사용
- 도형을 분할하거나 넓이를 구하는 문제 → 각 영역을 다른 색으로 구분
- 기본 도형만 있는 경우 → "blue" 1개

사용 가능한 색상: "blue", "red", "green", "orange", "purple", "yellow", "teal"

예시 상황:
- 삼각형 ABC 전체: "fills": [{"vertices": ["A","B","C"], "color": "blue"}]
- ABC를 BD로 분할 → ABD는 red, BDC는 blue: "fills": [{"vertices":["A","B","D"],"color":"red"},{"vertices":["B","D","C"],"color":"blue"}]
- 넓이 구하는 영역 강조: "fills": [{"vertices":["A","B","C"],"color":"orange"}]

---

## JSON 형식 (이것만 출력, 다른 텍스트 없음)

{
  "description": "도형 설명",
  "fills": [{"vertices": ["A","B","C"], "color": "blue"}],
  "vertices": [
    {"name": "A", "x": 20, "y": 80},
    {"name": "B", "x": 80, "y": 20},
    {"name": "C", "x": 20, "y": 20, "rightAngle": true}
  ],
  "segments": [
    {"from": "A", "to": "B"},
    {"from": "A", "to": "C", "label": "AC = 1"},
    {"from": "B", "to": "C", "label": "BC = 1"}
  ],
  "angles": [
    {"vertex": "B", "ray1": "A", "ray2": "C", "label": "45°", "highlight": true}
  ]
}

도형이 없는 순수 계산 문제: null 출력.
JSON 이외의 텍스트 절대 금지.`
}

// [채팅 프롬프트] 현재 문제 텍스트를 시스템 컨텍스트로 고정해 학생 질문에 맥락에 맞는 수식 답변을 생성하도록 지시
export function buildChatPrompt(problemText: string): string {
  return `너는 친절한 고등학교 수학 선생님이야.
학생이 아래 문제를 풀고 있어:

${problemText}

학생의 질문에 한국 고등학교 교육과정에 맞게 친절하고 간결하게 답해줘.
모든 수식은 반드시 KaTeX 문법으로 출력해. 인라인 수식은 $...$, 블록 수식은 $$...$$로 감싸.
예) $f'(x) = 0$, $$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$
답변은 3~5문장 이내로 간결하게 해줘.`
}
