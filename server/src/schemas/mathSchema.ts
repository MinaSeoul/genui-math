export type ProblemType = 'formula' | 'graph' | 'application'
export type DifficultyType = 'understanding' | 'strategy' | 'midway' | 'visual'

// 1단계: 이미지 분석 응답
export interface AnalyzeImageResponse {
  problemType: ProblemType
  problemText: string
  latex: string
  confidence: number
  problemSummary?: string
}

// 2단계: 풀이 생성 응답
export interface Step {
  desc: string
  latex: string
  note?: string
  keyFormula?: string
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

export interface ApplicationVisualData {
  type: 'application'
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

export interface TrigGeometry {
  description: string
  fill?: string[]
  vertices: TrigGeomVertex[]
  segments: TrigGeomSegment[]
  angles?: TrigGeomAngle[]
}

export interface GenerateSolutionResponse {
  steps: Step[]
  visualData: VisualData
  stuckExplanation: string
}

// 3단계: 도형 좌표 생성 응답 (null = 도형 없는 문제)
export type GenerateDiagramResponse = TrigGeometry | null
