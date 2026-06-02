export type ProblemType = 'formula' | 'graph' | 'application'
export type DifficultyType = 'understanding' | 'strategy' | 'midway' | 'visual'

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
  vertices: string[]  // 꼭짓점 이름 배열
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

export interface Step {
  desc: string
  latex: string
  note?: string
  keyFormula?: string
  summary?: string
  graphType?: 'quadratic_inequality'
  expression?: string
  satisfiedRange?: string[]
}

export interface FormulaVisualData {
  type: 'formula'
  roots?: number[]
  vertex?: [number, number]
  expression?: string
  inequalityExpr?: string
}

export interface InequalityGraph {
  expression: string        // f(x) for the curve, e.g. "x^2-5x+4"
  shadeExpr: string         // Desmos inequality for shading, e.g. "x^2-5x+4\\le0"
  roots?: number[]
  vertex?: [number, number]
}

export interface GraphExtremum {
  x: number
  y: number
  type: 'max' | 'min'
  label: string
}

export interface GraphVisualData {
  type: 'graph'
  expression: string
  domain?: [number, number]
  roots?: number[]
  vertex?: [number, number]
  restrictedDomain?: string
  extremumLabel?: string
  asymptotes?: string[]
  extrema?: GraphExtremum[]
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
  formula: string       // 이 경우의 계산식
  count: number         // 이 경우의 경우의 수
  exampleColors: Record<string, string>  // 예시 색상 (팔레트 인덱스 문자열 "0"~"6")
}

export interface ApplicationInteractiveData {
  type: 'coloring'
  stepIndex: number
  figure: ColoringFigure
  numColors: number
  coloringOrder?: string[]
  cases?: ColoringCase[]    // 경우를 나눠야 할 때 (합의 법칙)
  caseIntro?: string        // 케이스 분리 이유 (비인접 쌍 설명)
  totalFormula?: string     // 전체 합산 공식
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

// 서버 응답 타입과 동일 (client/server 공유)
export interface AnalysisResult {
  problemType: ProblemType
  problemText: string
  latex: string
  confidence?: number
  problemSummary?: string
  hasFigure?: boolean
}

export interface SolutionResult {
  steps: Step[]
  visualData: VisualData
  stuckExplanation: string
}
