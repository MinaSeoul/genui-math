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

// Claude 응답 텍스트에서 마크다운 코드 펜스(```json ... ```) 제거
function stripMarkdownFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim()
}

// Claude가 JSON 내 LaTeX 역슬래시를 단일 \로 출력할 때 발생하는 파싱 오류를 보정한다.
// JSON 구조 이스케이프(\\, \", \/, \uXXXX)는 유지하고, 나머지 \를 모두 \\로 변환.
function fixJsonBackslashes(text: string): string {
  const saved: string[] = []
  const protect = (m: string): string => {
    saved.push(m)
    return `\x01${saved.length - 1}\x01`
  }

  const out = text
    .replace(/\\(["\/\\]|u[0-9a-fA-F]{4})/g, protect)
    .replace(/\\/g, '\\\\')

  return out.replace(/\x01(\d+)\x01/g, (_, i) => saved[+i])
}

// 마크다운 펜스 제거 후 JSON 파싱을 시도하고, 실패하면 역슬래시 보정 후 재시도
function parseJson<T>(text: string): T {
  const stripped = stripMarkdownFences(text)
  try {
    return JSON.parse(stripped) as T
  } catch {
    return JSON.parse(fixJsonBackslashes(stripped)) as T
  }
}

// Claude API에 HTTP POST 요청을 보내고 첫 번째 텍스트 블록을 반환
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

// [1단계] 수학 문제 이미지를 Vision으로 분석해 문제 텍스트, 유형(formula/graph/application), LaTeX를 추출
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

// [채팅] 문제 맥락을 시스템 프롬프트로 고정하고 학생 질문에 수식 포함 답변을 생성
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

// [심화 설명] 학생이 이해하지 못한 단계를 더 쉬운 언어와 예시로 재설명
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

// [2단계] 문제 유형과 학생의 어려움 유형에 맞춰 단계별 풀이(steps)와 시각화 데이터(visualData)를 생성
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

// [3단계] 풀이 단계를 분석해 기하 도형의 꼭짓점·선분·각도 좌표를 JSON으로 생성 (도형 없으면 null 반환)
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

    // 프롬프트 지시 위반으로 JSON 앞에 분석 텍스트가 붙는 경우 JSON 객체 위치부터 파싱
    const jsonStart = stripped.indexOf('{')
    if (jsonStart === -1) return null
    const clean = stripped.slice(jsonStart)

    return parseJson<GenerateDiagramResponse>(clean)
  } catch (error) {
    throw new Error(
      `generateDiagram failed: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
