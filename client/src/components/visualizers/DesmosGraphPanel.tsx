import { useEffect, useRef } from 'react'

declare const Desmos: any

interface DesmosGraphPanelProps {
  expression: string        // e.g. "y = x^2 - 4x + 3"
  restrictedDomain?: string // e.g. "x > 0"  (Desmos condition)
  vertex?: [number, number] // min/max point to mark
  extremumLabel?: string    // e.g. "최솟값 = -1"
}

const DesmosGraphPanel = ({ expression, restrictedDomain, vertex, extremumLabel }: DesmosGraphPanelProps) => {
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

    if (restrictedDomain) {
      // Outside domain: muted gray, dashed
      calc.setExpression({
        id: 'outside',
        latex: expression,
        color: '#4B5563',
        lineStyle: Desmos.Styles?.DASHED ?? 'DASHED',
        lineWidth: 1.5,
      })
      // Inside domain: solid bright blue
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

    if (vertex) {
      const [vx, vy] = vertex
      calc.setExpression({
        id: 'vertex_pt',
        latex: `(${vx}, ${vy})`,
        color: '#F472B6',
        showLabel: true,
        label: extremumLabel ?? `(${vx}, ${vy})`,
      })
    }

    return () => {
      try { calc.destroy() } catch (_) { /* ignore */ }
    }
  }, [expression, restrictedDomain, JSON.stringify(vertex), extremumLabel]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className="desmos-inline-label">
        {restrictedDomain ? (
          <>
            <span style={{ color: '#38BDF8' }}>━</span> 정의역 내 (실선)
            &nbsp;&nbsp;
            <span style={{ color: '#4B5563' }}>╌</span> 정의역 외 (점선)
          </>
        ) : (
          <span style={{ color: '#38BDF8' }}>━</span>
        )}
        {vertex && extremumLabel && (
          <>&nbsp;&nbsp;<span style={{ color: '#F472B6' }}>●</span> {extremumLabel}</>
        )}
      </div>
      <div ref={elRef} style={{ width: '100%', height: 360 }} />
    </div>
  )
}

export default DesmosGraphPanel
