import { useState, useEffect } from 'react'
import Icon from './components/icons'
import Stepper from './components/screens/Stepper'
import UploadScreen from './components/screens/UploadScreen'
import DiagnoseScreen from './components/screens/DiagnoseScreen'
import LoadingScreen from './components/screens/LoadingScreen'
import ResultScreen from './components/screens/ResultScreen'
import { PROBLEMS } from './data/sampleProblems'
import type { Problem, DifficultyType } from './data/sampleProblems'
import type { Phase } from './components/screens/Stepper'
import { useProblemAnalysis } from './hooks/useProblemAnalysis'
import type { AnalysisResult, SolutionResult } from './types/math'

// API 응답을 기존 visualizer가 사용하는 Problem 형태로 변환
function buildProblemFromAPI(
  analysis: AnalysisResult,
  solution: SolutionResult | null,
  difficultyType: DifficultyType | null,
  fileName: string
): Problem {
  const typeLabels: Record<string, string> = {
    formula: '단순 수식형',
    graph: '함수·그래프형',
    application: '활용문제형',
  }
  const typeDescs: Record<string, string> = {
    formula: '직접 계산해서 답을 구하는 방정식·부등식 문제예요.',
    graph: '함수의 모양과 관계를 시각적으로 이해해야 하는 문제예요.',
    application: '상황을 해석해서 수식으로 모델링해야 하는 문제예요.',
  }

  const steps = solution?.steps ?? []

  const stuck: Partial<Record<DifficultyType, string>> = {}
  if (difficultyType && solution?.stuckExplanation) {
    stuck[difficultyType] = solution.stuckExplanation
  }

  // graph / formula: roots+vertex로 포물선 계수 역산하여 GraphView 재사용
  let graph: Problem['graph']
  const buildGraph = (roots: number[] | undefined, vertex: [number, number] | undefined) => {
    let a = 1, b = 0, c = 0
    if (roots && roots.length === 2) {
      const [r1, r2] = roots
      b = -(r1 + r2)
      c = r1 * r2
    } else if (vertex) {
      const [vx, vy] = vertex
      b = -2 * vx
      c = vy + vx * vx
    }
    const vx = -b / (2 * a)
    return {
      a, b, c,
      roots: roots ?? [],
      vertex: vertex ?? [vx, a * vx * vx + b * vx + c] as [number, number],
      param: { key: 'c', label: 'c', min: Math.floor(c) - 4, max: Math.ceil(c) + 4, step: 0.5, value: c },
    }
  }

  if (analysis.problemType === 'graph') {
    const vd = solution?.visualData
    if (vd?.type === 'graph') {
      graph = buildGraph(vd.roots, vd.vertex)
    } else {
      graph = buildGraph([], undefined)
    }
  }

  // formula: visualData에 roots/vertex가 있으면 GraphView용 그래프도 구성
  if (analysis.problemType === 'formula') {
    const vd = solution?.visualData
    if (vd?.type === 'formula' && (vd.roots?.length || vd.vertex)) {
      graph = buildGraph(vd.roots, vd.vertex)
    }
  }

  // application: visualData 필드를 AnimationView 형태로 매핑
  let anim: Problem['anim']
  if (analysis.problemType === 'application') {
    const vd = solution?.visualData
    anim = {
      fillSeconds: (vd as { totalTime?: number })?.totalTime ?? 10,
      heightCm: (vd as { totalHeight?: number })?.totalHeight ?? 20,
      rate: (vd as { rate?: number })?.rate ?? 2,
    }
  }

  return {
    id: 'uploaded',
    type: analysis.problemType,
    typeLabel: typeLabels[analysis.problemType] ?? analysis.problemType,
    typeDesc: typeDescs[analysis.problemType] ?? '',
    fname: fileName,
    confidence: analysis.confidence ?? 93,
    qno: '업로드 문제',
    qtext: analysis.problemText,
    qtextLatex: analysis.latex,
    title: '업로드된 수학 문제',
    thumb: analysis.latex.slice(0, 20),
    defaultDifficulty: difficultyType ?? 'understanding',
    steps,
    stuck,
    graph,
    anim,
    chat: {
      hello: '문제를 분석했어요. 단계별 풀이를 확인해 보세요. 궁금한 점이 있으면 편하게 물어봐요!',
      suggestions: [],
      replies: {},
    },
  }
}

function App() {
  const [phase, setPhase] = useState<Phase>('upload')

  // 샘플 문제 모드
  const [problemKey, setProblemKey] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState<DifficultyType | null>(null)

  // 실제 업로드 모드
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState('uploaded.png')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [solutionResult, setSolutionResult] = useState<SolutionResult | null>(null)

  const { analyzeImage, generateSolution, error: hookError } = useProblemAnalysis()

  const isRealUpload = uploadedBase64 !== null

  // 현재 표시할 Problem 객체 결정
  const sampleProblem = problemKey ? PROBLEMS[problemKey] : null
  const uploadedProblem = analysisResult
    ? buildProblemFromAPI(analysisResult, solutionResult, difficulty, uploadedFileName)
    : null
  const problem = isRealUpload ? uploadedProblem : sampleProblem

  useEffect(() => {
    const reveal = () => { if (document.hidden) document.body.classList.add('force-visible') }
    const t = setTimeout(reveal, 550)
    document.addEventListener('visibilitychange', reveal)
    return () => { clearTimeout(t); document.removeEventListener('visibilitychange', reveal) }
  }, [])

  // 샘플 문제 선택
  const pick = (key: string) => {
    setProblemKey(key)
    setUploadedBase64(null)
    setAnalysisResult(null)
    setSolutionResult(null)
    setDifficulty(null)
    setPhase('recognizing')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const restart = () => {
    setPhase('upload')
    setProblemKey(null)
    setDifficulty(null)
    setUploadedBase64(null)
    setUploadedFileName('uploaded.png')
    setAnalysisResult(null)
    setSolutionResult(null)
    window.scrollTo({ top: 0 })
  }

  // 실제 이미지 업로드 → 1단계 API 호출
  const handleUpload = async (base64: string, fileName: string) => {
    setUploadedBase64(base64)
    setUploadedFileName(fileName)
    setProblemKey(null)
    setAnalysisResult(null)
    setSolutionResult(null)
    setDifficulty(null)
    setPhase('recognizing')
    window.scrollTo({ top: 0, behavior: 'smooth' })

    const result = await analyzeImage(base64)
    if (result) {
      setAnalysisResult(result)
      setPhase('diagnose')
    } else {
      // 오류 시 업로드 화면으로 복귀 (hookError에 메시지 저장됨)
      setUploadedBase64(null)
      setPhase('upload')
    }
  }

  // 어려움 유형 선택 후 → 2단계 API 호출
  const handleGenerateSolution = async () => {
    if (!analysisResult || !difficulty) return
    setPhase('generating')
    window.scrollTo({ top: 0, behavior: 'smooth' })

    const result = await generateSolution(analysisResult.problemText, analysisResult.problemType, difficulty)
    if (result) {
      setSolutionResult(result)
      setPhase('result')
    } else {
      setPhase('diagnose')
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button className="brand" onClick={restart} style={{ background: 'none' }}>
            <span style={{ textAlign: 'left' }}>
              <span className="name"><b>Solv</b><span style={{ color: 'var(--text-1)' }}>io</span></span>
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

      {hookError && phase === 'upload' && (
        <div style={{
          background: 'rgba(255,107,107,0.12)',
          borderBottom: '1px solid rgba(255,107,107,0.4)',
          color: '#ff8787',
          padding: '10px 20px',
          textAlign: 'center',
          fontSize: 13,
        }}>
          오류: {hookError}
        </div>
      )}

      <main style={{ flex: 1 }}>
        {phase === 'upload' && (
          <UploadScreen onPick={pick} onUpload={handleUpload} />
        )}

        {phase === 'recognizing' && (
          // 실제 업로드: API 완료가 phase 전환을 구동 → onDone은 no-op
          // 샘플 모드: LoadingScreen 타이머가 전환 구동
          <LoadingScreen
            mode="recognize"
            onDone={isRealUpload ? () => {} : () => setPhase('diagnose')}
          />
        )}

        {phase === 'diagnose' && problem && (
          <DiagnoseScreen
            problem={problem}
            selected={difficulty}
            setSelected={setDifficulty}
            onContinue={
              isRealUpload
                ? handleGenerateSolution
                : () => { setPhase('generating'); window.scrollTo({ top: 0, behavior: 'smooth' }) }
            }
          />
        )}

        {phase === 'generating' && (
          <LoadingScreen
            mode="generate"
            problemType={analysisResult?.problemType ?? (sampleProblem?.type)}
            onDone={isRealUpload ? () => {} : () => setPhase('result')}
          />
        )}

        {phase === 'result' && problem && difficulty && (
          <ResultScreen problem={problem} difficulty={difficulty} onRestart={restart} />
        )}
      </main>
    </div>
  )
}

export default App
