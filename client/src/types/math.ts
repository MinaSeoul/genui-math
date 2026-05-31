export type ProblemType = 'formula' | 'graph' | 'application'
export type DifficultyType = 'understanding' | 'strategy' | 'midway' | 'visual'

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
}

export interface GraphVisualData {
  type: 'graph'
  expression: string
  domain: [number, number]
  roots?: number[]
  vertex?: [number, number]
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
}

export interface SolutionResult {
  steps: Step[]
  visualData: VisualData
  stuckExplanation: string
}
