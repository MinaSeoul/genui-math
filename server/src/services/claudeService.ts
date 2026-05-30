import type {
  AnalyzeImageResponse,
  DifficultyType,
  GenerateSolutionResponse,
  ProblemType,
} from '../schemas/mathSchema.js'
import { buildAnalyzePrompt, buildSolvePrompt } from '../prompts/mathPrompt.js'

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-haiku-4-5-20251001'

function stripMarkdownFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim()
}

async function callClaude(body: object): Promise<string> {
  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Claude API error ${response.status}: ${errorText}`)
  }

  const data = (await response.json()) as { content: { type: string; text: string }[] }
  return data.content[0].text
}

export async function analyzeImage(imageBase64: string): Promise<AnalyzeImageResponse> {
  try {
    const rawText = await callClaude({
      model: MODEL,
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: buildAnalyzePrompt(),
            },
          ],
        },
      ],
    })

    return JSON.parse(stripMarkdownFences(rawText)) as AnalyzeImageResponse
  } catch (error) {
    throw new Error(`analyzeImage failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function generateSolution(
  problemText: string,
  problemType: ProblemType,
  difficultyType: DifficultyType,
): Promise<GenerateSolutionResponse> {
  try {
    const rawText = await callClaude({
      model: MODEL,
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: buildSolvePrompt(problemText, problemType, difficultyType),
        },
      ],
    })

    return JSON.parse(stripMarkdownFences(rawText)) as GenerateSolutionResponse
  } catch (error) {
    throw new Error(
      `generateSolution failed: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
