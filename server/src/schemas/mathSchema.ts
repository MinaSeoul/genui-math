// formula: 방정식·부등식, graph: 함수 그래프, application: 경우의 수·활용
export type ProblemType = 'formula' | 'graph' | 'application'
// understanding: 문제 이해 못함, strategy: 풀이 전략 모름, midway: 중간에 막힘, visual: 시각적 이해 필요
export type DifficultyType = 'understanding' | 'strategy' | 'midway' | 'visual'

// [1단계 응답] 이미지 분석 결과: 문제 텍스트, 유형 분류, LaTeX, 기하 도형 존재 여부
export interface AnalyzeImageResponse {
  problemType: ProblemType
  problemText: string
  latex: string
  confidence: number
  problemSummary?: string
  hasFigure?: boolean  // 이미지에 꼭짓점 레이블이 붙은 기하 도형이 있으면 true
}

export interface GraphParameter {
  name: string
  defaultValue: number
  min?: number
  max?: number
  step?: number
}

// [2단계 응답] 단계별 풀이의 각 스텝 — 설명, LaTeX 수식, 단계별 그래프 표현을 포함
export interface Step {
  desc: string
  latex: string
  note?: string
  keyFormula?: string
  graphType?: string
  expression?: string
  satisfiedRange?: string[]
  parameters?: GraphParameter[]  // 미지수(k, a 등)가 있을 때 Desmos 슬라이더로 렌더링
}

export interface FormulaVisualData {
  type: 'formula'
  roots?: number[]
  vertex?: [number, number]
  expression?: string      // f(x) 표현식 (부등식 문제인 경우)
  inequalityExpr?: string  // Desmos 부등식 표현, e.g. "x^2-5x+4\\le0"
}

export interface GraphExtremum {
  x: number          // 소수 근사값 (Desmos 점 위치용)
  y: number
  type: 'max' | 'min'
  label: string      // 표시 레이블, 예: "최댓값 (π/3, 2)"
}

export interface GraphVisualData {
  type: 'graph'
  expression: string
  domain?: [number, number]
  roots?: number[]
  vertex?: [number, number]
  restrictedDomain?: string
  extremumLabel?: string
  asymptotes?: string[]      // 점근선 x값 Desmos 표현, 예: ["\\frac{\\pi}{2}", "-\\frac{\\pi}{2}"]
  extrema?: GraphExtremum[]  // 최댓값·최솟값 여러 개
}

export interface ColoringCell {
  id: string
  row: number
  col: number
  rowSpan?: number
  colSpan?: number
}

export interface ColoringFigure {
  cells: ColoringCell[]
  gridRows: number
  gridCols: number
  adjacency: [string, string][]
}

export interface ColoringCase {
  label: string         // 탭 제목, 예: "경우 1"
  description: string   // 조건 설명, 예: "C와 D의 색이 같은 경우"
  formula: string       // 이 경우의 경우의 수 계산식, 예: "5 × 4 × 3 × 1 × 4 = 240"
  count: number         // 이 경우의 경우의 수, 예: 240
  exampleColors: Record<string, string>  // 조건을 보여주는 예시 색상 팔레트 인덱스 (0-based), 예: {"C":"0","D":"0"}
}

export interface ApplicationInteractiveData {
  type: 'coloring'
  stepIndex: number
  figure: ColoringFigure
  numColors: number
  coloringOrder?: string[]  // 칠하기 순서 (없으면 cells 배열 순서 사용)
  cases?: ColoringCase[]    // 경우를 나눠야 할 때만 포함 (합의 법칙)
  caseIntro?: string        // 케이스 분리 이유, 예: "C와 D는 인접하지 않으므로 같은 색이거나 다른 색일 수 있어요."
  totalFormula?: string     // 전체 합산 공식, 예: "240 + 540 = 780"
  prompt?: string
}

export interface ApplicationVisualData {
  type: 'application'
  interactive?: ApplicationInteractiveData
  rate?: number
  unit?: string
  totalTime?: number
  totalHeight?: number
}

export type VisualData = FormulaVisualData | GraphVisualData | ApplicationVisualData

export interface TrigGeomVertex {
  name: string
  x: number          // 0-100 (0=left, 100=right)
  y: number          // 0-100 (0=bottom, 100=top)
  rightAngle?: boolean
}

export interface TrigGeomSegment {
  from: string
  to: string
  label?: string
  dashed?: boolean
}

export interface TrigGeomAngle {
  vertex: string
  ray1: string
  ray2: string
  label: string
  highlight?: boolean
}

export interface TrigGeomFill {
  vertices: string[]  // 꼭짓점 이름 배열로 구성된 다각형 영역
  color: string       // 'blue' | 'red' | 'green' | 'orange' | 'purple' | 'yellow' | 'teal'
}

export interface TrigGeometry {
  description: string
  fill?: string[]           // 하위호환용 (단순 파란색 채우기)
  fills?: TrigGeomFill[]    // 여러 색깔의 채우기 영역
  vertices: TrigGeomVertex[]
  segments: TrigGeomSegment[]
  angles?: TrigGeomAngle[]
}

// [2단계 응답] 풀이 단계 배열, 문제 유형별 시각화 데이터, 학생 막힌 지점 설명을 담는 최상위 응답
export interface GenerateSolutionResponse {
  steps: Step[]
  visualData: VisualData
  stuckExplanation: string
}

// [3단계 응답] 기하 도형 좌표 데이터 — 순수 계산 문제면 null
export type GenerateDiagramResponse = TrigGeometry | null
