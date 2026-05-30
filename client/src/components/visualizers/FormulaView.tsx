import { useState } from 'react'
import Icon from '../icons'
import Katex from '../shared/Katex'
import RichText from '../shared/RichText'
import type { Problem } from '../../data/sampleProblems'

interface FormulaViewProps {
  problem: Problem
}

const FormulaView = ({ problem }: FormulaViewProps) => {
  const steps = problem.steps
  const [shown, setShown] = useState(1)
  const done = shown >= steps.length

  return (
    <div>
      <div className="fsteps">
        {steps.map((s, i) => {
          const visible = i < shown
          const isCur = i === shown - 1
          return (
            <div key={i} className={'fstep' + (visible ? ' shown' : '') + (isCur ? ' cur' : '')}>
              <div className="num">{i + 1}</div>
              <div className="fc">
                <div className="desc"><RichText text={s.desc} /></div>
                {visible && (
                  <div className="math-box"><Katex tex={s.latex} /></div>
                )}
                {visible && s.note && (
                  <div className="note"><Icon name="check" size={14} /> {s.note}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <div className="formula-controls">
        <span className="step-prog">{shown} / {steps.length} 단계</span>
        <div style={{ display: 'flex', gap: 10 }}>
          {shown > 1 && (
            <button className="btn btn-quiet btn-sm" onClick={() => setShown((s) => Math.max(1, s - 1))}>
              <Icon name="arrowL" size={15} /> 이전
            </button>
          )}
          {!done ? (
            <button className="btn btn-primary btn-sm" onClick={() => setShown((s) => s + 1)}>
              다음 단계 <Icon name="arrow" size={15} />
            </button>
          ) : (
            <button className="btn btn-quiet btn-sm" onClick={() => setShown(1)}>
              <Icon name="refresh" size={15} /> 처음부터
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default FormulaView
