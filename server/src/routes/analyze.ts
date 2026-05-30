import { Router, Request, Response } from 'express'
import { analyzeImage, generateSolution } from '../services/claudeService.js'
import type { DifficultyType, ProblemType } from '../schemas/mathSchema.js'

export const analyzeRouter = Router()

// POST /api/analyze
// body (1단계): { stage: 'analyze', imageBase64: string }
// body (2단계): { stage: 'solve', problemText: string, problemType: ProblemType, difficultyType: DifficultyType }
analyzeRouter.post('/', async (req: Request, res: Response) => {
  const { stage } = req.body

  try {
    if (stage === 'analyze') {
      const { imageBase64 } = req.body as { imageBase64: string }
      if (!imageBase64) {
        res.status(400).json({ error: 'imageBase64 is required' })
        return
      }
      const result = await analyzeImage(imageBase64)
      res.json(result)
    } else if (stage === 'solve') {
      const { problemText, problemType, difficultyType } = req.body as {
        problemText: string
        problemType: ProblemType
        difficultyType: DifficultyType
      }
      if (!problemText || !problemType || !difficultyType) {
        res.status(400).json({ error: 'problemText, problemType, difficultyType are required' })
        return
      }
      const result = await generateSolution(problemText, problemType, difficultyType)
      res.json(result)
    } else {
      res.status(400).json({ error: 'stage must be "analyze" or "solve"' })
    }
  } catch (error) {
    console.error('[/api/analyze]', error)
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    })
  }
})
