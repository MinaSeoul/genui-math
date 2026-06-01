import { useEffect, useRef } from 'react'

declare const Desmos: any

interface DesmosStepGraphProps {
  expression: string  // Desmos-compatible LaTeX, e.g. "y = (1/2)^x"
  label?: string
}

const DesmosStepGraph = ({ expression, label }: DesmosStepGraphProps) => {
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

    calc.setExpression({
      id: 'main',
      latex: expression,
      color: '#38BDF8',
      lineWidth: 2.5,
    })

    return () => {
      try { calc.destroy() } catch (_) { /* ignore */ }
    }
  }, [expression])

  return (
    <div className="desmos-inline-wrap">
      {label && (
        <div className="desmos-inline-label">
          <span style={{ color: '#38BDF8' }}>━</span> {label}
        </div>
      )}
      <div ref={elRef} className="desmos-inline-graph" />
    </div>
  )
}

export default DesmosStepGraph
