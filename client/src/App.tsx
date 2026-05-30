import { useState, useEffect } from 'react'
import Icon from './components/icons'
import Stepper from './components/screens/Stepper'
import UploadScreen from './components/screens/UploadScreen'
import DiagnoseScreen from './components/screens/DiagnoseScreen'
import LoadingScreen from './components/screens/LoadingScreen'
import ResultScreen from './components/screens/ResultScreen'
import { PROBLEMS } from './data/sampleProblems'
import type { DifficultyType } from './data/sampleProblems'
import type { Phase } from './components/screens/Stepper'

function App() {
  const [phase, setPhase] = useState<Phase>('upload')
  const [problemKey, setProblemKey] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState<DifficultyType | null>(null)

  const problem = problemKey ? PROBLEMS[problemKey] : null

  useEffect(() => {
    const reveal = () => { if (document.hidden) document.body.classList.add('force-visible') }
    const t = setTimeout(reveal, 550)
    document.addEventListener('visibilitychange', reveal)
    return () => { clearTimeout(t); document.removeEventListener('visibilitychange', reveal) }
  }, [])

  const pick = (key: string) => {
    setProblemKey(key)
    setDifficulty(null)
    setPhase('recognizing')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const restart = () => {
    setPhase('upload')
    setProblemKey(null)
    setDifficulty(null)
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button className="brand" onClick={restart} style={{ background: 'none' }}>
            <span className="mark" />
            <span style={{ textAlign: 'left' }}>
              <span className="name">Sol<b>vio</b></span>
              <div className="tag">GenUI 수학 풀이 도우미</div>
            </span>
          </button>
          <div className="actions">
            <Stepper phase={phase} />
            {phase !== 'upload' && (
              <button className="btn btn-quiet btn-sm" onClick={restart} style={{ marginLeft: 8 }}>
                <Icon name="refresh" size={15} /> 처음으로
              </button>
            )}
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {phase === 'upload' && <UploadScreen onPick={pick} />}
        {phase === 'recognizing' && <LoadingScreen mode="recognize" onDone={() => setPhase('diagnose')} />}
        {phase === 'diagnose' && problem && (
          <DiagnoseScreen
            problem={problem}
            selected={difficulty}
            setSelected={setDifficulty}
            onContinue={() => { setPhase('generating'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          />
        )}
        {phase === 'generating' && <LoadingScreen mode="generate" onDone={() => setPhase('result')} />}
        {phase === 'result' && problem && difficulty && (
          <ResultScreen problem={problem} difficulty={difficulty} onRestart={restart} />
        )}
      </main>
    </div>
  )
}

export default App
