import { useEffect, useRef } from 'react'
import type { InequalityGraph } from '../../types/math'

declare const Desmos: any

type Props = InequalityGraph & { satisfiedRange?: string[] }

const InequalityGraphPanel = ({ expression, shadeExpr, roots, vertex, satisfiedRange }: Props) => {
  const elRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!elRef.current || typeof Desmos === 'undefined') return

    const calc = Desmos.GraphingCalculator(elRef.current, {
      expressions: false,
      settingsMenu: false,
      zoomButtons: true,
      keypad: false,
      expressionsTopbar: false,
      border: false,
    })

    // ① 전체 곡선 — 회색 (배경)
    calc.setExpression({
      id: 'full_curve',
      latex: `y = ${expression}`,
      color: '#6B7280',
      lineWidth: 1.5,
    })

    if (shadeExpr) {
      // ② 부등식 만족 영역 색칠 (Desmos 색칠 기능)
      calc.setExpression({
        id: 'shade',
        latex: shadeExpr,
        color: '#60A5FA',    // 파란 색 채움
      })

      // ③ 만족 구간 위 곡선 — 밝은 파란 실선 (눈에 띄게)
      if (satisfiedRange?.length) {
        satisfiedRange.forEach((range, i) => {
          calc.setExpression({
            id: `sat_curve_${i}`,
            latex: `y = ${expression} \\{${range}\\}`,
            color: '#2563EB',
            lineWidth: 3,
          })
        })
      }
    } else if (satisfiedRange?.length) {
      // shadeExpr 없는 폴백: 만족 구간만 밝은 파란색으로 강조
      satisfiedRange.forEach((range, i) => {
        calc.setExpression({
          id: `sat_curve_${i}`,
          latex: `y = ${expression} \\{${range}\\}`,
          color: '#38BDF8',
          lineWidth: 4,
        })
      })
    }

    // ④ 근(x축과의 교점) 마커
    roots?.forEach((r, i) => {
      calc.setExpression({
        id: `root_${i}`,
        latex: `(${r}, 0)`,
        color: '#F472B6',
        showLabel: true,
        label: `x = ${r}`,
        pointSize: 14,
      })
    })

    // ⑤ 꼭짓점 마커
    if (vertex) {
      const [vx, vy] = vertex
      calc.setExpression({
        id: 'vertex_pt',
        latex: `(${vx}, ${vy})`,
        color: '#A78BFA',
        showLabel: true,
        label: `꼭짓점 (${vx}, ${vy})`,
        pointSize: 12,
      })
    }

    return () => {
      try { calc.destroy() } catch (_) { /* ignore */ }
    }
  }, [
    expression,
    shadeExpr,
    JSON.stringify(roots),
    JSON.stringify(vertex),
    JSON.stringify(satisfiedRange),
  ]) // eslint-disable-line react-hooks/exhaustive-deps

  const hasShading = !!shadeExpr

  return (
    <div>
      <div className="desmos-inline-label">
        <span style={{ color: '#6B7280' }}>━</span> f(x) 전체 &nbsp;&nbsp;
        {hasShading && (
          <><span style={{ color: '#60A5FA' }}>■</span> 부등식 만족 영역 (색칠) &nbsp;&nbsp;</>
        )}
        {!hasShading && satisfiedRange?.length && (
          <><span style={{ color: '#38BDF8' }}>━</span> 부등식 만족 구간 &nbsp;&nbsp;</>
        )}
        {roots && roots.length > 0 && (
          <><span style={{ color: '#F472B6' }}>●</span> 경계값 (근)</>
        )}
      </div>
      <div ref={elRef} style={{ width: '100%', height: 360 }} />
    </div>
  )
}

export default InequalityGraphPanel
