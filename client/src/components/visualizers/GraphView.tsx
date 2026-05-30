// 함수·그래프형 — Desmos 인터랙티브 그래프
// window.Desmos는 index.html script 태그로 로드
declare const Desmos: any

import type { VisualData } from '../../types/math'

interface Props {
  visualData: VisualData
}

export function GraphView({ visualData: _visualData }: Props) {
  return <div>GraphView — TODO</div>
}
