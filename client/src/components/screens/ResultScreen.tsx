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
          <div className="math-box"><Katex tex={s.latex} /></div>
          {s.note && <div className="note"><Icon name="check" size={14} /> {s.note}</div>}
        </div>
      </div>
    ))}
  </div>
)

const ResultScreen = ({ problem, difficulty, onRestart }: ResultScreenProps) => {
  const diff = DIFFICULTIES.find((d) => d.code === difficulty) ?? DIFFICULTIES[0]
  const stuckText = (problem.stuck && (problem.stuck[difficulty] ?? problem.stuck[problem.defaultDifficulty])) ?? ''

  const vizMap = { graph: GraphView, application: AnimationView, formula: FormulaView } as const
  const Viz = vizMap[problem.type]
  const vizMeta = {
    graph: { icon: 'graph', label: '인터랙티브 그래프' },
    application: { icon: 'motion', label: '상황 애니메이션' },
    formula: { icon: 'layers', label: '단계별 수식 풀이' },
  }[problem.type]

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
            <Viz problem={problem} />
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
              <p className="muted" style={{ fontSize: 13, lineHeight: 1.6 }}>
                왼쪽에서 '다음 단계' 버튼을 눌러 한 단계씩 직접 전개해 보세요.
                스스로 다음 식을 예상해 본 뒤 확인하면 훨씬 오래 기억에 남아요.
              </p>
            ) : (
              <StepsList steps={problem.steps} />
            )}
          </div>
        </div>
      </div>

      <ChatPanel problem={problem} />
    </div>
  )
}

export default ResultScreen
