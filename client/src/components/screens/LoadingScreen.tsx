import { useState, useEffect } from 'react'
import Icon from '../icons'
import type { ProblemType } from '../../types/math'

type LoadingMode = 'recognize' | 'generate'

interface LoadingScreenProps {
  mode: LoadingMode
  onDone: () => void
  problemType?: ProblemType
}

const FormulaIcon = () => (
  <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
    <defs>
      <linearGradient id="lg2" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="#4dabf7" /><stop offset="1" stopColor="#3bc9db" />
      </linearGradient>
    </defs>
    {/* outer rect */}
    <rect x="40" y="25" width="120" height="150" rx="18" fill="none" stroke="rgba(77,171,247,0.25)" strokeWidth="2" />
    {/* equals */}
    <line x1="65" y1="82" x2="135" y2="82" stroke="url(#lg2)" strokeWidth="7" strokeLinecap="round" />
    <line x1="65" y1="102" x2="135" y2="102" stroke="url(#lg2)" strokeWidth="7" strokeLinecap="round" />
    {/* x^2 text hint lines */}
    <line x1="65" y1="135" x2="100" y2="135" stroke="rgba(77,171,247,0.5)" strokeWidth="5" strokeLinecap="round" />
    <line x1="110" y1="135" x2="135" y2="135" stroke="rgba(77,171,247,0.3)" strokeWidth="5" strokeLinecap="round" />
    <line x1="65" y1="155" x2="90" y2="155" stroke="rgba(77,171,247,0.3)" strokeWidth="5" strokeLinecap="round" />
    <line x1="100" y1="155" x2="135" y2="155" stroke="rgba(77,171,247,0.2)" strokeWidth="5" strokeLinecap="round" />
    {/* top sparkle */}
    <circle cx="100" cy="52" r="6" fill="url(#lg2)" opacity="0.9">
      <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2s" repeatCount="indefinite" />
    </circle>
  </svg>
)

const ApplicationIcon = () => (
  <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
    <defs>
      <linearGradient id="lg3" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="#4dabf7" /><stop offset="1" stopColor="#3bc9db" />
      </linearGradient>
    </defs>
    {/* document */}
    <rect x="45" y="20" width="110" height="140" rx="14" fill="none" stroke="rgba(77,171,247,0.25)" strokeWidth="2" />
    <path d="M110 20 L110 50 L155 50" fill="none" stroke="rgba(77,171,247,0.25)" strokeWidth="2" />
    <rect x="110" y="20" width="45" height="30" rx="0" fill="rgba(77,171,247,0.06)" />
    {/* text lines */}
    <line x1="62" y1="72" x2="138" y2="72" stroke="url(#lg3)" strokeWidth="5" strokeLinecap="round" />
    <line x1="62" y1="90" x2="128" y2="90" stroke="rgba(77,171,247,0.5)" strokeWidth="4" strokeLinecap="round" />
    <line x1="62" y1="107" x2="138" y2="107" stroke="rgba(77,171,247,0.4)" strokeWidth="4" strokeLinecap="round" />
    <line x1="62" y1="124" x2="118" y2="124" stroke="rgba(77,171,247,0.3)" strokeWidth="4" strokeLinecap="round" />
    {/* person icon */}
    <circle cx="100" cy="148" r="9" fill="none" stroke="url(#lg3)" strokeWidth="2.5" />
    <path d="M82 170 Q100 158 118 170" fill="none" stroke="url(#lg3)" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="100" cy="148" r="3" fill="url(#lg3)">
      <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
    </circle>
  </svg>
)

const GraphIcon = () => (
  <svg viewBox="0 0 200 200">
    <defs>
      <linearGradient id="lg" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="#4dabf7" /><stop offset="1" stopColor="#3bc9db" />
      </linearGradient>
    </defs>
    <g className="load-grid">
      {[40, 80, 120, 160].map((v) => <line key={'a' + v} x1={v} y1="20" x2={v} y2="180" />)}
      {[40, 80, 120, 160].map((v) => <line key={'b' + v} x1="20" y1={v} x2="180" y2={v} />)}
    </g>
    <line className="load-axis" x1="20" y1="160" x2="185" y2="160" />
    <line className="load-axis" x1="40" y1="20" x2="40" y2="180" />
    <path className="load-curve" d="M40 150 Q 80 30 110 110 T 175 40" />
    <circle className="load-dot" cx="175" cy="40" r="5" />
  </svg>
)

const LoadingScreen = ({ mode, onDone, problemType }: LoadingScreenProps) => {
  const recognizeConfig = {
    title: '문제를 읽고 있어요',
    duration: 2200,
    steps: ['이미지에서 수식을 추출하는 중', '문제 유형을 분류하는 중', '핵심 조건을 정리하는 중'],
    bottomText: '문제를 분석하는 중...',
  }

  const generateConfigs: Record<string, typeof recognizeConfig> = {
    formula: {
      title: '학생에게 맞는 풀이를 만들고 있어요',
      duration: 3500,
      steps: ['막힌 지점에 맞춰 설명 방식을 고르는 중', '단계별 풀이를 구성하는 중', '수식을 정리하는 중'],
      bottomText: '수식을 단계별로 정리하는 중...',
    },
    graph: {
      title: '학생에게 맞는 풀이를 만들고 있어요',
      duration: 3500,
      steps: ['막힌 지점에 맞춰 설명 방식을 고르는 중', '단계별 풀이를 구성하는 중', '그래프·애니메이션을 그리는 중'],
      bottomText: '그래프·애니메이션을 그리는 중...',
    },
    application: {
      title: '학생에게 맞는 풀이를 만들고 있어요',
      duration: 3500,
      steps: ['막힌 지점에 맞춰 설명 방식을 고르는 중', '단계별 풀이를 구성하는 중', '문제 상황을 시각화하는 중'],
      bottomText: '문제 상황을 분석하는 중...',
    },
  }

  const config =
    mode === 'recognize'
      ? recognizeConfig
      : generateConfigs[problemType ?? 'formula'] ?? generateConfigs.formula

  const [prog, setProg] = useState(0)
  const [stepIdx, setStepIdx] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const id = setInterval(() => {
      const e = Date.now() - start
      const p = Math.min(100, (e / config.duration) * 100)
      setProg(p)
      setStepIdx(Math.min(config.steps.length - 1, Math.floor((p / 100) * config.steps.length)))
      if (p >= 100) { clearInterval(id); setTimeout(onDone, 280) }
    }, 60)
    return () => clearInterval(id)
  }, [mode, problemType]) // eslint-disable-line react-hooks/exhaustive-deps

  const renderIcon = () => {
    if (mode === 'recognize') return <GraphIcon />
    if (problemType === 'graph') return <GraphIcon />
    if (problemType === 'application') return <ApplicationIcon />
    return <FormulaIcon />
  }

  return (
    <div className="container">
      <div className="loading screen">
        <div className="load-visual">
          {renderIcon()}
        </div>
        <div>
          <div className="load-title">{config.title}</div>
          <div className="load-status"><span key={stepIdx} className="blink">{config.bottomText}</span></div>
        </div>
        <div className="load-bar"><i style={{ width: prog + '%' }} /></div>
        <div className="load-steps">
          {config.steps.map((s, i) => (
            <div key={i} className={'ls' + (i < stepIdx ? ' ok' : '') + (i === stepIdx ? ' on' : '')}>
              <span className="m">{i < stepIdx ? <Icon name="check" size={11} /> : null}</span>
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
