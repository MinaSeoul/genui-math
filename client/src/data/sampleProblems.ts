import type { DifficultyType, ProblemType } from '../types/math'
export type { DifficultyType, ProblemType }

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
  keyFormula?: string
  summary?: string
  graphType?: string
  expression?: string
  satisfiedRange?: string[]
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
  samples?: { x: number; y: number }[]
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
      {
        desc: '극값을 구하려면 먼저 도함수 $f\'(x)$를 구해요.',
        latex: "f'(x) = 3x^{2} - 3",
      },
      {
        desc: "$f'(x) = 0$ 인 $x$를 구하면 극값 후보가 나옵니다.",
        latex: "3x^{2} - 3 = 0 \\Rightarrow x^{2} = 1 \\Rightarrow x = \\pm 1",
      },
      {
        desc: "증감표를 그려 $f'(x)$의 부호 변화를 확인해요. $x = -1$ 좌우에서 부호가 +→−로 바뀌므로 극대, $x = 1$ 좌우에서 −→+로 바뀌므로 극소입니다.",
        latex: '',
        note: '$x=-1$에서 극대, $x=1$에서 극소',
      },
      {
        desc: '$x = -1$을 대입해 극댓값을 구합니다.',
        latex: 'f(-1) = (-1)^{3} - 3 \\times (-1) = -1 + 3 = 2',
        note: '극댓값: 2',
      },
      {
        desc: '$x = 1$을 대입해 극솟값을 구합니다.',
        latex: 'f(1) = 1^{3} - 3 \\times 1 = 1 - 3 = -2',
        note: '극솟값: −2',
      },
    ],
    stuck: {
      visual: "'<b>시각적 이해</b>'를 골랐으니, 그래프로 먼저 볼게요. 오른쪽 그래프에서 <b>보라색 점</b>이 극댓값(꼭대기)과 극솟값(바닥)이에요. 함수가 올라가다가 내려가는 전환점, 내려가다가 올라가는 전환점을 찾는 게 핵심이에요.",
      understanding: "'극값'은 함수가 증가하다가 감소로 바뀌거나, 감소하다가 증가로 바뀌는 순간의 함숫값이에요. 극댓값은 주변보다 높은 값, 극솟값은 주변보다 낮은 값이에요.",
      strategy: "전략은 도함수를 구한 뒤 $f'(x)=0$이 되는 $x$를 찾고, 그 점에서 증감이 어떻게 변하는지 증감표로 정리하는 거예요.",
      midway: "도함수 $f'(x)=3x^2-3=0$에서 $x=\\pm 1$까지 구했다면, 각 $x$값을 원래 식 $f(x)$에 대입해 극댓값과 극솟값을 구하면 돼요.",
    },
    chat: {
      hello: '이 문제는 삼차함수 \\(f(x)=x^3-3x\\)의 극값을 구하는 문제예요. 오른쪽 그래프에서 보라색 점(극대·극소)을 보면서 따라와 보세요. 궁금한 점이 있으면 편하게 물어봐요!',
      suggestions: ['극값과 최댓값의 차이가 뭔가요?', '증감표는 어떻게 만드나요?', '도함수가 0이면 항상 극값인가요?'],
      replies: {
        '극값과 최댓값의 차이가 뭔가요?': "극값은 주변 값보다 크거나 작다는 '지역적' 개념이에요. 최댓값·최솟값은 정의역 전체에서 가장 큰/작은 값이죠. 삼차함수처럼 양 끝이 \\(\\pm\\infty\\)로 뻗는 경우 극값은 있어도 최댓값·최솟값은 없을 수 있어요.",
        '증감표는 어떻게 만드나요?': "$f'(x)=0$이 되는 $x$값들로 구간을 나눈 뒤, 각 구간에서 $f'(x)$의 부호(+면 증가↑, −면 감소↓)를 채워요. 부호가 +→−로 바뀌는 곳이 극대, −→+로 바뀌는 곳이 극소예요.",
        '도함수가 0이면 항상 극값인가요?': '아니에요! \\(f(x)=x^3\\)에서 \\(f\'(0)=0\\)이지만 부호 변화 없이 계속 증가해요. 증감표에서 부호가 실제로 바뀌어야만 극값이 돼요.',
        _default: "$f'(x)=0$인 점에서 부호가 바뀌는지 확인하는 거예요. $x=-1$에서 +→−이면 극대, $x=1$에서 −→+이면 극소. 그래프의 보라색 점이 바로 그 위치예요.",
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
      {
        desc: '주사위를 두 번 던질 때 나올 수 있는 전체 경우의 수는 $6 \\times 6 = 36$가지예요.',
        latex: '6 \\times 6 = 36',
      },
      {
        desc: '두 눈의 합이 8이 되는 경우를 (첫 번째, 두 번째) 순서쌍으로 나열합니다.',
        latex: '(2,6),\\ (3,5),\\ (4,4),\\ (5,3),\\ (6,2)',
        note: '합이 정확히 8인 경우: 5가지',
      },
      {
        desc: '합이 9, 10, 11, 12인 경우도 빠짐없이 나열해요.',
        latex: '(3,6),\\ (4,5),\\ (4,6),\\ (5,4),\\ (5,5),\\ (5,6),\\ (6,3),\\ (6,4),\\ (6,5),\\ (6,6)',
        note: '합이 9~12인 경우: 10가지',
      },
      {
        desc: '조건을 만족하는 경우의 수를 모두 더하면 답이 나와요.',
        latex: '5 + 10 = 15',
        note: '정답: 15',
      },
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
    typeDesc: '지수방정식을 치환을 통해 이차방정식으로 변환해서 푸는 문제예요.',
    fname: 'screenshot_eq.png',
    confidence: 96,
    qno: '문제 1.',
    qtext: '방정식 ',
    qtextLatex: '25^{x} - 2 \\cdot 5^{x+1} + 5 = 0',
    qtail: '의 두 근을 α, β라 할 때, α+β의 값은?',
    title: '지수방정식과 치환',
    thumb: '25^x−2·5^{x+1}+5',
    defaultDifficulty: 'strategy',
    steps: [
      {
        desc: '$t = 5^x$로 치환합니다 ($t > 0$). $25^x = (5^x)^2 = t^2$, $5^{x+1} = 5 \\cdot 5^x = 5t$이므로 원래 방정식이 $t$에 대한 이차방정식으로 변환됩니다.',
        latex: 't^{2} - 10t + 5 = 0',
      },
      {
        desc: '근의 공식을 적용합니다.',
        latex: 't = \\frac{10 \\pm \\sqrt{100 - 20}}{2} = 5 \\pm 2\\sqrt{5}',
        note: '$t > 0$이므로 두 근 모두 유효: $5+2\\sqrt{5} > 0$, $5-2\\sqrt{5} > 0$',
      },
      {
        desc: '$t = 5^x$이므로 각 $t$ 값에서 $x$를 구합니다.',
        latex: '5^{x} = 5 + 2\\sqrt{5} \\quad \\text{또는} \\quad 5^{x} = 5 - 2\\sqrt{5}',
      },
      {
        desc: '두 근을 로그로 나타냅니다.',
        latex: '\\alpha = \\log_{5}(5 + 2\\sqrt{5}), \\quad \\beta = \\log_{5}(5 - 2\\sqrt{5})',
      },
      {
        desc: '로그의 곱셈 법칙을 이용해 $\\alpha + \\beta$를 계산합니다. $(5+2\\sqrt{5})(5-2\\sqrt{5}) = 25-20 = 5$이므로:',
        latex: '\\alpha + \\beta = \\log_{5}\\bigl[(5+2\\sqrt{5})(5-2\\sqrt{5})\\bigr] = \\log_{5} 5 = 1',
        note: '정답: 1',
      },
    ],
    stuck: {
      strategy: '치환이 핵심 전략이에요. $25^x = (5^x)^2$임을 이용해 $t = 5^x$로 놓으면 이차방정식으로 바뀌어요.',
      understanding: '지수방정식이지만, 밑을 5로 통일하면 이차방정식처럼 풀 수 있어요.',
      midway: '$t^2 - 10t + 5 = 0$까지 왔다면, 근의 공식을 쓰면 돼요. $t$값을 구한 뒤 다시 $5^x = t$로 돌아가서 $x$를 구해요.',
      visual: '각 단계의 식 변환을 위에서 아래로 천천히 따라오세요.',
    },
    chat: {
      hello: '지수방정식 \\(25^x - 2 \\cdot 5^{x+1} + 5 = 0\\)은 $t = 5^x$ 치환으로 이차방정식으로 변환해서 풀어요. 두 근의 합 $\\alpha+\\beta = 1$이 나와요. 궁금한 점 편하게 물어봐요!',
      suggestions: ['왜 t = 5^x로 치환하나요?', '근의 공식은 언제 써요?', 'α+β를 로그로 계산하는 이유는?'],
      replies: {
        '왜 t = 5^x로 치환하나요?': '$25^x = (5^x)^2$이고 $5^{x+1} = 5 \\cdot 5^x$예요. $5^x$를 $t$로 치환하면 \\(t^2 - 10t + 5 = 0\\)이라는 이차방정식이 되어서 풀기 쉬워져요.',
        '근의 공식은 언제 써요?': '인수분해가 안 될 때 사용해요. \\(t^2 - 10t + 5 = 0\\)은 정수로 인수분해되지 않으므로 근의 공식 \\(t = \\frac{10 \\pm \\sqrt{80}}{2} = 5 \\pm 2\\sqrt{5}\\)를 씁니다.',
        'α+β를 로그로 계산하는 이유는?': '\\(5^\\alpha = 5+2\\sqrt{5}\\), \\(5^\\beta = 5-2\\sqrt{5}\\)이므로 \\(\\alpha = \\log_5(5+2\\sqrt{5})\\), \\(\\beta = \\log_5(5-2\\sqrt{5})\\)예요. 로그 덧셈 법칙으로 \\(\\alpha+\\beta = \\log_5[(5+2\\sqrt{5})(5-2\\sqrt{5})] = \\log_5 5 = 1\\)이 돼요.',
        _default: '핵심은 $t = 5^x$ 치환으로 이차방정식을 만들고, 두 근 \\(t_1 = 5+2\\sqrt{5}\\), \\(t_2 = 5-2\\sqrt{5}\\)에서 각각 $x$를 구한 뒤 로그 법칙으로 $\\alpha+\\beta = 1$을 계산하는 거예요.',
      },
    },
    graph: (() => {
      const samples: { x: number; y: number }[] = []
      for (let i = 0; i <= 80; i++) {
        const x = Math.round((-1 + i * 0.05) * 100) / 100
        const t = Math.pow(5, x)
        const y = Math.round((t * t - 10 * t + 5) * 10000) / 10000
        samples.push({ x, y })
      }
      return { samples, roots: [-0.397, 1.397] }
    })(),
  },
}
