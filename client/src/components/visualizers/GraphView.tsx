import { useState } from 'react'
import Icon from '../icons'
import type { Problem } from '../../data/sampleProblems'

interface GraphViewProps {
  problem: Problem
}

function evalPoly(coeffs: number[], x: number): number {
  return coeffs.reduce((acc, c) => acc * x + c, 0)
}

const GraphView = ({ problem }: GraphViewProps) => {
  const g = problem.graph!
  const isPoly = !!g.coefficients

  const [c, setC] = useState(g.c ?? 0)

  const a = g.a ?? 1
  const b = g.b ?? 0

  const xmin = isPoly ? -3 : -2
  const xmax = isPoly ? 3 : 6
  const ymin = isPoly ? -4 : -4
  const ymax = isPoly ? 4 : 8

  const W = 380, H = 320, pad = 6
  const toX = (x: number) => pad + (x - xmin) / (xmax - xmin) * (W - 2 * pad)
  const toY = (y: number) => pad + (1 - (y - ymin) / (ymax - ymin)) * (H - 2 * pad)

  const pts: (string | null)[] = []
  for (let x = xmin; x <= xmax + 0.001; x += 0.05) {
    const y = isPoly ? evalPoly(g.coefficients!, x) : a * x * x + b * x + c
    if (y >= ymin - 2 && y <= ymax + 2) pts.push(`${toX(x).toFixed(1)},${toY(y).toFixed(1)}`)
    else pts.push(null)
  }
  const polyChunks: string[][] = []
  let cur: string[] = []
  pts.forEach((p) => { if (p) cur.push(p); else { if (cur.length) polyChunks.push(cur); cur = [] } })
  if (cur.length) polyChunks.push(cur)

  let roots: number[] = g.roots ?? []
  let vx: number | undefined
  let vy: number | undefined

  if (!isPoly) {
    const disc = b * b - 4 * a * c
    if (disc >= 0) {
      const s = Math.sqrt(disc)
      roots = [(-b - s) / (2 * a), (-b + s) / (2 * a)].sort((p, q) => p - q)
    }
    vx = -b / (2 * a)
    vy = a * vx * vx + b * vx + c
  }

  const fmt = (n: number) => (Math.round(n * 100) / 100).toString()

  const xTicks = isPoly ? [-2, -1, 1, 2] : [-1, 1, 2, 3, 4, 5]
  const yTicks = isPoly ? [-2, 2] : [2, 4, 6]

  const gridLines: React.ReactNode[] = []
  for (let x = Math.floor(xmin); x <= xmax; x++)
    gridLines.push(<line key={'vx' + x} className={x === 0 ? 'gp-axis' : 'gp-grid'} x1={toX(x)} y1={toY(ymin)} x2={toX(x)} y2={toY(ymax)} />)
  for (let y = Math.floor(ymin); y <= ymax; y++)
    gridLines.push(<line key={'hy' + y} className={y === 0 ? 'gp-axis' : 'gp-grid'} x1={toX(xmin)} y1={toY(y)} x2={toX(xmax)} y2={toY(y)} />)

  const dist = roots.length === 2 && !isPoly ? Math.abs(roots[1] - roots[0]) : null

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
          {xTicks.map((x) => (
            <text key={'tx' + x} className="gp-tick" x={toX(x)} y={toY(0) + 13} textAnchor="middle">{x}</text>
          ))}
          {yTicks.map((y) => (
            <text key={'ty' + y} className="gp-tick" x={toX(0) - 7} y={toY(y) + 3} textAnchor="end">{y}</text>
          ))}
          {polyChunks.map((ch, i) => (
            <polyline key={i} className="gp-curve" stroke="url(#curveg)" points={ch.join(' ')} />
          ))}

          {/* Quadratic: vertex */}
          {!isPoly && vx !== undefined && vy !== undefined && vy >= ymin && vy <= ymax && (
            <g>
              <circle className="gp-point" cx={toX(vx)} cy={toY(vy)} r="4" fill="#9775fa" />
              <text className="gp-label" fill="#b9a5fb" x={toX(vx)} y={toY(vy) + 18} textAnchor="middle">꼭짓점</text>
            </g>
          )}

          {/* Quadratic: roots */}
          {!isPoly && roots.map((r, i) => (
            <g key={'r' + i}>
              <circle className="gp-point" cx={toX(r)} cy={toY(0)} r="6" fill="#4dabf7" stroke="#0a0c10" strokeWidth="2" />
              <text className="gp-label" fill="#8fc7ff" x={toX(r)} y={toY(0) - 11} textAnchor="middle">{fmt(r)}</text>
            </g>
          ))}

          {/* Quadratic: distance marker */}
          {dist !== null && (
            <g>
              <line x1={toX(roots[0])} y1={toY(0) + 24} x2={toX(roots[1])} y2={toY(0) + 24} stroke="#3bc9db" strokeWidth="1.6" strokeDasharray="4 3" />
              <text className="gp-label" fill="#3bc9db" x={toX((roots[0] + roots[1]) / 2)} y={toY(0) + 39} textAnchor="middle">거리 = {fmt(dist)}</text>
            </g>
          )}

          {/* Polynomial: extrema */}
          {isPoly && g.extrema?.map((e, i) => {
            const isMax = e.type === 'max'
            const labelY = isMax ? toY(e.y) - 14 : toY(e.y) + 18
            return (
              <g key={'ext' + i}>
                <circle cx={toX(e.x)} cy={toY(e.y)} r="6" fill="#9775fa" stroke="#0a0c10" strokeWidth="2" />
                <text className="gp-label" fill="#b9a5fb" x={toX(e.x)} y={labelY} textAnchor="middle">
                  {isMax ? '극대' : '극소'} {fmt(e.y)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {g.param && (
        <div className="graph-controls">
          <div className="slider-row">
            <span className="sl-lbl">상수항 c</span>
            <input type="range" min={g.param.min} max={g.param.max} step={g.param.step} value={c}
              onChange={(e) => setC(parseFloat(e.target.value))} />
            <span className="sl-val">c = {fmt(c)}</span>
          </div>
          <button className="btn btn-quiet btn-sm" onClick={() => setC(g.c ?? 0)}>
            <Icon name="refresh" size={15} /> 원래대로
          </button>
        </div>
      )}

      <div className="legend" style={{ marginTop: 12 }}>
        <span><i style={{ background: 'linear-gradient(90deg,#4dabf7,#3bc9db)' }} /> 그래프 {problem.qtextLatex}</span>
        {!isPoly && <span><i style={{ background: '#4dabf7' }} /> x축 교점</span>}
        {!isPoly && <span><i style={{ background: '#9775fa' }} /> 꼭짓점</span>}
        {isPoly && <span><i style={{ background: '#9775fa' }} /> 극대·극소</span>}
      </div>

      {isPoly ? (
        <p className="muted" style={{ fontSize: 12.5, marginTop: 12, lineHeight: 1.6 }}>
          보라색 점에서 그래프의 증감 방향이 바뀌어요.
          위쪽 보라색 점이 <b style={{ color: '#b9a5fb' }}>극댓값 2</b>,
          아래쪽 보라색 점이 <b style={{ color: '#b9a5fb' }}>극솟값 −2</b>예요.
        </p>
      ) : (
        <p className="muted" style={{ fontSize: 12.5, marginTop: 12, lineHeight: 1.6 }}>
          슬라이더로 상수항을 움직여 보세요. 두 교점(파란 점)이 가까워지거나 멀어지고, 그 <b style={{ color: '#3bc9db' }}>간격</b>이 바로 답이에요.
        </p>
      )}
    </div>
  )
}

export default GraphView
