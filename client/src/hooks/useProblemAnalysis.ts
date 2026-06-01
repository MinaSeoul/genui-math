import { useState } from 'react'
import type { AnalysisResult, SolutionResult, TrigGeometry, ProblemType, DifficultyType, Step } from '../types/math'

export function useProblemAnalysis() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [solution, setSolution] = useState<SolutionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function analyzeImage(imageBase64: string): Promise<AnalysisResult | null> {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'analyze', imageBase64 }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        throw new Error(err.error ?? `HTTP ${res.status}`)
      }
      const data: AnalysisResult = await res.json()
      setAnalysis(data)
      return data
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      return null
    } finally {
      setLoading(false)
    }
  }

  async function generateSolution(
    problemText: string,
    problemType: ProblemType,
    difficultyType: DifficultyType
  ): Promise<SolutionResult | null> {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'solve', problemText, problemType, difficultyType }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        throw new Error(err.error ?? `HTTP ${res.status}`)
      }
      const data: SolutionResult = await res.json()
      setSolution(data)
      return data
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      return null
    } finally {
      setLoading(false)
    }
  }

  async function generateDiagram(
    problemText: string,
    steps: Step[],
  ): Promise<TrigGeometry | null> {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'diagram', problemText, steps }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        throw new Error(err.error ?? `HTTP ${res.status}`)
      }
      const data = await res.json()
      return data as TrigGeometry | null
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { analysis, solution, loading, error, analyzeImage, generateSolution, generateDiagram }
}
