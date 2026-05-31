import { useEffect, useRef } from 'react'

declare const Desmos: any

interface DesmosInlineGraphProps {
  expression: string
  satisfiedRange: string[]
}

const DesmosInlineGraph = ({ expression, satisfiedRange }: DesmosInlineGraphProps) => {
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

    // Full curve in muted gray
    calc.setExpression({
      id: 'full',
      latex: `y=${expression}`,
      color: '#6B7280',
    })

    // Satisfied range highlighted in sky blue
    satisfiedRange.forEach((range, i) => {
      calc.setExpression({
        id: `sat_${i}`,
        latex: `y=${expression}\\{${range}\\}`,
        color: '#38BDF8',
        lineWidth: 4,
      })
    })

    return () => {
      try { calc.destroy() } catch (_) { /* ignore */ }
    }
  }, [expression, satisfiedRange.join('|')]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="desmos-inline-wrap">
      <div className="desmos-inline-label">
        <span style={{ color: '#6B7280' }}>━</span> 이차함수 전체 &nbsp;
        <span style={{ color: '#38BDF8' }}>━</span> 부등식 만족 구간
      </div>
      <div
        ref={elRef}
        className="desmos-inline-graph"
      />
    </div>
  )
}

export default DesmosInlineGraph
