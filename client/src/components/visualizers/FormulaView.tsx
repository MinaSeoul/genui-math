import { useEffect, useRef, useState } from 'react'
import Icon from '../icons'
import Katex from '../shared/Katex'
import RichText from '../shared/RichText'
import type { Problem, DifficultyType } from '../../data/sampleProblems'

interface FormulaViewProps {
  problem: Problem
  difficulty?: DifficultyType
}

interface StepExplanation {
  loading: boolean
  text: string | null
}

function KeyFormulaBox({ formula }: { formula: string }) {
  return (
    <div className="key-formula-box">
      <div className="kf-label">📐 적용 공식</div>
      <Katex tex={formula} display={true} />
    </div>
  )
}

const FormulaView = ({ problem, difficulty }: FormulaViewProps) => {
  const steps = problem.steps
  const isMidway = difficulty === 'midway'

  // midway 모드: 점진적 공개
  const [revealed, setRevealed] = useState(1)
  const [done, setDone] = useState(false)
  const [explains, setExplains] = useState<StepExplanation[]>(
    () => steps.map(() => ({ loading: false, text: null }))
  )
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  // 일반 모드: 기존 prev/next
  const [shown, setShownNormal] = useState(1)

  useEffect(() => {
    setRevealed(1)
    setDone(false)
    setExplains(steps.map(() => ({ loading: false, text: null })))
    setShownNormal(1)
  }, [problem.id, difficulty])

  const scrollToStep = (idx: number) => {
    setTimeout(() => {
      stepRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 80)
  }

  const handleNext = (idx: number) => {
    if (idx + 1 >= steps.length) {
      setDone(true)
    } else {
      setRevealed(idx + 2)
      scrollToStep(idx + 1)
    }
  }

  const handleExplain = async (idx: number) => {
    if (explains[idx].loading || explains[idx].text) return
    setExplains((prev) => {
      const next = [...prev]
      next[idx] = { loading: true, text: null }
      return next
    })
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'explain', stepDesc: steps[idx].desc, stepIndex: idx }),
      })
      const data = await res.json()
      setExplains((prev) => {
        const next = [...prev]
        next[idx] = { loading: false, text: data.explanation ?? '설명을 불러오지 못했어요.' }
        return next
      })
    } catch {
      setExplains((prev) => {
        const next = [...prev]
        next[idx] = { loading: false, text: '설명을 불러오지 못했어요.' }
        return next
      })
    }
  }

  // ── Midway 점진적 공개 UX ──
  if (isMidway) {
    return (
      <div>
        <div className="fsteps">
          {steps.map((s, i) => {
            if (i >= revealed) return null
            const isCur = i === revealed - 1 && !done
            const exp = explains[i]
            return (
              <div
                key={i}
                ref={(el) => { stepRefs.current[i] = el }}
                className={'fstep shown' + (isCur ? ' cur' : '')}
              >
                <div className="num">{i + 1}</div>
                <div className="fc">
                  <div className="desc"><RichText text={s.desc} /></div>
                  {s.latex && (
                    <div className="math-box"><Katex tex={s.latex} /></div>
                  )}
                  {s.keyFormula && <KeyFormulaBox formula={s.keyFormula} />}
                  {s.note && (
                    <div className="note"><Icon name="check" size={14} /> <RichText text={s.note} /></div>
                  )}

                  {/* 심화 설명 영역 */}
                  {exp.loading && (
                    <div className="step-explain loading-explain">
                      <div className="typing"><i /><i /><i /></div>
                      <span>더 쉬운 설명을 준비하고 있어요...</span>
                    </div>
                  )}
                  {exp.text && (
                    <div className="step-explain">
                      <div className="explain-label">💡 심화 설명</div>
                      <div className="explain-body"><RichText text={exp.text} /></div>
                    </div>
                  )}

                  {/* 현재 단계(마지막 공개)에만 두 버튼 표시 */}
                  {isCur && (
                    <div className="midway-btns">
                      <button
                        className="btn btn-quiet btn-sm"
                        onClick={() => handleExplain(i)}
                        disabled={exp.loading || !!exp.text}
                      >
                        <Icon name="help" size={14} />
                        {exp.text ? '설명 확인 완료' : '이 단계가 잘 이해가 안 돼요'}
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleNext(i)}
                      >
                        {i + 1 >= steps.length ? '마지막 단계 완료' : '알겠어요, 다음 단계 →'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {done && (
          <div className="midway-done">
            🎉 모든 단계를 확인했어요! 이제 처음부터 다시 한번 훑어보면 완벽하게 이해될 거예요.
          </div>
        )}
      </div>
    )
  }

  // ── 일반 UX (기존 이전/다음 버튼) ──
  const normalDone = shown >= steps.length
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
                {visible && s.latex && (
                  <div className="math-box"><Katex tex={s.latex} /></div>
                )}
                {visible && s.keyFormula && <KeyFormulaBox formula={s.keyFormula} />}
                {visible && s.note && (
                  <div className="note"><Icon name="check" size={14} /> <RichText text={s.note} /></div>
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
            <button className="btn btn-quiet btn-sm" onClick={() => setShownNormal((s) => Math.max(1, s - 1))}>
              <Icon name="arrowL" size={15} /> 이전
            </button>
          )}
          {!normalDone ? (
            <button className="btn btn-primary btn-sm" onClick={() => setShownNormal((s) => s + 1)}>
              다음 단계 <Icon name="arrow" size={15} />
            </button>
          ) : (
            <button className="btn btn-quiet btn-sm" onClick={() => setShownNormal(1)}>
              <Icon name="refresh" size={15} /> 처음부터
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default FormulaView
