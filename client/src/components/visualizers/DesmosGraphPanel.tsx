import { useEffect, useRef } from 'react'

declare const Desmos: any

interface GraphExtremumProp {
  x: number
  y: number
  type: 'max' | 'min'
  label: string
}

interface DesmosGraphPanelProps {
  expression: string           // e.g. "y = 2*sin(3x) + 1"
  restrictedDomain?: string    // e.g. "0 \\le x \\le 2\\pi"
  vertex?: [number, number]    // 단일 극값 (레거시)
  extremumLabel?: string       // 단일 극값 레이블 (레거시)
  asymptotes?: string[]        // 수직 점근선 x값 표현, e.g. ["\\frac{\\pi}{2}"]
  extrema?: GraphExtremumProp[]  // 최댓값·최솟값 여러 개
}

const DesmosGraphPanel = ({
  expression,
  restrictedDomain,
  vertex,
  extremumLabel,
  asymptotes,
  extrema,
}: DesmosGraphPanelProps) => {
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

    // ── 함수 곡선 ────────────────────────────────────────────────────────────
    if (restrictedDomain) {
      // 정의역 외: 연회색 점선
      calc.setExpression({
        id: 'outside',
        latex: expression,
        color: '#4B5563',
        lineStyle: Desmos.Styles?.DASHED ?? 'DASHED',
        lineWidth: 1.5,
      })
      // 정의역 내: 밝은 파란 실선
      calc.setExpression({
        id: 'inside',
        latex: `${expression}\\{${restrictedDomain}\\}`,
        color: '#38BDF8',
        lineWidth: 2.5,
      })
    } else {
      calc.setExpression({
        id: 'main',
        latex: expression,
        color: '#38BDF8',
        lineWidth: 2.5,
      })
    }

    // ── 점근선 (수직 점선) ────────────────────────────────────────────────────
    asymptotes?.forEach((xVal, i) => {
      calc.setExpression({
        id: `asym_${i}`,
        latex: `x = ${xVal}`,
        color: '#9CA3AF',
        lineStyle: Desmos.Styles?.DASHED ?? 'DASHED',
        lineWidth: 1.5,
      })
    })

    // ── 극값 점 (여러 개) ─────────────────────────────────────────────────────
    if (extrema && extrema.length > 0) {
      extrema.forEach((e, i) => {
        calc.setExpression({
          id: `ext_${i}`,
          latex: `(${e.x}, ${e.y})`,
          color: e.type === 'max' ? '#F472B6' : '#A78BFA',
          showLabel: true,
          label: e.label,
          pointSize: 14,
        })
      })
    } else if (vertex) {
      // 레거시: 단일 vertex
      const [vx, vy] = vertex
      calc.setExpression({
        id: 'vertex_pt',
        latex: `(${vx}, ${vy})`,
        color: '#F472B6',
        showLabel: true,
        label: extremumLabel ?? `(${vx}, ${vy})`,
        pointSize: 14,
      })
    }

    return () => {
      try { calc.destroy() } catch (_) { /* ignore */ }
    }
  }, [
    expression,
    restrictedDomain,
    JSON.stringify(vertex),
    extremumLabel,
    JSON.stringify(asymptotes),
    JSON.stringify(extrema),
  ]) // eslint-disable-line react-hooks/exhaustive-deps

  const hasMax = extrema?.some(e => e.type === 'max') || (vertex && extremumLabel?.includes('최댓'))
  const hasMin = extrema?.some(e => e.type === 'min') || (vertex && extremumLabel?.includes('최솟'))

  return (
    <div>
      <div className="desmos-inline-label">
        {restrictedDomain ? (
          <>
            <span style={{ color: '#38BDF8' }}>━</span> 정의역 내 &nbsp;&nbsp;
            <span style={{ color: '#4B5563' }}>╌</span> 정의역 외
          </>
        ) : (
          <span style={{ color: '#38BDF8' }}>━</span>
        )}
        {asymptotes && asymptotes.length > 0 && (
          <>&nbsp;&nbsp;<span style={{ color: '#9CA3AF' }}>╌</span> 점근선</>
        )}
        {hasMax && (
          <>&nbsp;&nbsp;<span style={{ color: '#F472B6' }}>●</span> 최댓값</>
        )}
        {hasMin && (
          <>&nbsp;&nbsp;<span style={{ color: '#A78BFA' }}>●</span> 최솟값</>
        )}
      </div>
      <div ref={elRef} style={{ width: '100%', height: 360 }} />
    </div>
  )
}

export default DesmosGraphPanel
