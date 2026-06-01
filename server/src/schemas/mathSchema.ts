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
}

export interface GraphVisualData {
  type: 'graph'
  expression: string
  domain?: [number, number]
  roots?: number[]
  vertex?: [number, number]
  restrictedDomain?: string
  extremumLabel?: string
}

export interface ApplicationVisualData {
  type: 'application'
  rate?: number
  unit?: string
  totalTime?: number
  totalHeight?: number
}

export type VisualData = FormulaVisualData | GraphVisualData | ApplicationVisualData

export interface GenerateSolutionResponse {
  steps: Step[]
  visualData: VisualData
  stuckExplanation: string
}
