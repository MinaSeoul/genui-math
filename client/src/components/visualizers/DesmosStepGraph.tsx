import { useEffect, useRef } from 'react'
import Katex from '../shared/Katex'

declare const Desmos: any

export interface GraphParameter {
  name: string          // e.g. "k"
  defaultValue: number  // initial slider value
  min?: number
  max?: number
  step?: number
}

interface DesmosStepGraphProps {
  expression: string        // Desmos-compatible LaTeX, e.g. "y = (1/2)^x"
  label?: string            // plain-text fallback label
  formulaLatex?: string     // human-readable KaTeX formula, e.g. "f(x) = x^3 - 3x"
  parameters?: GraphParameter[]  // unknown constants rendered as sliders
}

const DesmosStepGraph = ({ expression, label, formulaLatex, parameters }: DesmosStepGraphProps) => {
  const elRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!elRef.current || typeof Desmos === 'undefined') return

    const hasParams = parameters && parameters.length > 0
    const calc = Desmos.GraphingCalculator(elRef.current, {
      expressions: hasParams,   // show expression panel only when sliders are needed
      settingsMenu: false,
      zoomButtons: true,
      keypad: false,
      expressionsTopbar: false,
      border: false,
    })

    // Register each unknown constant as a slider
    parameters?.forEach((p) => {
      calc.setExpression({
        id: `param_${p.name}`,
        latex: `${p.name} = ${p.defaultValue}`,
        sliderBounds: {
          min: p.min ?? -10,
          max: p.max ?? 10,
          step: p.step ?? 0.1,
        },
      })
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
  }, [expression, JSON.stringify(parameters)]) // eslint-disable-line react-hooks/exhaustive-deps

  const displayLabel = formulaLatex ?? label

  return (
    <div className="desmos-inline-wrap">
      {displayLabel && (
        <div className="desmos-inline-label">
          <span style={{ color: '#38BDF8' }}>━</span>
          {formulaLatex
            ? <Katex tex={formulaLatex} display={false} />
            : <span>{label}</span>
          }
        </div>
      )}
      <div ref={elRef} className="desmos-inline-graph" />
    </div>
  )
}

export default DesmosStepGraph
