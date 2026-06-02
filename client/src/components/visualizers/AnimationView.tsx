import { useState, useEffect, useRef, useCallback } from 'react'
import Icon from '../icons'
import type { Problem } from '../../data/sampleProblems'

interface AnimationViewProps {
  problem: Problem
}

// ─── Dice Grid Animation ───────────────────────────────────────────────────

const DiceAnimation = ({ favorable, totalCases }: { favorable: [number, number][]; totalCases: number }) => {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const raf = useRef(0)
  const last = useRef(0)
  const TOTAL_MS = 4000

  const tick = useCallback((now: number) => {
    if (!last.current) last.current = now
    const dt = now - last.current; last.current = now
    setStep((prev) => {
      const next = prev + dt / TOTAL_MS * favorable.length
      if (next >= favorable.length) { setPlaying(false); return favorable.length }
      return next
    })
    raf.current = requestAnimationFrame(tick)
  }, [favorable.length])

  useEffect(() => {
    if (playing) { last.current = 0; raf.current = requestAnimationFrame(tick) }
    return () => cancelAnimationFrame(raf.current)
  }, [playing, tick])

  const toggle = () => {
    if (step >= favorable.length) { setStep(0); setTimeout(() => setPlaying(true), 30) }
    else setPlaying((p) => !p)
  }

  const shown = Math.floor(step)
  const shownSet = new Set(favorable.slice(0, shown).map(([r, c]) => `${r},${c}`))

  const W = 380, H = 318
  const ox = 44, oy = 46
  const cw = 54, ch = 42

  const cellX = (col: number) => ox + (col - 1) * cw
  const cellY = (row: number) => oy + (row - 1) * ch

  return (
    <div>
      <div className="anim-stage">
        <svg viewBox={`0 0 ${W} ${H}`}>
          {/* Column headers (second die) */}
          <text className="gp-label" fill="#6f7889" x={ox - 18} y={oy - 14} textAnchor="middle" fontSize={11}>1번</text>
          {[1, 2, 3, 4, 5, 6].map((v) => (
            <text key={'ch' + v} className="gp-label" fill="#a4adbe" x={cellX(v) + cw / 2} y={oy - 6} textAnchor="middle" fontSize={13} fontWeight="600">{v}</text>
          ))}
          {/* Row headers (first die) */}
          <text className="gp-label" fill="#6f7889" x={ox - 22} y={oy - 14 + 20} textAnchor="end" fontSize={11}>2번→</text>
          {[1, 2, 3, 4, 5, 6].map((v) => (
            <text key={'rh' + v} className="gp-label" fill="#a4adbe" x={ox - 8} y={cellY(v) + ch / 2 + 4} textAnchor="end" fontSize={13} fontWeight="600">{v}</text>
          ))}

          {/* Grid cells */}
          {[1, 2, 3, 4, 5, 6].map((row) =>
            [1, 2, 3, 4, 5, 6].map((col) => {
              const key = `${row},${col}`
              const isHighlighted = shownSet.has(key)
              const sum = row + col
              return (
                <g key={key}>
                  <rect
                    x={cellX(col)} y={cellY(row)} width={cw} height={ch}
                    fill={isHighlighted ? 'rgba(64,192,87,0.28)' : 'rgba(255,255,255,0.04)'}
                    stroke={isHighlighted ? '#40c057' : 'rgba(255,255,255,0.10)'}
                    strokeWidth={isHighlighted ? 1.5 : 1}
                    rx={3}
                  />
                  <text
                    x={cellX(col) + cw / 2} y={cellY(row) + ch / 2 + 4}
                    textAnchor="middle" fontSize={12}
                    fill={isHighlighted ? '#69db7c' : 'rgba(255,255,255,0.28)'}
                    fontWeight={isHighlighted ? '700' : '400'}
                  >{sum}</text>
                </g>
              )
            })
          )}

          {/* Axis labels */}
          <text className="gp-label" fill="#6f7889" x={W / 2} y={H - 2} textAnchor="middle" fontSize={11}>두 번째 주사위 →</text>
          <text className="gp-label" fill="#6f7889" x={12} y={oy + 3 * ch} textAnchor="middle" fontSize={11} transform={`rotate(-90,12,${oy + 3 * ch})`}>첫 번째 →</text>
        </svg>
      </div>

      <div className="anim-controls">
        <button className="play-btn" onClick={toggle} aria-label="재생">
          <Icon name={playing ? 'pause' : 'play'} size={20} />
        </button>
        <div className="anim-track">
          <div className="scrub"><i style={{ width: `${(shown / favorable.length) * 100}%` }} /></div>
          <div className="alabel">
            <span className="mono" style={{ color: '#40c057' }}>조건 만족: {shown}가지</span>
            <span style={{ margin: '0 8px', color: 'var(--text-3)' }}>/ 전체 {totalCases}가지</span>
            {shown >= favorable.length && (
              <span style={{ color: 'var(--good)', marginLeft: 10, fontWeight: 700 }}>경우의 수 = {favorable.length}</span>
            )}
          </div>
        </div>
      </div>
      <p className="muted" style={{ fontSize: 12.5, marginTop: 14, lineHeight: 1.6 }}>
        ▶︎ 를 누르면 두 눈의 합이 8 이상인 칸들이 하나씩 초록색으로 표시돼요.
        표 안의 숫자는 두 눈의 <b style={{ color: '#40c057' }}>합</b>이에요.
      </p>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────

const AnimationView = ({ problem }: AnimationViewProps) => {
  const cfg = problem.anim!
  if (cfg.favorable) {
    return <DiceAnimation favorable={cfg.favorable} totalCases={cfg.totalCases ?? 36} />
  }
  return null
}

export default AnimationView
