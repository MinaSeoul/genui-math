import { useState } from 'react'
import Icon from '../icons'
import type { Problem } from '../../data/sampleProblems'

interface GraphViewProps {
  problem: Problem
}

const GraphView = ({ problem }: GraphViewProps) => {
  const g = problem.graph!
  const [c, setC] = useState(g.c)
  const a = g.a
  const b = g.b

  const W = 380, H = 320, pad = 6
  const xmin = -2, xmax = 6, ymin = -4, ymax = 8
  const toX = (x: number) => pad + (x - xmin) / (xmax - xmin) * (W - 2 * pad)
  const toY = (y: number) => pad + (1 - (y - ymin) / (ymax - ymin)) * (H - 2 * pad)

  const pts: (string | null)[] = []
  for (let x = xmin; x <= xmax + 0.001; x += 0.1) {
    const y = a * x * x + b * x + c
    if (y >= ymin - 2 && y <= ymax + 2) pts.push(`${toX(x).toFixed(1)},${toY(y).toFixed(1)}`)
    else pts.push(null)
  }
  const polyChunks: string[][] = []
  let cur: string[] = []
  pts.forEach((p) => { if (p) cur.push(p); else { if (cur.length) polyChunks.push(cur); cur = [] } })
  if (cur.length) polyChunks.push(cur)

  const disc = b * b - 4 * a * c
  let roots: number[] = []
  if (disc >= 0) {
    const s = Math.sqrt(disc)
    roots = [(-b - s) / (2 * a), (-b + s) / (2 * a)].sort((p, q) => p - q)
  }
  const vx = -b / (2 * a)
  const vy = a * vx * vx + b * vx + c
  const dist = roots.length === 2 ? Math.abs(roots[1] - roots[0]) : null

  const gridLines: React.ReactNode[] = []
  for (let x = xmin; x <= xmax; x++)
    gridLines.push(<line key={'vx' + x} className={x === 0 ? 'gp-axis' : 'gp-grid'} x1={toX(x)} y1={toY(ymin)} x2={toX(x)} y2={toY(ymax)} />)
  for (let y = ymin; y <= ymax; y++)
    gridLines.push(<line key={'hy' + y} className={y === 0 ? 'gp-axis' : 'gp-grid'} x1={toX(xmin)} y1={toY(y)} x2={toX(xmax)} y2={toY(y)} />)

  const fmt = (n: number) => (Math.round(n * 100) / 100).toString()

  return (
    <div>
      <div className="graph-stage">
        <svg viewBox={`0 0 ${W} ${H}`}>
          <defs>
            <linearGradient id="curveg" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#4dabf7" /><stop offset="1" stopColor="#3bc9db" />
            </linearGradient>
          </defs>
          {gridLines}
          {[-1, 1, 2, 3, 4, 5].map((x) => (
            <text key={'tx' + x} className="gp-tick" x={toX(x)} y={toY(0) + 13} textAnchor="middle">{x}</text>
          ))}
          {[2, 4, 6].map((y) => (
            <text key={'ty' + y} className="gp-tick" x={toX(0) - 7} y={toY(y) + 3} textAnchor="end">{y}</text>
          ))}
          {polyChunks.map((ch, i) => (
            <polyline key={i} className="gp-curve" stroke="url(#curveg)" points={ch.join(' ')} />
          ))}
          {vy >= ymin && vy <= ymax && (
            <g>
              <circle className="gp-point" cx={toX(vx)} cy={toY(vy)} r="4" fill="#9775fa" />
              <text className="gp-label" fill="#b9a5fb" x={toX(vx)} y={toY(vy) + 18} textAnchor="middle">꼭짓점</text>
            </g>
          )}
          {roots.map((r, i) => (
            <g key={'r' + i}>
              <circle className="gp-point" cx={toX(r)} cy={toY(0)} r="6" fill="#4dabf7" stroke="#0a0c10" strokeWidth="2" />
              <text className="gp-label" fill="#8fc7ff" x={toX(r)} y={toY(0) - 11} textAnchor="middle">{fmt(r)}</text>
            </g>
          ))}
          {dist && (
            <g>
              <line x1={toX(roots[0])} y1={toY(0) + 24} x2={toX(roots[1])} y2={toY(0) + 24} stroke="#3bc9db" strokeWidth="1.6" strokeDasharray="4 3" />
              <text className="gp-label" fill="#3bc9db" x={toX((roots[0] + roots[1]) / 2)} y={toY(0) + 39} textAnchor="middle">거리 = {fmt(dist)}</text>
            </g>
          )}
        </svg>
      </div>

      <div className="graph-controls">
        <div className="slider-row">
          <span className="sl-lbl">상수항 c</span>
          <input type="range" min={g.param.min} max={g.param.max} step={g.param.step} value={c}
            onChange={(e) => setC(parseFloat(e.target.value))} />
          <span className="sl-val">c = {fmt(c)}</span>
        </div>
        <button className="btn btn-quiet btn-sm" onClick={() => setC(g.c)}>
          <Icon name="refresh" size={15} /> 원래대로
        </button>
      </div>
      <div className="legend" style={{ marginTop: 12 }}>
        <span><i style={{ background: 'linear-gradient(90deg,#4dabf7,#3bc9db)' }} /> 그래프 y = x²−4x+{fmt(c)}</span>
        <span><i style={{ background: '#4dabf7' }} /> x축 교점</span>
        <span><i style={{ background: '#9775fa' }} /> 꼭짓점</span>
      </div>
      <p className="muted" style={{ fontSize: 12.5, marginTop: 12, lineHeight: 1.6 }}>
        슬라이더로 상수항을 움직여 보세요. 두 교점(파란 점)이 가까워지거나 멀어지고, 그 <b style={{ color: '#3bc9db' }}>간격</b>이 바로 답이에요.
        c = 3 일 때 거리는 <b style={{ color: '#3bc9db' }}>2</b> 입니다.
      </p>
    </div>
  )
}

export default GraphView
