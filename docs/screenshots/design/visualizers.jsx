/* ============================================================
   Solvio — 시각화 컴포넌트
   Katex(블록/인라인), GraphView, FormulaView, AnimationView
   ============================================================ */
const { useState, useEffect, useRef, useCallback } = React;

/* ---- KaTeX block ---- */
const Katex = ({ tex, display = true }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !window.katex) return;
    try {
      window.katex.render(tex, ref.current, { displayMode: display, throwOnError: false });
    } catch (e) {
      ref.current.textContent = tex;
    }
  }, [tex, display]);
  return <span ref={ref} />;
};

/* ---- text with inline \( ... \) math ---- */
const RichText = ({ text }) => {
  if (!text) return null;
  const parts = String(text).split(/(\\\(.*?\\\))/g);
  return (
    <>
      {parts.map((p, i) => {
        const m = p.match(/^\\\((.*)\\\)$/);
        if (m) return <Katex key={i} tex={m[1]} display={false} />;
        // allow simple <b> bold tags from data
        if (p.includes("<b>")) {
          return <span key={i} dangerouslySetInnerHTML={{ __html: p }} />;
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
};

/* ============================================================
   GraphView — interactive coordinate plane (Desmos 풍)
   ============================================================ */
const GraphView = ({ problem }) => {
  const g = problem.graph;
  const [c, setC] = useState(g.c);
  const a = g.a, b = g.b;

  // world & svg mapping
  const W = 380, H = 320, pad = 6;
  const xmin = -2, xmax = 6, ymin = -4, ymax = 8;
  const toX = (x) => pad + (x - xmin) / (xmax - xmin) * (W - 2 * pad);
  const toY = (y) => pad + (1 - (y - ymin) / (ymax - ymin)) * (H - 2 * pad);

  // curve samples
  const pts = [];
  for (let x = xmin; x <= xmax + 0.001; x += 0.1) {
    const y = a * x * x + b * x + c;
    if (y >= ymin - 2 && y <= ymax + 2) pts.push(`${toX(x).toFixed(1)},${toY(y).toFixed(1)}`);
    else pts.push(null);
  }
  const polyChunks = [];
  let cur = [];
  pts.forEach((p) => { if (p) cur.push(p); else { if (cur.length) polyChunks.push(cur); cur = []; } });
  if (cur.length) polyChunks.push(cur);

  // roots
  const disc = b * b - 4 * a * c;
  let roots = [];
  if (disc >= 0) {
    const s = Math.sqrt(disc);
    roots = [(-b - s) / (2 * a), (-b + s) / (2 * a)].sort((p, q) => p - q);
  }
  const vx = -b / (2 * a);
  const vy = a * vx * vx + b * vx + c;
  const dist = roots.length === 2 ? Math.abs(roots[1] - roots[0]) : null;

  const gridLines = [];
  for (let x = xmin; x <= xmax; x++) gridLines.push(<line key={"vx" + x} className={x === 0 ? "gp-axis" : "gp-grid"} x1={toX(x)} y1={toY(ymin)} x2={toX(x)} y2={toY(ymax)} />);
  for (let y = ymin; y <= ymax; y++) gridLines.push(<line key={"hy" + y} className={y === 0 ? "gp-axis" : "gp-grid"} x1={toX(xmin)} y1={toY(y)} x2={toX(xmax)} y2={toY(y)} />);

  const fmt = (n) => (Math.round(n * 100) / 100).toString();

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
          {/* x ticks */}
          {[-1, 1, 2, 3, 4, 5].map((x) => (
            <text key={"tx" + x} className="gp-tick" x={toX(x)} y={toY(0) + 13} textAnchor="middle">{x}</text>
          ))}
          {[2, 4, 6].map((y) => (
            <text key={"ty" + y} className="gp-tick" x={toX(0) - 7} y={toY(y) + 3} textAnchor="end">{y}</text>
          ))}
          {/* curve */}
          {polyChunks.map((ch, i) => (
            <polyline key={i} className="gp-curve" stroke="url(#curveg)" points={ch.join(" ")} />
          ))}
          {/* vertex */}
          {vy >= ymin && vy <= ymax && (
            <g>
              <circle className="gp-point" cx={toX(vx)} cy={toY(vy)} r="4" fill="#9775fa" />
              <text className="gp-label" fill="#b9a5fb" x={toX(vx)} y={toY(vy) + 18} textAnchor="middle">꼭짓점</text>
            </g>
          )}
          {/* roots */}
          {roots.map((r, i) => (
            <g key={"r" + i}>
              <circle className="gp-point" cx={toX(r)} cy={toY(0)} r="6" fill="#4dabf7" stroke="#0a0c10" strokeWidth="2" />
              <text className="gp-label" fill="#8fc7ff" x={toX(r)} y={toY(0) - 11} textAnchor="middle">{fmt(r)}</text>
            </g>
          ))}
          {/* distance bracket */}
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
        <span><i style={{ background: "linear-gradient(90deg,#4dabf7,#3bc9db)" }} /> 그래프 y = x²−4x+{fmt(c)}</span>
        <span><i style={{ background: "#4dabf7" }} /> x축 교점</span>
        <span><i style={{ background: "#9775fa" }} /> 꼭짓점</span>
      </div>
      <p className="muted" style={{ fontSize: 12.5, marginTop: 12, lineHeight: 1.6 }}>
        슬라이더로 상수항을 움직여 보세요. 두 교점(파란 점)이 가까워지거나 멀어지고, 그 <b style={{ color: "#3bc9db" }}>간격</b>이 바로 답이에요.
        c = 3 일 때 거리는 <b style={{ color: "#3bc9db" }}>2</b> 입니다.
      </p>
    </div>
  );
};

/* ============================================================
   FormulaView — 단계별 풀이 (학생 페이스로 전개)
   ============================================================ */
const FormulaView = ({ problem }) => {
  const steps = problem.steps;
  const [shown, setShown] = useState(1);
  const done = shown >= steps.length;

  return (
    <div>
      <div className="fsteps">
        {steps.map((s, i) => {
          const visible = i < shown;
          const isCur = i === shown - 1;
          return (
            <div key={i} className={"fstep" + (visible ? " shown" : "") + (isCur ? " cur" : "")}>
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
          );
        })}
      </div>
      <div className="formula-controls">
        <span className="step-prog">{shown} / {steps.length} 단계</span>
        <div style={{ display: "flex", gap: 10 }}>
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
  );
};

/* ============================================================
   AnimationView — 물탱크 채우기 (Motion 풍 SVG 애니메이션)
   ============================================================ */
const AnimationView = ({ problem }) => {
  const cfg = problem.anim;
  const [t, setT] = useState(0);            // 0..1 progress
  const [playing, setPlaying] = useState(false);
  const raf = useRef(0);
  const last = useRef(0);
  const PLAY = 5200; // ms for full fill

  const tick = useCallback((now) => {
    if (!last.current) last.current = now;
    const dt = now - last.current; last.current = now;
    setT((prev) => {
      const nx = prev + dt / PLAY;
      if (nx >= 1) { setPlaying(false); return 1; }
      return nx;
    });
    raf.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (playing) { last.current = 0; raf.current = requestAnimationFrame(tick); }
    return () => cancelAnimationFrame(raf.current);
  }, [playing, tick]);

  const toggle = () => {
    if (t >= 1) { setT(0); setTimeout(() => setPlaying(true), 30); }
    else setPlaying((p) => !p);
  };

  const seconds = (t * cfg.fillSeconds).toFixed(1);
  const height = (t * cfg.heightCm).toFixed(1);

  // SVG geometry
  const W = 380, H = 320;
  const tankX = 70, tankY = 46, tankW = 150, tankH = 220;
  const waterH = t * tankH;
  const waterY = tankY + tankH - waterH;

  // mini graph (right side) h=2t
  const gx = 252, gy = 60, gw = 100, gh = 200;
  const gpx = gx + t * gw;
  const gpy = gy + gh - t * gh;

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

          {/* faucet */}
          <rect x={tankX + tankW / 2 - 6} y="14" width="12" height="20" rx="3" fill="#3a4254" />
          {playing && t < 1 && (
            <line x1={tankX + tankW / 2} y1="34" x2={tankX + tankW / 2} y2={waterY} stroke="#3bc9db" strokeWidth="3" strokeDasharray="3 5">
              <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="0.4s" repeatCount="indefinite" />
            </line>
          )}

          {/* tank water (clipped) */}
          <clipPath id="tankclip"><rect x={tankX} y={tankY} width={tankW} height={tankH} rx="6" /></clipPath>
          <g clipPath="url(#tankclip)">
            <rect x={tankX} y={waterY} width={tankW} height={waterH + 4} fill="url(#water)" />
            {/* surface wave */}
            <path d={`M${tankX} ${waterY} q ${tankW / 4} -7 ${tankW / 2} 0 t ${tankW / 2} 0 v 10 h -${tankW} z`} fill="#4dd4e6" opacity="0.5">
              {t > 0 && t < 1 && <animate attributeName="d" dur="1.4s" repeatCount="indefinite"
                values={`M${tankX} ${waterY} q ${tankW / 4} -7 ${tankW / 2} 0 t ${tankW / 2} 0 v 10 h -${tankW} z;M${tankX} ${waterY} q ${tankW / 4} 7 ${tankW / 2} 0 t ${tankW / 2} 0 v 10 h -${tankW} z;M${tankX} ${waterY} q ${tankW / 4} -7 ${tankW / 2} 0 t ${tankW / 2} 0 v 10 h -${tankW} z`} />}
            </path>
          </g>
          {/* tank outline */}
          <rect x={tankX} y={tankY} width={tankW} height={tankH} rx="6" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="2.5" />
          {/* height marks */}
          {[0, 0.5, 1].map((f, i) => (
            <g key={i}>
              <line x1={tankX - 6} y1={tankY + tankH - f * tankH} x2={tankX} y2={tankY + tankH - f * tankH} stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
              <text className="gp-tick" x={tankX - 9} y={tankY + tankH - f * tankH + 3} textAnchor="end">{Math.round(f * cfg.heightCm)}</text>
            </g>
          ))}
          <text className="gp-label" fill="#a4adbe" x={tankX + tankW / 2} y={tankY + tankH + 20} textAnchor="middle">물탱크 (높이 {cfg.heightCm}cm)</text>

          {/* mini graph h=2t */}
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
          <Icon name={playing ? "pause" : "play"} size={20} />
        </button>
        <div className="anim-track">
          <div className="scrub"><i style={{ width: `${t * 100}%` }} /></div>
          <div className="alabel">
            <span className="mono" style={{ color: "#3bc9db" }}>t = {seconds}초</span>
            <span style={{ margin: "0 8px", color: "var(--text-3)" }}>→</span>
            <span className="mono" style={{ color: "#4dabf7" }}>h = {height}cm</span>
            {t >= 1 && <span style={{ color: "var(--good)", marginLeft: 10, fontWeight: 700 }}>가득 찼어요! h = 2t</span>}
          </div>
        </div>
      </div>
      <p className="muted" style={{ fontSize: 12.5, marginTop: 14, lineHeight: 1.6 }}>
        ▶︎ 를 누르면 물이 일정한 속도로 차오릅니다. 왼쪽 물높이와 오른쪽 직선이 <b style={{ color: "#3bc9db" }}>똑같은 비율</b>로 올라가죠.
        이게 바로 ‘정비례 = 일차식 <span style={{ color: "#4dabf7" }}>h = 2t</span>’ 의 의미예요.
      </p>
    </div>
  );
};

Object.assign(window, { Katex, RichText, GraphView, FormulaView, AnimationView });
