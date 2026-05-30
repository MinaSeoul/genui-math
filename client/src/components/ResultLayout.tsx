// problemType에 따라 FormulaView / GraphView / AnimationView 분기
import type { SolutionResult, ProblemType } from '../types/math'

interface Props {
  problemType: ProblemType
  solution: SolutionResult
}

export function ResultLayout({ problemType: _problemType, solution: _solution }: Props) {
  return <div>ResultLayout — TODO</div>
}
