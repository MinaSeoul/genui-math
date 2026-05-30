import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { analyzeRouter } from './routes/analyze.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.use('/api/analyze', analyzeRouter)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
