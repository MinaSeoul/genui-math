import { useState, useEffect } from 'react'
import Icon from '../icons'

type LoadingMode = 'recognize' | 'generate'

interface LoadingScreenProps {
  mode: LoadingMode
  onDone: () => void
}

const LoadingScreen = ({ mode, onDone }: LoadingScreenProps) => {
  const config = {
    recognize: {
      title: '문제를 읽고 있어요',
      duration: 2200,
      steps: ['이미지에서 수식을 추출하는 중', '문제 유형을 분류하는 중', '핵심 조건을 정리하는 중'],
    },
    generate: {
      title: '학생에게 맞는 풀이를 만들고 있어요',
      duration: 3500,
      steps: ['막힌 지점에 맞춰 설명 방식을 고르는 중', '단계별 풀이를 구성하는 중', '그래프·애니메이션을 그리는 중'],
    },
  }[mode]

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
  }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

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
              {[40, 80, 120, 160].map((v) => <line key={'a' + v} x1={v} y1="20" x2={v} y2="180" />)}
              {[40, 80, 120, 160].map((v) => <line key={'b' + v} x1="20" y1={v} x2="180" y2={v} />)}
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
