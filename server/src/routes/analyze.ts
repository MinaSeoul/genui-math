import { Router } from 'express'

export const analyzeRouter = Router()

// POST /api/analyze
// body: { stage: 'analyze', imageBase64: string }
//     | { stage: 'solve', problemText: string, problemType: string, difficultyType: string }
analyzeRouter.post('/', async (_req, res) => {
  // TODO: claudeService 호출
  res.status(501).json({ error: 'Not implemented' })
})
