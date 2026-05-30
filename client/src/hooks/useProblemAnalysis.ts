import { useState } from 'react'
import type { AnalysisResult, SolutionResult, DifficultyType } from '../types/math'

export function useProblemAnalysis() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [solution, setSolution] = useState<SolutionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function analyzeImage(_imageBase64: string): Promise<void> {
    // TODO: POST /api/analyze { stage: 'analyze', imageBase64 }
  }

  async function generateSolution(_difficultyType: DifficultyType): Promise<void> {
    // TODO: POST /api/analyze { stage: 'solve', difficultyType, ... }
  }

  return { analysis, solution, loading, error, analyzeImage, generateSolution }
}
