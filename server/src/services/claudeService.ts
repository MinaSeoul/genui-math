import type {
  AnalyzeImageResponse,
  DifficultyType,
  GenerateDiagramResponse,
  GenerateSolutionResponse,
  ProblemType,
  Step,
} from '../schemas/mathSchema.js'
import {
  buildAnalyzePrompt,
  buildChatPrompt,
  buildDiagramPrompt,
  buildExplainPrompt,
  buildSolvePrompt,
} from '../prompts/mathPrompt.js'

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-6'

function stripMarkdownFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim()
}

// LaTeX 백슬래시 완전 보정:
// JSON 구조 이스케이프(\\, \", \/, \uXXXX)만 보호하고
// 그 외 모든 \는 \\로 변환 (\frac \sqrt \left \right \text \beta 등 포함)
function fixJsonBackslashes(text: string): string {
  const saved: string[] = []
  const protect = (m: string): string => {
    saved.push(m)
    // 플레이스홀더: \x01N\x01 형식 (백슬래시 없음 → step2에서 이중처리 안 됨)
    return `\x01${saved.length - 1}\x01`
  }

  const out = text
    // 1) 유효한 JSON 이스케이프를 백슬래시 없는 플레이스홀더로 교체
    .replace(/\\(["\/\\]|u[0-9a-fA-F]{4})/g, protect)
    // 2) 남은 단독 \ 를 모두 \\로 변환 (LaTeX 명령어 보정)
    .replace(/\\/g, '\\\\')

  // 3) 플레이스홀더 복원
  return out.replace(/\x01(\d+)\x01/g, (_, i) => saved[+i])
}

function parseJson<T>(text: string): T {
  const stripped = stripMarkdownFences(text)
  try {
    return JSON.parse(stripped) as T
  } catch {
    return JSON.parse(fixJsonBackslashes(stripped)) as T
  }
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

    return parseJson<AnalyzeImageResponse>(rawText)
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
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: buildSolvePrompt(problemText, problemType, difficultyType),
        },
      ],
    })

    return parseJson<GenerateSolutionResponse>(rawText)
  } catch (error) {
    throw new Error(
      `generateSolution failed: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

export async function generateDiagram(
  problemText: string,
  steps: Step[],
): Promise<GenerateDiagramResponse> {
  try {
    const rawText = await callClaude({
      model: MODEL,
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: buildDiagramPrompt(problemText, steps),
        },
      ],
    })

    const stripped = stripMarkdownFences(rawText).trim()
    if (!stripped) return null

    // Claude가 분석 텍스트를 JSON 앞에 출력했을 경우 JSON 객체만 추출
    const jsonStart = stripped.indexOf('{')
    if (jsonStart === -1) return null  // JSON 없음 → 도형 없는 문제
    const clean = stripped.slice(jsonStart)

    return parseJson<GenerateDiagramResponse>(clean)
  } catch (error) {
    throw new Error(
      `generateDiagram failed: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
