import type {
  AnalyzeImageResponse,
  DifficultyType,
  GenerateSolutionResponse,
  ProblemType,
} from '../schemas/mathSchema.js'
import { buildAnalyzePrompt, buildChatPrompt, buildExplainPrompt, buildSolvePrompt } from '../prompts/mathPrompt.js'

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-6'

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

export async function generateChatReply(
  problemText: string,
  userMessage: string,
  chatHistory: { role: string; text: string }[],
): Promise<{ reply: string }> {
  const history = chatHistory[0]?.role === 'ai' ? chatHistory.slice(1) : chatHistory

  const claudeMessages: { role: 'user' | 'assistant'; content: string }[] = []
  for (const msg of history) {
    claudeMessages.push({
      role: msg.role === 'me' ? 'user' : 'assistant',
      content: msg.text,
    })
  }
  claudeMessages.push({ role: 'user', content: userMessage })

  const rawText = await callClaude({
    model: MODEL,
    max_tokens: 500,
    system: buildChatPrompt(problemText),
    messages: claudeMessages,
  })

  return { reply: rawText.trim() }
}

export async function explainStep(
  stepDesc: string,
  stepIndex: number,
): Promise<{ explanation: string }> {
  const rawText = await callClaude({
    model: MODEL,
    max_tokens: 600,
    messages: [
      {
        role: 'user',
        content: buildExplainPrompt(stepDesc, stepIndex),
      },
    ],
  })
  return { explanation: rawText.trim() }
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
