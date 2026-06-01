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

export interface TrigGeometry {
  description: string
  fill?: string[]
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

export interface ApplicationVisualData {
  type: 'application'
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
}

export interface SolutionResult {
  steps: Step[]
  visualData: VisualData
  stuckExplanation: string
}
