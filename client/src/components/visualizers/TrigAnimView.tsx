import { useEffect, useRef } from 'react'
import type { TrigGeometry } from '../../types/math'

declare const Desmos: any

interface TrigAnimViewProps {
  geometry: TrigGeometry
  mini?: boolean
}

// ─── Label sanitizer: LaTeX → Unicode (Desmos labels don't support \cmd) ───

function toPlainLabel(s: string): string {
  return s
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1)/($2)')
    .replace(/\\sqrt\{([^}]*)\}/g, '√($1)')
    .replace(/\\sqrt\s*(\d)/g, '√$1')
    .replace(/\\left|\\right/g, '')
    .replace(/\\cdot/g, '·')
    .replace(/\\times/g, '×')
    .replace(/\\pm/g, '±')
    .replace(/\\pi/g, 'π')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\phi/g, 'φ')
    .replace(/\\circ/g, '°')
    .replace(/\^{([^}]*)}/g, '^$1')
    .replace(/_{([^}]*)}/g, '_$1')
    .replace(/\\[a-zA-Z]+/g, '')
    .replace(/[{}]/g, '')
}

// ─── Vector helpers ─────────────────────────────────────────────────────────

type Vec2 = { x: number; y: number }

const sub  = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y })
const vlen = (v: Vec2) => Math.sqrt(v.x * v.x + v.y * v.y)
const vnorm = (v: Vec2, l: number): Vec2 => {
  const m = vlen(v) || 1
  return { x: v.x / m * l, y: v.y / m * l }
}
const f = (n: number) => n.toFixed(5)  // Desmos expression precision

// ─── Component ───────────────────────────────────────────────────────────────

const TrigAnimView = ({ geometry, mini = false }: TrigAnimViewProps) => {
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
      showGrid: false,
      showXAxis: false,
      showYAxis: false,
    })

    // ── 뷰포트: 꼭짓점 범위에 여백 추가, 정사각형으로 맞춤 ──────────────
    const xs = geometry.vertices.map(v => v.x)
    const ys = geometry.vertices.map(v => v.y)
    const pad = 20
    const rangeX = (Math.max(...xs) - Math.min(...xs)) + pad * 2
    const rangeY = (Math.max(...ys) - Math.min(...ys)) + pad * 2
    const range  = Math.max(rangeX, rangeY)
    const midX   = (Math.min(...xs) + Math.max(...xs)) / 2
    const midY   = (Math.min(...ys) + Math.max(...ys)) / 2
    calc.setMathBounds({
      left:   midX - range / 2,
      right:  midX + range / 2,
      bottom: midY - range / 2,
      top:    midY + range / 2,
    })

    // 꼭짓점 이름 → 좌표 맵
    const vm: Record<string, Vec2> = {}
    geometry.vertices.forEach(v => { vm[v.name] = { x: v.x, y: v.y } })

    // 무게중심 (꼭짓점 레이블을 바깥쪽으로 밀기 위함)
    const cx = geometry.vertices.reduce((s, v) => s + v.x, 0) / (geometry.vertices.length || 1)
    const cy = geometry.vertices.reduce((s, v) => s + v.y, 0) / (geometry.vertices.length || 1)

    // ① 채우기 영역 (fills 우선, 없으면 하위호환 fill 사용) ──────────────
    const FILL_COLORS: Record<string, string> = {
      blue:   '#3B82F6',
      red:    '#EF4444',
      green:  '#22C55E',
      orange: '#F97316',
      purple: '#A855F7',
      yellow: '#EAB308',
      teal:   '#14B8A6',
    }

    if (geometry.fills && geometry.fills.length > 0) {
      geometry.fills.forEach((fill, i) => {
        const pts = fill.vertices
          .map(n => vm[n])
          .filter(Boolean)
          .map(p => `(${f(p.x)},${f(p.y)})`)
          .join(',')
        if (!pts) return
        calc.setExpression({
          id: `fill_${i}`,
          latex: `polygon(${pts})`,
          color: FILL_COLORS[fill.color] ?? fill.color,
          lineWidth: 0,
          fillOpacity: 0.35,
        })
      })
    } else if (geometry.fill && geometry.fill.length >= 3) {
      const pts = geometry.fill
        .map(n => vm[n])
        .filter(Boolean)
        .map(p => `(${f(p.x)},${f(p.y)})`)
        .join(',')
      calc.setExpression({
        id: 'poly_fill',
        latex: `polygon(${pts})`,
        color: '#3B82F6',
        lineWidth: 0,
        fillOpacity: 0.35,
      })
    }

    // ② 선분 (실선 + 보조선 구분) ──────────────────────────────────────────
    geometry.segments.forEach((seg, i) => {
      const p1 = vm[seg.from], p2 = vm[seg.to]
      if (!p1 || !p2) return

      // 파라메트릭 직선: ((1-t)*x1 + t*x2, (1-t)*y1 + t*y2), t ∈ [0,1]
      calc.setExpression({
        id: `seg_${i}`,
        latex: `((1-t)\\cdot${f(p1.x)}+t\\cdot${f(p2.x)},(1-t)\\cdot${f(p1.y)}+t\\cdot${f(p2.y)})`,
        parametricDomain: { min: '0', max: '1' },
        color:     seg.dashed ? '#7C3AED' : '#1F2937',
        lineStyle: seg.dashed ? (Desmos.Styles?.DASHED ?? 'DASHED') : (Desmos.Styles?.SOLID ?? 'SOLID'),
        lineWidth: seg.dashed ? 1.5 : 2.5,
      })

      // 선분 레이블 (중점에서 법선 방향으로 오프셋, 무게중심 바깥쪽)
      if (seg.label) {
        const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2
        const dx = p2.x - p1.x, dy = p2.y - p1.y
        const l  = Math.sqrt(dx * dx + dy * dy) || 1
        const off = 5.5
        const ox = -dy / l * off, oy = dx / l * off
        const d1 = (mx + ox - cx) ** 2 + (my + oy - cy) ** 2
        const d2 = (mx - ox - cx) ** 2 + (my - oy - cy) ** 2
        const lx = d1 > d2 ? mx + ox : mx - ox
        const ly = d1 > d2 ? my + oy : my - oy
        calc.setExpression({
          id: `seg_lbl_${i}`,
          latex: `(${f(lx)},${f(ly)})`,
          showLabel: true,
          label: toPlainLabel(seg.label),
          color: seg.dashed ? '#7C3AED' : '#4B5563',
          pointSize: 1,
        })
      }
    })

    // ③ 직각 기호 (두 선분으로 L자 표시) ────────────────────────────────────
    // 직각 꼭짓점에 연결된 선분이 여러 개일 수 있으므로 (예: C에 A-C, B-C, D-C 모두 연결),
    // 내적이 0에 가장 가까운 쌍(= 가장 직각에 가까운 쌍)을 선택한다.
    geometry.vertices.filter(v => v.rightAngle).forEach((v, idx) => {
      const vp = vm[v.name]
      if (!vp) return
      const conn = geometry.segments.filter(s => s.from === v.name || s.to === v.name)
      if (conn.length < 2) return

      // 가장 직각에 가까운 선분 쌍 탐색
      let bestA1: Vec2 | null = null, bestA2: Vec2 | null = null
      let bestAbsDot = Infinity
      for (let i = 0; i < conn.length; i++) {
        for (let j = i + 1; j < conn.length; j++) {
          const n1 = conn[i].from === v.name ? conn[i].to : conn[i].from
          const n2 = conn[j].from === v.name ? conn[j].to : conn[j].from
          const p1 = vm[n1], p2 = vm[n2]
          if (!p1 || !p2) continue
          const da = sub(p1, vp), db = sub(p2, vp)
          const la = vlen(da), lb = vlen(db)
          if (la < 0.001 || lb < 0.001) continue
          const absDot = Math.abs((da.x * db.x + da.y * db.y) / (la * lb))
          if (absDot < bestAbsDot) {
            bestAbsDot = absDot
            bestA1 = p1; bestA2 = p2
          }
        }
      }
      const a1 = bestA1, a2 = bestA2
      if (!a1 || !a2) return

      const sz = 3.5
      const da = vnorm(sub(a1, vp), sz)
      const db = vnorm(sub(a2, vp), sz)
      const p1 = { x: vp.x + da.x, y: vp.y + da.y }
      const p2 = { x: vp.x + db.x, y: vp.y + db.y }
      const corner = { x: p1.x + db.x, y: p1.y + db.y }

      ;[
        [p1, corner],
        [corner, p2],
      ].forEach(([s, e], j) => {
        calc.setExpression({
          id: `ra${idx}_${j}`,
          latex: `((1-t)\\cdot${f(s.x)}+t\\cdot${f(e.x)},(1-t)\\cdot${f(s.y)}+t\\cdot${f(e.y)})`,
          parametricDomain: { min: '0', max: '1' },
          color: '#374151',
          lineWidth: 1.5,
        })
      })
    })

    // ④ 각도 호 + 레이블 ─────────────────────────────────────────────────────
    // rightAngle: true 꼭짓점은 L자 마커가 이미 있으므로 호(arc) 생략
    geometry.angles?.forEach((ang, i) => {
      const vertInfo = geometry.vertices.find(v => v.name === ang.vertex)
      if (vertInfo?.rightAngle) return
      const vp = vm[ang.vertex], r1p = vm[ang.ray1], r2p = vm[ang.ray2]
      if (!vp || !r1p || !r2p) return

      const r  = ang.highlight ? 12 : 8
      const a1 = Math.atan2(r1p.y - vp.y, r1p.x - vp.x)
      const a2 = Math.atan2(r2p.y - vp.y, r2p.x - vp.x)
      let diff = a2 - a1
      while (diff >  Math.PI) diff -= 2 * Math.PI
      while (diff < -Math.PI) diff += 2 * Math.PI

      const arcMin = Math.min(a1, a1 + diff)
      const arcMax = Math.max(a1, a1 + diff)
      const color  = ang.highlight ? '#7C3AED' : '#6B7280'

      // 원 파라메트릭 호: (cx + r*cos(t), cy + r*sin(t))
      calc.setExpression({
        id: `arc_${i}`,
        latex: `(${f(vp.x)}+${f(r)}\\cos(t),${f(vp.y)}+${f(r)}\\sin(t))`,
        parametricDomain: { min: f(arcMin), max: f(arcMax) },
        color,
        lineWidth: ang.highlight ? 2.5 : 1.5,
      })

      // 호 중간 지점에 각도 레이블
      const midA  = a1 + diff / 2
      const lr    = r + 7
      calc.setExpression({
        id: `arc_lbl_${i}`,
        latex: `(${f(vp.x + lr * Math.cos(midA))},${f(vp.y + lr * Math.sin(midA))})`,
        showLabel: true,
        label: toPlainLabel(ang.label),
        color,
        pointSize: 1,
      })
    })

    // ⑤ 꼭짓점 점 + 레이블 ──────────────────────────────────────────────────
    geometry.vertices.forEach((v, i) => {
      const vp = vm[v.name]
      if (!vp) return
      calc.setExpression({
        id: `vert_${i}`,
        latex: `(${f(vp.x)},${f(vp.y)})`,
        color: v.rightAngle ? '#4B5563' : '#1D4ED8',
        pointSize: 10,
        showLabel: true,
        label: v.name,
        labelSize: Desmos.LabelSizes?.LARGE ?? 'large',
      })
    })

    return () => { try { calc.destroy() } catch (_) { /* ignore */ } }
  }, [JSON.stringify(geometry)])  // eslint-disable-line react-hooks/exhaustive-deps

  const hasDashed    = geometry.segments.some(s => s.dashed)
  const hasHighlight = geometry.angles?.some(a => a.highlight) ?? false
  const fillColorMap: Record<string, string> = {
    blue: '#3B82F6', red: '#EF4444', green: '#22C55E',
    orange: '#F97316', purple: '#A855F7', yellow: '#EAB308', teal: '#14B8A6',
  }
  const activeFills = geometry.fills?.length
    ? geometry.fills
    : geometry.fill?.length ? [{ vertices: geometry.fill, color: 'blue' }] : []

  return (
    <div>
      {!mini && (
        <div className="desmos-inline-label">
          <span style={{ color: '#1D4ED8' }}>●</span> 꼭짓점
          {activeFills.map((fl, i) => (
            <span key={i}>
              &nbsp;&nbsp;<span style={{ color: fillColorMap[fl.color] ?? fl.color }}>■</span> {fl.color === 'blue' ? '도형 영역' : `영역 ${i + 1}`}
            </span>
          ))}
          {hasDashed && (
            <>&nbsp;&nbsp;<span style={{ color: '#7C3AED' }}>╌</span> 보조선</>
          )}
          {hasHighlight && (
            <>&nbsp;&nbsp;<span style={{ color: '#7C3AED' }}>⌒</span> 핵심 각도</>
          )}
        </div>
      )}
      <div ref={elRef} style={{ width: '100%', height: mini ? 200 : 390 }} />
      {!mini && (
        <p className="muted" style={{ fontSize: 12.5, marginTop: 10, lineHeight: 1.6 }}>
          {geometry.description} — 마우스 휠로 확대·축소, 드래그로 이동할 수 있어요.
        </p>
      )}
    </div>
  )
}

export default TrigAnimView
