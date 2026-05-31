export type { DifficultyType, ProblemType } from '../types/math'

export interface Difficulty {
  code: DifficultyType
  title: string
  desc: string
  icon: string
}

export interface SampleStep {
  desc: string
  latex: string
  note?: string
}

export interface GraphConfig {
  a?: number
  b?: number
  c?: number
  coefficients?: number[]
  roots?: number[]
  vertex?: [number, number]
  extrema?: { x: number; y: number; type: 'max' | 'min' }[]
  param?: { key: string; label: string; min: number; max: number; step: number; value: number }
}

export interface AnimConfig {
  // water tank animation
  fillSeconds?: number
  heightCm?: number
  rate?: number
  // dice probability animation
  totalCases?: number
  favorable?: [number, number][]
}

export interface ChatConfig {
  hello: string
  suggestions: string[]
  replies: Record<string, string>
}

export interface Problem {
  id: string
  type: ProblemType
  typeLabel: string
  typeDesc: string
  fname: string
  confidence: number
  qno: string
  qtext: string
  qtextLatex: string
  qtail?: string
  qtail2?: string
  qtextLatex2?: string
  title: string
  thumb: string
  defaultDifficulty: DifficultyType
  steps: SampleStep[]
  stuck: Partial<Record<DifficultyType, string>>
  chat: ChatConfig
  graph?: GraphConfig
  anim?: AnimConfig
}

export const DIFFICULTIES: Difficulty[] = [
  { code: 'understanding', title: '문제 이해', desc: '문제가 무슨 말인지부터 모르겠어요', icon: 'help' },
  { code: 'strategy', title: '풀이 전략', desc: '이해는 했는데 어떻게 시작할지 막막해요', icon: 'compass' },
  { code: 'midway', title: '풀이 중간', desc: '어느 정도 풀다가 중간에 막혔어요', icon: 'flag' },
  { code: 'visual', title: '시각적 이해', desc: '그림·그래프로 직접 보고 싶어요', icon: 'eye' },
]

export const PROBLEMS: Record<string, Problem> = {
  graph: {
    id: 'graph',
    type: 'graph',
    typeLabel: '함수·그래프형',
    typeDesc: '함수의 모양과 극값을 시각적으로 이해해야 하는 문제예요.',
    fname: 'cubic_function.png',
    confidence: 95,
    qno: '문제 5.',
    qtext: '함수',
    qtextLatex: 'f(x) = x^{3} - 3x',
    qtail: '의 극값을 구하시오.',
    title: '삼차함수의 극값',
    thumb: 'x³−3x',
    defaultDifficulty: 'visual',
    graph: {
      coefficients: [1, 0, -3, 0],
      roots: [-1.732, 0, 1.732],
      extrema: [
        { x: -1, y: 2, type: 'max' },
        { x: 1, y: -2, type: 'min' },
      ],
    },
    steps: [
      { desc: '극값을 구하려면 먼저 도함수 f\'(x)를 구해요.', latex: "f'(x) = 3x^{2} - 3" },
      { desc: "f'(x) = 0 인 x를 구하면 극값 후보가 나옵니다.", latex: "3x^{2} - 3 = 0 \\Rightarrow x^{2} = 1 \\Rightarrow x = \\pm 1" },
      { desc: "증감표를 그려 f'(x)의 부호 변화를 확인해요. x = −1 좌우에서 부호가 +→−로 바뀌므로 극대, x = 1 좌우에서 −→+로 바뀌므로 극소입니다.", latex: '', note: 'x=−1에서 극대, x=1에서 극소' },
      { desc: 'x = −1을 대입해 극댓값을 구합니다.', latex: 'f(-1) = (-1)^{3} - 3 \\times (-1) = -1 + 3 = 2', note: '극댓값: 2' },
      { desc: 'x = 1을 대입해 극솟값을 구합니다.', latex: 'f(1) = 1^{3} - 3 \\times 1 = 1 - 3 = -2', note: '극솟값: −2' },
    ],
    stuck: {
      visual: "'<b>시각적 이해</b>'를 골랐으니, 그래프로 먼저 볼게요. 오른쪽 그래프에서 <b>보라색 점</b>이 극댓값(꼭대기)과 극솟값(바닥)이에요. 함수가 올라가다가 내려가는 전환점, 내려가다가 올라가는 전환점을 찾는 게 핵심이에요.",
      understanding: "'극값'은 함수가 증가하다가 감소로 바뀌거나, 감소하다가 증가로 바뀌는 순간의 함숫값이에요. 극댓값은 주변보다 높은 값, 극솟값은 주변보다 낮은 값이에요.",
      strategy: "전략은 도함수를 구한 뒤 f'(x)=0이 되는 x를 찾고, 그 점에서 증감이 어떻게 변하는지 증감표로 정리하는 거예요.",
      midway: "도함수 f'(x)=3x²−3=0에서 x=±1까지 구했다면, 각 x값을 원래 식 f(x)에 대입해 극댓값과 극솟값을 구하면 돼요.",
    },
    chat: {
      hello: '이 문제는 삼차함수 \\(f(x)=x^3-3x\\)의 극값을 구하는 문제예요. 오른쪽 그래프에서 보라색 점(극대·극소)을 보면서 따라와 보세요. 궁금한 점이 있으면 편하게 물어봐요!',
      suggestions: ['극값과 최댓값의 차이가 뭔가요?', '증감표는 어떻게 만드나요?', '도함수가 0이면 항상 극값인가요?'],
      replies: {
        '극값과 최댓값의 차이가 뭔가요?': "극값은 주변 값보다 크거나 작다는 '지역적' 개념이에요. 최댓값·최솟값은 정의역 전체에서 가장 큰/작은 값이죠. 삼차함수처럼 양 끝이 \\(\\pm\\infty\\)로 뻗는 경우 극값은 있어도 최댓값·최솟값은 없을 수 있어요.",
        '증감표는 어떻게 만드나요?': "f'(x)=0이 되는 x값들로 구간을 나눈 뒤, 각 구간에서 f'(x)의 부호(+면 증가↑, −면 감소↓)를 채워요. 부호가 +→−로 바뀌는 곳이 극대, −→+로 바뀌는 곳이 극소예요.",
        '도함수가 0이면 항상 극값인가요?': '아니에요! \\(f(x)=x^3\\)에서 \\(f\'(0)=0\\)이지만 부호 변화 없이 계속 증가해요. 증감표에서 부호가 실제로 바뀌어야만 극값이 돼요.',
        _default: "핵심은 f'(x)=0인 점에서 부호가 바뀌는지 확인하는 거예요. x=−1에서 +→−이면 극대, x=1에서 −→+이면 극소. 그래프의 보라색 점이 바로 그 위치예요.",
      },
    },
  },

  application: {
    id: 'application',
    type: 'application',
    typeLabel: '확률·통계형',
    typeDesc: '경우의 수를 직접 나열하거나 표로 정리해야 하는 문제예요.',
    fname: 'dice_probability.png',
    confidence: 92,
    qno: '문제 12.',
    qtext: '1부터 6까지의 눈이 있는 주사위를 두 번 던질 때, 두 눈의 합이 8 이상인 경우의 수를 구하시오.',
    qtextLatex: '',
    qtail: '',
    title: '주사위 두 번, 합이 8 이상인 경우의 수',
    thumb: '주사위 확률',
    defaultDifficulty: 'strategy',
    anim: {
      totalCases: 36,
      favorable: [
        [2, 6], [3, 5], [3, 6], [4, 4], [4, 5], [4, 6],
        [5, 3], [5, 4], [5, 5], [5, 6], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6],
      ],
    },
    steps: [
      { desc: '주사위를 두 번 던질 때 나올 수 있는 전체 경우의 수는 6×6=36가지예요.', latex: '6 \\times 6 = 36' },
      { desc: '두 눈의 합이 8이 되는 경우를 (첫 번째, 두 번째) 순서쌍으로 나열합니다.', latex: '(2,6),\\ (3,5),\\ (4,4),\\ (5,3),\\ (6,2)', note: '합이 정확히 8인 경우: 5가지' },
      { desc: '합이 9, 10, 11, 12인 경우도 빠짐없이 나열해요.', latex: '(3,6),\\ (4,5),\\ (4,6),\\ (5,4),\\ (5,5),\\ (5,6),\\ (6,3),\\ (6,4),\\ (6,5),\\ (6,6)', note: '합이 9~12인 경우: 10가지' },
      { desc: '조건을 만족하는 경우의 수를 모두 더하면 답이 나와요.', latex: '5 + 10 = 15', note: '정답: 15' },
    ],
    stuck: {
      strategy: "'<b>풀이 전략</b>'이 막혔군요. 핵심은 '합이 8 이상'인 (첫째 눈, 둘째 눈) 쌍을 빠짐없이 나열하는 거예요. 아래 6×6 표에서 초록색으로 하이라이트되는 칸들이 바로 조건을 만족하는 경우예요.",
      understanding: "주사위를 두 번 던지면 (첫 번째 눈, 두 번째 눈)으로 나타낼 수 있어요. 예를 들어 (2, 6)은 첫 번째에 2, 두 번째에 6이 나온 경우고, 합은 8이에요.",
      midway: "합이 8이 되는 5가지까지 찾았다면, 합이 9, 10, 11, 12인 경우도 빠짐없이 추가해야 해요. 아래 표에서 하이라이트된 15개 칸을 확인하세요.",
      visual: "6×6 표에서 각 칸의 (행+열) 합이 8 이상인 칸을 찾으면 돼요. 초록색으로 칠해진 15개 칸이 바로 그 경우들이에요.",
    },
    chat: {
      hello: '주사위를 두 번 던질 때 두 눈의 합이 8 이상인 경우를 아래 6×6 표에서 확인해 보세요. ▶︎를 눌러 해당하는 칸들이 하나씩 하이라이트되는 걸 보면 15가지가 나와요! 궁금한 점 편하게 물어봐요.',
      suggestions: ['왜 전체 경우의 수가 36인가요?', '(6,2)와 (2,6)은 다른 경우인가요?', '합이 정확히 8인 경우는 몇 가지예요?'],
      replies: {
        '왜 전체 경우의 수가 36인가요?': '첫 번째 주사위 눈이 6가지, 두 번째 주사위 눈도 6가지예요. 두 사건이 독립적으로 일어나므로 곱의 법칙으로 \\(6\\times6=36\\)가지가 돼요.',
        '(6,2)와 (2,6)은 다른 경우인가요?': '네, 다른 경우예요! 첫 번째 던진 주사위가 6이고 두 번째가 2인 경우와, 첫 번째가 2이고 두 번째가 6인 경우는 순서가 다른 별개의 사건이에요.',
        '합이 정확히 8인 경우는 몇 가지예요?': '합이 정확히 8인 경우는 \\((2,6),\\ (3,5),\\ (4,4),\\ (5,3),\\ (6,2)\\)로 5가지예요. 이것들만 따로 센 다음, 합이 9 이상인 경우(10가지)를 더하면 총 15가지가 돼요.',
        _default: "표에서 오른쪽 아래 삼각형 영역이 합≥8인 칸들이에요. 합=8인 대각선부터 시작해 합=12인 맨 오른쪽 아래 모서리까지 모두 세면 15가지예요.",
      },
    },
  },

  formula: {
    id: 'formula',
    type: 'formula',
    typeLabel: '단순 수식형',
    typeDesc: '직접 계산해서 답을 구하는 방정식·부등식 문제예요.',
    fname: 'screenshot_eq.png',
    confidence: 98,
    qno: '문제 7.',
    qtext: '다음 이차방정식을 푸시오.',
    qtextLatex: '2x^{2} - 5x - 3 = 0',
    qtail: '',
    title: '이차방정식 풀기',
    thumb: '2x²−5x−3',
    defaultDifficulty: 'midway',
    steps: [
      { desc: '곱셈 교차 분해법을 사용합니다. a=2, c=−3이므로 p×r=2, q×s=−3이 되는 정수 쌍을 찾아요.', latex: '2x^{2} - 5x - 3 = (px+q)(rx+s)' },
      { desc: '(p,r)=(1,2), (q,s)=(1,−3) 조합을 시도합니다. 교차 곱 ps+qr = 1×(−3)+1×2 = −1 (불일치)', latex: '1 \\times (-3) + 1 \\times 2 = -1 \\neq -5' },
      { desc: '(p,r)=(1,2), (q,s)=(3,−1) 조합을 시도합니다. 교차 곱 ps+qr = 1×(−1)+3×2 = 5 → 부호 조정', latex: '1 \\times (-1) + 3 \\times 2 = 5', note: '음수로 조정: (q,s)=(−3,1) → 교차 곱 −5 (일치!)' },
      { desc: '(1x−3)(2x+1) 조합이 맞아요. 두 인수를 0으로 놓고 풉니다.', latex: '(x - 3)(2x + 1) = 0' },
      { desc: '각각을 0으로 놓으면 두 근이 나옵니다.', latex: 'x = 3 \\quad \\text{또는} \\quad x = -\\tfrac{1}{2}', note: '정답: x = 3, −1/2' },
    ],
    stuck: {
      midway: "'<b>풀이 중간</b>'에서 막혔군요. 교차 분해법의 핵심은 p×r=a, q×s=c이면서 교차 곱 ps+qr=b가 되는 쌍을 찾는 거예요. 여러 조합을 시도하다 보면 딱 맞는 쌍이 나와요.",
      understanding: '이차방정식 \\(2x^2-5x-3=0\\)을 만족하는 x값(=해)을 모두 찾는 문제예요.',
      strategy: '인수분해가 핵심 전략이에요. 교차 분해법으로 두 일차식의 곱으로 나타내면 해를 바로 구할 수 있어요.',
      visual: '각 단계의 식 변화를 위에서 아래로 천천히 따라오면 흐름이 보여요.',
    },
    chat: {
      hello: '이차방정식 \\(2x^2-5x-3=0\\)을 교차 분해법으로 풀어볼게요. 오른쪽 단계를 \'다음 단계\' 버튼으로 하나씩 넘기면서 따라와 보세요. 막히는 단계가 있으면 물어봐요!',
      suggestions: ['교차 분해법이 뭔가요?', '근의 공식으로 풀면?', '검산은 어떻게 해요?'],
      replies: {
        '교차 분해법이 뭔가요?': '\\(ax^2+bx+c\\)를 \\((px+q)(rx+s)\\)로 인수분해할 때, p×r=a, q×s=c이면서 교차 곱 ps+qr=b가 되는 정수 쌍을 찾는 방법이에요. 여러 조합을 시도하다 맞는 쌍을 찾으면 돼요.',
        '근의 공식으로 풀면?': '\\(x=\\frac{5\\pm\\sqrt{25+24}}{4}=\\frac{5\\pm7}{4}\\) 이므로 \\(x=3\\) 또는 \\(x=-\\tfrac12\\). 인수분해와 똑같은 답이 나와요.',
        '검산은 어떻게 해요?': '구한 해를 원래 식에 넣어요. \\(x=3\\): \\(2(9)-15-3=0\\) ✓, \\(x=-\\tfrac12\\): \\(2(\\tfrac14)+\\tfrac52-3=0\\) ✓.',
        _default: "교차 분해법의 핵심은 p×r=2, q×s=−3이면서 교차 곱 ps+qr=−5가 되는 쌍 (1,2)×(−3,1)을 찾는 거예요. 단계별 풀이를 하나씩 넘겨보며 확인해 보세요!",
      },
    },
  },
}
