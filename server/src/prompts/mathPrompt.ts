import type { DifficultyType, ProblemType } from '../schemas/mathSchema.js'

export function buildAnalyzePrompt(): string {
  return `You are analyzing a Korean high school math problem image.

Extract the problem and classify it. Respond with ONLY a JSON object — no markdown, no code fences, no explanation outside the JSON.

Classification rules:
- "formula": equations, inequalities, algebraic calculations the student solves directly (e.g., solve x²+3x-4=0, simplify an expression)
- "graph": problems where understanding the shape or behavior of a function is central (e.g., sketch a graph, find intersections, analyze a function's properties)
- "application": word problems describing a real-world situation that must be modeled mathematically (e.g., speed/distance/time, area, mixture, probability)

Output this exact JSON structure:
{
  "problemType": "formula",
  "problemText": "Full problem text exactly as written in Korean",
  "latex": "Main mathematical expression in LaTeX (e.g., f(x) = x^2 - 2x + 1)",
  "confidence": 90
}

Rules:
- problemText: copy all text exactly as shown in the image, preserving Korean
- latex: convert only the primary math expression; use standard LaTeX notation
- confidence: integer 0–100 representing how certain you are of the classification (90+ = very clear, 70–89 = reasonably clear, below 70 = ambiguous or unclear image)
- Respond with ONLY the JSON. No other text.`
}

const DIFFICULTY_HINTS: Record<DifficultyType, string> = {
  understanding:
    'The student cannot understand what the problem is asking. Focus on breaking down each term and condition in plain Korean before moving to math.',
  strategy:
    'The student understands the problem but does not know how to start. Focus on identifying the key concept and explaining the overall approach before showing calculations.',
  midway:
    'The student got partway through but is stuck mid-solution. Briefly recap the setup, then focus detail on the steps most students find tricky.',
  visual:
    'The student needs a visual or geometric intuition to understand. Emphasize what the math looks like (shapes, graphs, movement) at each step.',
}

const VISUAL_DATA_INSTRUCTIONS: Record<ProblemType, string> = {
  formula: `"visualData": {
  "type": "formula",
  "roots": [optional numeric roots if the problem is a polynomial equation f(x)=0; omit if not a polynomial or has no real roots],
  "vertex": [optional [vx, vy] vertex of the parabola if the equation is quadratic; omit otherwise]
}`,
  graph: `"visualData": {
  "type": "graph",
  "expression": "LaTeX function string for Desmos, e.g. y = x^2 - 2x - 3",
  "domain": [minX, maxX],
  "roots": [x1, x2],
  "vertex": [vx, vy]
}
Omit roots or vertex if they do not exist or are not relevant.`,
  application: `"visualData": {
  "type": "application",
  "rate": <numeric rate>,
  "unit": "<unit string, e.g. m/s>",
  "totalTime": <total time as number>,
  "totalHeight": <total height or distance as number>
}
Include only the fields that apply to this problem. Omit irrelevant fields.`,
}

export function buildSolvePrompt(
  problemText: string,
  problemType: ProblemType,
  difficultyType: DifficultyType,
): string {
  return `You are a Korean high school math tutor. A student is stuck and needs targeted help.

Problem (Korean):
${problemText}

Problem type: ${problemType}
Student's difficulty: ${difficultyType}

Tutoring focus: ${DIFFICULTY_HINTS[difficultyType]}

Generate a step-by-step solution tailored to this student's difficulty. Respond with ONLY a JSON object — no markdown, no code fences, no extra text.

Math solving principles (follow strictly when constructing steps):
- Keep all coefficients as integers throughout; never convert to decimals or improper fractions mid-solution
- When factoring is possible, always factor; use the quadratic formula only when factoring is not feasible
- Mirror the exact order a student would write steps by hand — no skipping ahead
- Show every intermediate step explicitly: transpositions, common denominators, grouping of common factors
- Express the final answer in simplest integer or fraction form (e.g., x = -1/2, not x = -0.5)

Output this exact JSON structure:
{
  "steps": [
    {
      "desc": "Korean explanation of what this step does and why",
      "latex": "LaTeX expression computed in this step (empty string if purely verbal)",
      "note": "optional Korean hint or insight that helps this specific student (omit if not needed)"
    }
  ],
  ${VISUAL_DATA_INSTRUCTIONS[problemType]},
  "stuckExplanation": "1-2 sentences in Korean explaining why students typically struggle at this difficulty point for this type of problem"
}

Rules:
- Write all desc, note, and stuckExplanation in Korean
- Include 3–6 steps; each step should move the solution forward
- Keep latex as valid LaTeX (use \\frac, ^, _, \\sqrt etc.)
- Respond with ONLY the JSON. No other text.`
}
