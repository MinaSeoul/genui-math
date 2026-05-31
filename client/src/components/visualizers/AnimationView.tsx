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

// ─── Water Tank Animation ─────────────────────────────────────────────────

const WaterTankAnimation = ({ cfg }: { cfg: NonNullable<Problem['anim']> }) => {
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(false)
  const raf = useRef(0)
  const last = useRef(0)
  const PLAY = 5200

  const tick = useCallback((now: number) => {
    if (!last.current) last.current = now
    const dt = now - last.current; last.current = now
    setT((prev) => {
      const nx = prev + dt / PLAY
      if (nx >= 1) { setPlaying(false); return 1 }
      return nx
    })
    raf.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    if (playing) { last.current = 0; raf.current = requestAnimationFrame(tick) }
    return () => cancelAnimationFrame(raf.current)
  }, [playing, tick])

  const toggle = () => {
    if (t >= 1) { setT(0); setTimeout(() => setPlaying(true), 30) }
    else setPlaying((p) => !p)
  }

  const fillSeconds = cfg.fillSeconds!
  const heightCm = cfg.heightCm!

  const seconds = (t * fillSeconds).toFixed(1)
  const height = (t * heightCm).toFixed(1)

  const W = 380, H = 320
  const tankX = 70, tankY = 46, tankW = 150, tankH = 220
  const waterH = t * tankH
  const waterY = tankY + tankH - waterH

  const gx = 252, gy = 60, gw = 100, gh = 200
  const gpx = gx + t * gw
  const gpy = gy + gh - t * gh

  return (
    <div>
      <div className="anim-stage">
        <svg viewBox={`0 0 ${W} ${H}`}>
          <defs>
            <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3bc9db" stopOpacity="0.95" />
              <stop offset="1" stopColor="#228be6" stopOpacity="0.95" />
            </linearGradient>
          </defs>
          <rect x={tankX + tankW / 2 - 6} y="14" width="12" height="20" rx="3" fill="#3a4254" />
          {playing && t < 1 && (
            <line x1={tankX + tankW / 2} y1="34" x2={tankX + tankW / 2} y2={waterY} stroke="#3bc9db" strokeWidth="3" strokeDasharray="3 5">
              <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="0.4s" repeatCount="indefinite" />
            </line>
          )}
          <clipPath id="tankclip"><rect x={tankX} y={tankY} width={tankW} height={tankH} rx="6" /></clipPath>
          <g clipPath="url(#tankclip)">
            <rect x={tankX} y={waterY} width={tankW} height={waterH + 4} fill="url(#water)" />
            <path d={`M${tankX} ${waterY} q ${tankW / 4} -7 ${tankW / 2} 0 t ${tankW / 2} 0 v 10 h -${tankW} z`} fill="#4dd4e6" opacity="0.5">
              {t > 0 && t < 1 && (
                <animate attributeName="d" dur="1.4s" repeatCount="indefinite"
                  values={`M${tankX} ${waterY} q ${tankW / 4} -7 ${tankW / 2} 0 t ${tankW / 2} 0 v 10 h -${tankW} z;M${tankX} ${waterY} q ${tankW / 4} 7 ${tankW / 2} 0 t ${tankW / 2} 0 v 10 h -${tankW} z;M${tankX} ${waterY} q ${tankW / 4} -7 ${tankW / 2} 0 t ${tankW / 2} 0 v 10 h -${tankW} z`} />
              )}
            </path>
          </g>
          <rect x={tankX} y={tankY} width={tankW} height={tankH} rx="6" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="2.5" />
          {[0, 0.5, 1].map((f, i) => (
            <g key={i}>
              <line x1={tankX - 6} y1={tankY + tankH - f * tankH} x2={tankX} y2={tankY + tankH - f * tankH} stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
              <text className="gp-tick" x={tankX - 9} y={tankY + tankH - f * tankH + 3} textAnchor="end">{Math.round(f * heightCm)}</text>
            </g>
          ))}
          <text className="gp-label" fill="#a4adbe" x={tankX + tankW / 2} y={tankY + tankH + 20} textAnchor="middle">물탱크 (높이 {heightCm}cm)</text>
          <line className="gp-axis" x1={gx} y1={gy} x2={gx} y2={gy + gh} />
          <line className="gp-axis" x1={gx} y1={gy + gh} x2={gx + gw} y2={gy + gh} />
          <line x1={gx} y1={gy + gh} x2={gpx} y2={gpy} stroke="url(#water)" strokeWidth="3" strokeLinecap="round" />
          <circle cx={gpx} cy={gpy} r="5" fill="#3bc9db" className="gp-point" />
          <text className="gp-label" fill="#6f7889" x={gx + gw} y={gy + gh + 14} textAnchor="end">t (초)</text>
          <text className="gp-label" fill="#6f7889" x={gx - 4} y={gy + 4} textAnchor="end">h</text>
          <text className="gp-label" fill="#3bc9db" x={gx + gw / 2} y={gy - 4} textAnchor="middle">h = 2t</text>
        </svg>
      </div>

      <div className="anim-controls">
        <button className="play-btn" onClick={toggle} aria-label="재생">
          <Icon name={playing ? 'pause' : 'play'} size={20} />
        </button>
        <div className="anim-track">
          <div className="scrub"><i style={{ width: `${t * 100}%` }} /></div>
          <div className="alabel">
            <span className="mono" style={{ color: '#3bc9db' }}>t = {seconds}초</span>
            <span style={{ margin: '0 8px', color: 'var(--text-3)' }}>→</span>
            <span className="mono" style={{ color: '#4dabf7' }}>h = {height}cm</span>
            {t >= 1 && <span style={{ color: 'var(--good)', marginLeft: 10, fontWeight: 700 }}>가득 찼어요! h = 2t</span>}
          </div>
        </div>
      </div>
      <p className="muted" style={{ fontSize: 12.5, marginTop: 14, lineHeight: 1.6 }}>
        ▶︎ 를 누르면 물이 일정한 속도로 차오릅니다. 왼쪽 물높이와 오른쪽 직선이 <b style={{ color: '#3bc9db' }}>똑같은 비율</b>로 올라가죠.
        이게 바로 '정비례 = 일차식 <span style={{ color: '#4dabf7' }}>h = 2t</span>' 의 의미예요.
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
  return <WaterTankAnimation cfg={cfg} />
}

export default AnimationView
