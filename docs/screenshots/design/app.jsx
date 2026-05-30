/* ============================================================
   Solvio — App (상태머신)
   upload → recognizing → diagnose → generating → result
   ============================================================ */
const App = () => {
  const [phase, setPhase] = useState("upload");
  const [problemKey, setProblemKey] = useState(null);
  const [difficulty, setDifficulty] = useState(null);

  const problem = problemKey ? window.PROBLEMS[problemKey] : null;

  // 백그라운드/숨김 상태에서 진입 애니메이션이 멈춰 콘텐츠가 안 보이는 것 방지
  useEffect(() => {
    const reveal = () => { if (document.hidden) document.body.classList.add("force-visible"); };
    const t = setTimeout(reveal, 550);
    document.addEventListener("visibilitychange", reveal);
    return () => { clearTimeout(t); document.removeEventListener("visibilitychange", reveal); };
  }, []);

  const pick = (key) => {
    setProblemKey(key);
    setDifficulty(null);
    setPhase("recognizing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const restart = () => {
    setPhase("upload");
    setProblemKey(null);
    setDifficulty(null);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button className="brand" onClick={restart} style={{ background: "none" }}>
            <span className="mark" />
            <span style={{ textAlign: "left" }}>
              <span className="name"><b>Solvio</b></span>
              <div className="tag">GenUI 수학 풀이 도우미</div>
            </span>
          </button>
          <div className="actions">
            <Stepper phase={phase} />
            {phase !== "upload" && (
              <button className="btn btn-quiet btn-sm" onClick={restart} style={{ marginLeft: 8 }}>
                <Icon name="refresh" size={15} /> 처음으로
              </button>
            )}
          </div>
        </div>
      </header >

      <main style={{ flex: 1 }}>
        {phase === "upload" && <UploadScreen onPick={pick} />}
        {phase === "recognizing" && <LoadingScreen mode="recognize" onDone={() => setPhase("diagnose")} />}
        {phase === "diagnose" && (
          <DiagnoseScreen
            problem={problem}
            selected={difficulty}
            setSelected={setDifficulty}
            onContinue={() => { setPhase("generating"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          />
        )}
        {phase === "generating" && <LoadingScreen mode="generate" onDone={() => setPhase("result")} />}
        {phase === "result" && <ResultScreen problem={problem} difficulty={difficulty} onRestart={restart} />}
      </main>
    </div >
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
