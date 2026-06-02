import Icon from '../icons'
import Katex from '../shared/Katex'
import RichText from '../shared/RichText'
import GraphView from '../visualizers/GraphView'
import DesmosGraphPanel from '../visualizers/DesmosGraphPanel'
import InequalityGraphPanel from '../visualizers/InequalityGraphPanel'
import FormulaView from '../visualizers/FormulaView'
import AnimationView from '../visualizers/AnimationView'
import TrigAnimView from '../visualizers/TrigAnimView'
import ChatPanel from '../ChatPanel'
import { DIFFICULTIES } from '../../data/sampleProblems'
import type { Problem, DifficultyType } from '../../data/sampleProblems'

interface ResultScreenProps {
  problem: Problem
  difficulty: DifficultyType
  onRestart: () => void
}

const guideText: Record<string, Record<string, string>> = {
  formula: {
    default: "아래 수식 풀이에서 '다음 단계' 버튼으로 한 단계씩 직접 전개해 보세요. 스스로 다음 식을 예상해 본 뒤 확인하면 훨씬 오래 기억에 남아요.",
    midway: "아래 수식 풀이에서 단계를 하나씩 열어보세요. 이해가 안 되는 단계는 '심화 설명'을 요청하면 더 쉽게 풀어드려요.",
  },
  graph: {
    default: "아래 그래프와 단계별 풀이를 함께 확인해 보세요. 그래프에서 극값 위치를 먼저 파악한 뒤 수식 풀이를 따라가면 이해가 빨라요.",
  },
  application: {
    default: "아래 시각화 애니메이션으로 문제 상황을 파악한 뒤 단계별 풀이를 확인해 보세요.",
  },
}

const ResultScreen = ({ problem, difficulty, onRestart }: ResultScreenProps) => {
  const diff = DIFFICULTIES.find((d) => d.code === difficulty) ?? DIFFICULTIES[0]
  const stuckText = (problem.stuck && (problem.stuck[difficulty] ?? problem.stuck[problem.defaultDifficulty])) ?? ''

  const vizMetaMap: Record<string, { icon: string; label: string }> = {
    graph: { icon: 'graph', label: '인터랙티브 그래프' },
    application: { icon: 'motion', label: '상황 애니메이션' },
    formula: { icon: 'layers', label: '단계별 수식 풀이' },
  }
  const vizMeta = vizMetaMap[problem.type] ?? { icon: 'layers', label: '풀이' }

  const guide = (() => {
    const typeGuides = guideText[problem.type] ?? guideText.formula
    return typeGuides[difficulty] ?? typeGuides.default ?? typeGuides.midway ?? ''
  })()

  return (
    <div className="container result screen">
      {/* ── 헤더 ── */}
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

      {/* ── 상단 3열 그리드 ── */}
      <div className="result-top-grid">
        {/* Col 1: 문제 카드 */}
        <div className="card result-problem-card stack stack-1">
          <div className="viz-head">
            <div className="vt">
              <span className="vi"><Icon name="layers" size={16} /></span>
              문제
            </div>
            <span className="kbd">{problem.fname}</span>
          </div>
          <div className="shot-body" style={{ borderRadius: 0 }}>
            <div className="qno">{problem.qno}</div>
            <div className="qtext">
              {problem.id === 'uploaded' ? (
                <RichText text={problem.qtext} />
              ) : (
                <>
                  {problem.qtext && <span>{problem.qtext} </span>}
                  {problem.qtextLatex && <Katex tex={problem.qtextLatex} display={false} />}
                  {problem.qtail && <span> {problem.qtail}</span>}
                  {problem.qtail2 && <><br /><span>{problem.qtail2}</span></>}
                  {problem.qtextLatex2 && <><br /><Katex tex={problem.qtextLatex2} display={false} /></>}
                </>
              )}
            </div>
          </div>
          {problem.trigGeometry && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '12px 16px 4px' }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon name="motion" size={12} /> 문제 도형 (Claude 재현)
              </div>
              <TrigAnimView geometry={problem.trigGeometry} mini />
            </div>
          )}
        </div>

        {/* Col 2: 막힌 지점 설명 */}
        <div className="card panel stack stack-2" style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
          <div className="panel-title">
            <span className="pi"><Icon name="target" size={17} /></span>
            학생의 막힌 지점에 맞춘 설명
          </div>
          <div className="stuck-note">
            <span className="si"><Icon name="bulb" size={18} /></span>
            <p><RichText text={stuckText} breakSentences /></p>
          </div>
        </div>

        {/* Col 3: 단계별 풀이 안내 */}
        <div className="card panel stack stack-3" style={{ padding: 20 }}>
          <div className="panel-title">
            <span className="pi"><Icon name="layers" size={17} /></span>
            단계별 풀이
          </div>
          <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.7 }}>
            {guide}
          </p>
          {problem.steps.length > 0 && (
            <div className="step-overview">
              {problem.steps.map((s, i) => (
                <div key={i} className="step-overview-item">
                  <span className="step-ov-num">{i + 1}</span>
                  <span className="step-ov-label"><RichText text={s.summary || s.desc.slice(0, 28) + (s.desc.length > 28 ? '…' : '')} /></span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 하단: 부등식 그래프 (inequalityGraph 있을 때 무조건 표시) ── */}
      {problem.inequalityGraph && (
        <div className="card viz stack stack-4 result-viz-section">
          <div className="viz-head">
            <div className="vt">
              <span className="vi"><Icon name="graph" size={16} /></span>
              부등식 시각화
            </div>
            <span className="kbd">inequality.graph</span>
          </div>
          <div className="viz-body">
            <InequalityGraphPanel
              expression={problem.inequalityGraph.expression}
              shadeExpr={problem.inequalityGraph.shadeExpr}
              roots={problem.inequalityGraph.roots}
              vertex={problem.inequalityGraph.vertex}
              satisfiedRange={(problem.inequalityGraph as any).satisfiedRange}
            />
          </div>
        </div>
      )}

      {/* ── 하단: 도형 애니메이션 (Claude가 trigGeometry를 반환한 경우) ── */}
      {problem.trigGeometry && (
        <div className="card viz stack stack-4 result-viz-section">
          <div className="viz-head">
            <div className="vt">
              <span className="vi"><Icon name="motion" size={16} /></span>
              도형 시각화
            </div>
            <span className="kbd">trig.desmos</span>
          </div>
          <div className="viz-body">
            <TrigAnimView geometry={problem.trigGeometry} />
          </div>
        </div>
      )}

      {/* ── 하단: 그래프·애니메이션 (trigGeometry 없는 graph/application 문제) ── */}
      {!problem.trigGeometry && (problem.type === 'application' || (problem.type === 'graph' && !!problem.graph)) && (
        <div className="card viz stack stack-4 result-viz-section">
          <div className="viz-head">
            <div className="vt">
              <span className="vi"><Icon name={vizMeta.icon} size={16} /></span>
              {vizMeta.label}
            </div>
            <span className="kbd">{problem.type}.view</span>
          </div>
          <div className="viz-body">
            {problem.type === 'graph' && (
              problem.graph?.desmosExpression
                ? <DesmosGraphPanel
                    expression={problem.graph.desmosExpression}
                    restrictedDomain={problem.graph.restrictedDomain}
                    vertex={problem.graph.vertex}
                    extremumLabel={problem.graph.extremumLabel}
                    asymptotes={problem.graph.asymptotes}
                    extrema={problem.graph.desmosExtrema}
                  />
                : <GraphView problem={problem} />
            )}
            {problem.type === 'application' && <AnimationView problem={problem} />}
          </div>
        </div>
      )}

      {/* ── 하단: 단계별 수식 풀이 (전체 너비) ── */}
      <div className="card result-steps-section stack stack-4">
        <div className="viz-head">
          <div className="vt">
            <span className="vi"><Icon name="layers" size={16} /></span>
            단계별 수식 풀이
          </div>
          <span className="kbd">formula.steps</span>
        </div>
        <div className="result-steps-body">
          <FormulaView problem={problem} difficulty={difficulty} />
        </div>
      </div>

      <ChatPanel problem={problem} />
    </div>
  )
}

export default ResultScreen
