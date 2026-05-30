/* ============================================================
   Solvio — 화면 컴포넌트
   Stepper · UploadScreen · DiagnoseScreen · LoadingScreen · ResultScreen
   ============================================================ */

/* ---- 상단 진행 스텝 ---- */
const STEPS = [
  { key: "upload", label: "업로드" },
  { key: "diagnose", label: "진단" },
  { key: "result", label: "풀이" },
];
const Stepper = ({ phase }) => {
  const idx = { upload: 0, recognizing: 0, diagnose: 1, generating: 1, result: 2 }[phase];
  const working = phase === "recognizing" || phase === "generating";
  return (
    <div className="stepper">
      {STEPS.map((s, i) => {
        let cls = "dot";
        if (i < idx || (i === idx && phase === "result")) cls += " done";
        if (i === idx) cls += working && i !== 2 ? " active" : i === idx ? " active" : "";
        const isDone = i < idx;
        return (
          <React.Fragment key={s.key}>
            {i > 0 && <span className="sep" />}
            <div className={"dot" + (i === idx ? " active" : "") + (isDone ? " done" : "")}>
              <span className="n">{isDone ? <Icon name="check" size={12} /> : i + 1}</span>
              <span className="lbl">{s.label}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ---- 업로드된 문제 본문 렌더 ---- */
const ProblemBody = ({ p }) => {
  if (p.qtail2 !== undefined) {
    // 활용문제: 인라인 혼합
    return (
      <div className="qtext">
        {p.qtext}<Katex tex={p.qtextLatex} display={false} />{p.qtail}
        <Katex tex={p.qtextLatex2} display={false} />{p.qtail2}
      </div>
    );
  }
  if (p.qtail) {
    // 그래프형: 인라인
    return (
      <div className="qtext">
        {p.qtext} <Katex tex={p.qtextLatex} display={false} /> {p.qtail}
      </div>
    );
  }
  // 수식형: 식을 블록으로
  return (
    <div>
      <div className="qtext">{p.qtext}</div>
      <div className="qmath"><Katex tex={p.qtextLatex} /></div>
    </div>
  );
};

/* ============================================================
   1 · 업로드 화면
   ============================================================ */
const UploadScreen = ({ onPick }) => {
  const [drag, setDrag] = useState(false);
  const fileRef = useRef(null);

  const samples = [
    { key: "graph", icon: "graph", cls: "graph", title: "함수·그래프형", desc: "이차함수와 x축 교점 — 인터랙티브 그래프로 풀이" },
    { key: "application", icon: "drop", cls: "app", title: "활용문제형", desc: "물탱크 채우기 — 애니메이션으로 상황 모델링" },
    { key: "formula", icon: "func", cls: "formula", title: "단순 수식형", desc: "이차방정식 — 단계별 수식 전개" },
  ];

  return (
    <div className="container screen">
      <div className="upload-wrap">
        <div className="hero-eyebrow stack stack-1">
          <span className="badge">GenUI</span>
          막힌 곳부터 풀어주는 맞춤 수학 도우미
        </div>
        <h1 className="hero-title stack stack-1">
          수학 문제 사진을 올리면,<br /><em>이해되는 방식으로</em> 풀어드려요
        </h1>
        <p className="hero-sub stack stack-2">
          스크린샷 한 장이면 충분해요. 문제를 알아서 분류하고, 어디서 막혔는지 먼저 물어본 뒤
          그래프·애니메이션·단계 풀이로 <b style={{ color: "var(--text-1)" }}>학생에게 맞는 설명</b>을 만들어 줍니다.
        </p>

        <div
          className={"dropzone stack stack-2" + (drag ? " drag" : "")}
          onClick={() => onPick("graph")}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); onPick("graph"); }}
        >
          <div className="uic"><Icon name="upload" size={32} /></div>
          <h3>스크린샷을 여기에 끌어다 놓으세요</h3>
          <p>또는 <b style={{ color: "var(--accent)" }}>클릭해서 파일 선택</b></p>
          <div className="meta">
            <span className="chip"><span className="ico"><Icon name="image" size={14} /></span> PNG · JPG</span>
            <span className="chip"><span className="ico"><Icon name="bolt" size={14} /></span> 평균 3초</span>
          </div>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg" hidden onChange={() => onPick("graph")} />
        </div>

        <div className="reassure stack stack-3">
          <span><Icon name="check" size={15} className="ok" style={{ color: "var(--good)" }} /> 로그인·회원가입 없이 바로 시작</span>
          <span><Icon name="lock" size={15} /> 사진은 풀이에만 쓰이고 저장하지 않아요</span>
        </div>

        <div className="samples stack stack-4">
          <div className="lead">사진이 없다면, 예시 문제로 바로 체험해 보세요</div>
          <div className="sample-grid">
            {samples.map((s) => (
              <button key={s.key} className="sample" onClick={() => onPick(s.key)}>
                <div className={"ico " + s.cls}><Icon name={s.icon} size={20} /></div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
                <span className="go">체험하기 <Icon name="arrow" size={13} /></span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   2 · 진단 화면 (인식된 문제 + 유형 + 어려움 객관식)
   ============================================================ */
const DiagnoseScreen = ({ problem, selected, setSelected, onContinue }) => {
  const typeIcon = { graph: "graph", application: "drop", formula: "func" }[problem.type];
  return (
    <div className="container screen">
      <div className="diagnose">
        {/* 업로드된 스크린샷 */}
        <div className="card shot-card stack stack-1">
          <div className="shot-head">
            <div className="dots"><i /><i /><i /></div>
            <span className="fname">{problem.fname}</span>
          </div>
          <div className="shot-body scan">
            <div className="qno">{problem.qno}</div>
            <ProblemBody p={problem} />
          </div>
        </div>

        {/* AI 분석 */}
        <div className="analysis">
          <div className="recog stack stack-2">
            <div className="recog-head">
              <span className="ok"><Icon name="check" size={15} /></span>
              <h2>문제를 인식했어요</h2>
            </div>
            <div className="typecard">
              <div className="ti"><Icon name={typeIcon} size={24} /></div>
              <div className="tt">
                <div className="lbl">분류된 유형</div>
                <h3>{problem.typeLabel}</h3>
                <p>{problem.typeDesc}</p>
              </div>
              <div className="conf">
                <div className="pct">{problem.confidence}%</div>
                <div className="cl">신뢰도</div>
              </div>
            </div>
          </div>

          <div className="survey card card-pad stack stack-3">
            <div className="q">
              <span className="ai"><Icon name="spark" size={16} /></span>
              <div className="qt">
                <h3>어떤 부분이 가장 어려웠나요?</h3>
                <p>막힌 지점에 맞춰 설명 방식을 바꿔드릴게요</p>
              </div>
            </div>
            <div className="opts">
              {window.DIFFICULTIES.map((d) => (
                <button key={d.code} className={"opt" + (selected === d.code ? " sel" : "")} onClick={() => setSelected(d.code)}>
                  <span className="oi"><Icon name={d.icon} size={18} /></span>
                  <div className="ot">
                    <h4>{d.title}</h4>
                    <p>{d.desc}</p>
                  </div>
                  <span className="check"><Icon name="check" size={16} /></span>
                </button>
              ))}
            </div>
            <div className="diag-cta">
              <span className="hint">{selected ? "선택 완료 — 맞춤 풀이를 만들 준비가 됐어요" : "하나를 선택하면 풀이가 시작돼요"}</span>
              <button className="btn btn-primary" disabled={!selected} onClick={onContinue}>
                맞춤 풀이 생성 <Icon name="arrow" size={17} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   로딩 화면 (인식 / 생성)
   ============================================================ */
const LoadingScreen = ({ mode, onDone }) => {
  const config = {
    recognize: {
      title: "문제를 읽고 있어요",
      duration: 2200,
      steps: ["이미지에서 수식을 추출하는 중", "문제 유형을 분류하는 중", "핵심 조건을 정리하는 중"],
    },
    generate: {
      title: "학생에게 맞는 풀이를 만들고 있어요",
      duration: 3500,
      steps: ["막힌 지점에 맞춰 설명 방식을 고르는 중", "단계별 풀이를 구성하는 중", "그래프·애니메이션을 그리는 중"],
    },
  }[mode];

  const [prog, setProg] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const e = Date.now() - start;
      const p = Math.min(100, (e / config.duration) * 100);
      setProg(p);
      setStepIdx(Math.min(config.steps.length - 1, Math.floor((p / 100) * config.steps.length)));
      if (p >= 100) { clearInterval(id); setTimeout(onDone, 280); }
    }, 60);
    return () => clearInterval(id);
  }, [mode]);

  return (
    <div className="container">
      <div className="loading screen">
        <div className="load-visual">
          <svg viewBox="0 0 200 200">
            <defs>
              <linearGradient id="lg" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor="#4dabf7" /><stop offset="1" stopColor="#3bc9db" />
              </linearGradient>
            </defs>
            <g className="load-grid">
              {[40, 80, 120, 160].map((v) => <line key={"a" + v} x1={v} y1="20" x2={v} y2="180" />)}
              {[40, 80, 120, 160].map((v) => <line key={"b" + v} x1="20" y1={v} x2="180" y2={v} />)}
            </g>
            <line className="load-axis" x1="20" y1="160" x2="185" y2="160" />
            <line className="load-axis" x1="40" y1="20" x2="40" y2="180" />
            <path className="load-curve" d="M40 150 Q 80 30 110 110 T 175 40" />
            <circle className="load-dot" cx="175" cy="40" r="5" />
          </svg>
        </div>
        <div>
          <div className="load-title">{config.title}</div>
          <div className="load-status"><span key={stepIdx} className="blink">{config.steps[stepIdx]}…</span></div>
        </div>
        <div className="load-bar"><i style={{ width: prog + "%" }} /></div>
        <div className="load-steps">
          {config.steps.map((s, i) => (
            <div key={i} className={"ls" + (i < stepIdx ? " ok" : "") + (i === stepIdx ? " on" : "")}>
              <span className="m">{i < stepIdx ? <Icon name="check" size={11} /> : null}</span>
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ---- 정적 단계 목록 (그래프/활용형 사이드) ---- */
const StepsList = ({ steps }) => (
  <div className="fsteps">
    {steps.map((s, i) => (
      <div key={i} className="fstep shown">
        <div className="num">{i + 1}</div>
        <div className="fc">
          <div className="desc"><RichText text={s.desc} /></div>
          <div className="math-box"><Katex tex={s.latex} /></div>
          {s.note && <div className="note"><Icon name="check" size={14} /> {s.note}</div>}
        </div>
      </div>
    ))}
  </div>
);

/* ============================================================
   3 · 답안 화면
   ============================================================ */
const ResultScreen = ({ problem, difficulty, onRestart }) => {
  const diff = window.DIFFICULTIES.find((d) => d.code === difficulty) || window.DIFFICULTIES[0];
  const stuckText = (problem.stuck && problem.stuck[difficulty]) || problem.stuck[problem.defaultDifficulty];

  const Viz = { graph: GraphView, application: AnimationView, formula: FormulaView }[problem.type];
  const vizMeta = {
    graph: { icon: "graph", label: "인터랙티브 그래프" },
    application: { icon: "motion", label: "상황 애니메이션" },
    formula: { icon: "layers", label: "단계별 수식 풀이" },
  }[problem.type];

  return (
    <div className="container result screen">
      <div className="result-head">
        <div className="rh-thumb">{problem.thumb}</div>
        <div className="rh-info">
          <h1>{problem.title}</h1>
          <div className="meta">
            <span className="tagpill type"><Icon name={vizMeta.icon} size={13} /> {problem.typeLabel}</span>
            <span className="tagpill diff"><Icon name={diff.icon} size={13} /> 막힌 곳: {diff.title}</span>
            <span className="tagpill dot"><Icon name="spark" size={12} /> 맞춤 풀이</span>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onRestart}>
          <Icon name="refresh" size={16} /> 새 문제
        </button>
      </div>

      <div className="result-grid">
        {/* 시각화 */}
        <div className="card viz stack stack-1">
          <div className="viz-head">
            <div className="vt"><span className="vi"><Icon name={vizMeta.icon} size={16} /></span> {vizMeta.label}</div>
            <span className="kbd">{problem.type}.view</span>
          </div>
          <div className="viz-body">
            <Viz problem={problem} />
          </div>
        </div>

        {/* 사이드 — 막힌 지점 + 풀이 단계 */}
        <div className="side">
          <div className="card panel stack stack-2">
            <div className="panel-title"><span className="pi"><Icon name="target" size={17} /></span> 학생의 막힌 지점에 맞춘 설명</div>
            <div className="stuck-note">
              <span className="si"><Icon name="bulb" size={18} /></span>
              <p><RichText text={stuckText} /></p>
            </div>
          </div>

          <div className="card panel stack stack-3">
            <div className="panel-title"><span className="pi"><Icon name="layers" size={17} /></span> 단계별 풀이</div>
            {problem.type === "formula" ? (
              <p className="muted" style={{ fontSize: 13, lineHeight: 1.6 }}>
                왼쪽에서 ‘다음 단계’ 버튼을 눌러 한 단계씩 직접 전개해 보세요.
                스스로 다음 식을 예상해 본 뒤 확인하면 훨씬 오래 기억에 남아요.
              </p>
            ) : (
              <StepsList steps={problem.steps} />
            )}
          </div>
        </div>
      </div>

      {/* 채팅 */}
      <ChatPanel problem={problem} />
    </div>
  );
};

Object.assign(window, { Stepper, UploadScreen, DiagnoseScreen, LoadingScreen, ResultScreen, ProblemBody, StepsList });
