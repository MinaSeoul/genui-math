// 어려움 유형 선택 버튼 (문제 이해 / 풀이 전략 / 풀이 중간 / 시각적 이해)
import type { DifficultyType } from '../types/math'

interface Props {
  onSelect: (type: DifficultyType) => void
}

export function DifficultySurvey({ onSelect: _onSelect }: Props) {
  return <div>DifficultySurvey — TODO</div>
}
