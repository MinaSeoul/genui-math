export type ProblemType = 'formula' | 'graph' | 'application'

export type DifficultyType = 'understanding' | 'strategy' | 'midway' | 'visual'

export interface Step {
  explanation: string
  latex: string
}

export interface VisualData {
  expression?: string
  domain?: [number, number]
  highlights?: string[]
  animationElements?: unknown[]
}

export interface AnalysisResult {
  problemType: ProblemType
  problemText: string
  latex: string
}

export interface SolutionResult {
  steps: Step[]
  visualData: VisualData
}
