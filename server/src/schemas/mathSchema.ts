// Claude 응답 JSON 스키마 정의

export interface AnalyzeResponse {
  problemType: 'formula' | 'graph' | 'application'
  problemText: string
  latex: string
}

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

export interface SolveResponse {
  steps: Step[]
  visualData: VisualData
}
