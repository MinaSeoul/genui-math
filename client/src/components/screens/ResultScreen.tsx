import { useState } from 'react'
import Icon from '../icons'
import Katex from '../shared/Katex'
import RichText from '../shared/RichText'
import GraphView from '../visualizers/GraphView'
import FormulaView from '../visualizers/FormulaView'
import AnimationView from '../visualizers/AnimationView'
import ChatPanel from '../ChatPanel'
import { DIFFICULTIES } from '../../data/sampleProblems'
import type { Problem, DifficultyType } from '../../data/sampleProblems'

interface ResultScreenProps {
  problem: Problem
  difficulty: DifficultyType
  onRestart: () => void
}

const StepsList = ({ steps }: { steps: Problem['steps'] }) => (
  <div className="fsteps">
    {steps.map((s, i) => (
      <div key={i} className="fstep shown">
        <div className="num">{i + 1}</div>
        <div className="fc">
          <div className="desc"><RichText text={s.desc} /></div>
          {s.latex && <div className="math-box"><Katex tex={s.latex} /></div>}
          {s.keyFormula && (
            <div className="key-formula-box">
              <div className="kf-label">📐 적용 공식</div>
              <Katex tex={s.keyFormula} display={true} />
            </div>
          )}
          {s.note && <div className="note"><Icon name="check" size={14} /> <RichText text={s.note} /></div>}
        </div>
      </div>
    ))}
  </div>
)

const ResultScreen = ({ problem, difficulty, onRestart }: ResultScreenProps) => {
  const [showSecondary, setShowSecondary] = useState(false)

  const diff = DIFFICULTIES.find((d) => d.code === difficulty) ?? DIFFICULTIES[0]
  const stuckText = (problem.stuck && (problem.stuck[difficulty] ?? problem.stuck[problem.defaultDifficulty])) ?? ''

  type VizMeta = { icon: string; label: string }
  const vizMetaMap: Record<string, VizMeta> = {
    graph: { icon: 'graph', label: '인터랙티브 그래프' },
    application: { icon: 'motion', label: '상황 애니메이션' },
    formula: { icon: 'layers', label: '단계별 수식 풀이' },
  }
  const vizMeta = vizMetaMap[problem.type] ?? { icon: 'layers', label: '풀이' }

  const secondaryMetaMap: Record<string, { label: string; icon: string; hasData: boolean }> = {
    formula: { label: '그래프로 확인하기', icon: 'graph', hasData: !!problem.graph },
    application: { label: '애니메이션으로 보기', icon: 'motion', hasData: !!problem.anim },
    graph: { label: '단계별 풀이 보기', icon: 'layers', hasData: problem.steps.length > 0 },
  }
  const secondaryMeta = secondaryMetaMap[problem.type] ?? { label: '', icon: 'layers', hasData: false }

  const secondaryVizMetaMap: Record<string, VizMeta> = {
    formula: { icon: 'graph', label: '그래프 확인' },
    application: { icon: 'motion', label: '상황 애니메이션' },
    graph: { icon: 'layers', label: '단계별 수식 풀이' },
  }
  const secondaryVizMeta = secondaryVizMetaMap[problem.type] ?? { icon: 'layers', label: '풀이' }

  const renderPrimary = () => {
    if (problem.type === 'graph') return <GraphView problem={problem} />
    if (problem.type === 'application') return <AnimationView problem={problem} />
    return <FormulaView problem={problem} difficulty={difficulty} />
  }

  const renderSecondary = () => {
    if (problem.type === 'formula') return <GraphView problem={problem} />
    if (problem.type === 'application') return <AnimationView problem={problem} />
    return <FormulaView problem={problem} />
  }

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
        <div className="card viz stack stack-1">
          <div className="viz-head">
            <div className="vt"><span className="vi"><Icon name={vizMeta.icon} size={16} /></span> {vizMeta.label}</div>
            <span className="kbd">{problem.type}.view</span>
          </div>
          <div className="viz-body">
            {renderPrimary()}
          </div>
        </div>

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
            {problem.type === 'formula' ? (
              difficulty === 'midway' ? (
                <p className="muted" style={{ fontSize: 13, lineHeight: 1.6 }}>
                  왼쪽에서 단계를 하나씩 열어보세요. 이해가 안 되는 단계는 '심화 설명'을 요청하면 더 쉽게 풀어드려요.
                </p>
              ) : (
                <p className="muted" style={{ fontSize: 13, lineHeight: 1.6 }}>
                  왼쪽에서 '다음 단계' 버튼을 눌러 한 단계씩 직접 전개해 보세요.
                  스스로 다음 식을 예상해 본 뒤 확인하면 훨씬 오래 기억에 남아요.
                </p>
              )
            ) : (
              <StepsList steps={problem.steps} />
            )}
          </div>
        </div>
      </div>

      {/* 보조 시각화 토글 영역 */}
      <div className="secondary-viz-bar stack stack-4">
        <button
          className={`btn btn-viz-toggle${showSecondary ? ' active' : ''}`}
          disabled={!secondaryMeta.hasData}
          onClick={() => setShowSecondary((s) => !s)}
          title={secondaryMeta.hasData ? '' : '이 문제 유형에서는 보조 시각화 데이터가 없어요'}
        >
          <Icon name={secondaryMeta.icon} size={15} />
          {showSecondary ? '닫기' : secondaryMeta.label}
          <Icon name={showSecondary ? 'arrowL' : 'arrow'} size={13} />
        </button>
        {!secondaryMeta.hasData && (
          <span className="muted" style={{ fontSize: 12.5 }}>이 문제는 보조 시각화 데이터가 없어요</span>
        )}
      </div>

      {showSecondary && secondaryMeta.hasData && (
        <div className="card viz secondary-viz-panel">
          <div className="viz-head">
            <div className="vt">
              <span className="vi"><Icon name={secondaryVizMeta.icon} size={16} /></span>
              {secondaryVizMeta.label}
            </div>
            <span className="kbd">secondary.view</span>
          </div>
          <div className="viz-body">
            {renderSecondary()}
          </div>
        </div>
      )}

      <ChatPanel problem={problem} />
    </div>
  )
}

export default ResultScreen
