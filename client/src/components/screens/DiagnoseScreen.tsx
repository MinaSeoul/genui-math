import Icon from '../icons'
import Katex from '../shared/Katex'
import { DIFFICULTIES } from '../../data/sampleProblems'
import type { Problem, DifficultyType } from '../../data/sampleProblems'

interface DiagnoseScreenProps {
  problem: Problem
  selected: DifficultyType | null
  setSelected: (d: DifficultyType) => void
  onContinue: () => void
}

const ProblemBody = ({ p }: { p: Problem }) => {
  if (p.qtail2 !== undefined) {
    return (
      <div className="qtext">
        {p.qtext}<Katex tex={p.qtextLatex} display={false} />{p.qtail}
        <Katex tex={p.qtextLatex2!} display={false} />{p.qtail2}
      </div>
    )
  }
  if (p.qtail) {
    return (
      <div className="qtext">
        {p.qtext} <Katex tex={p.qtextLatex} display={false} /> {p.qtail}
      </div>
    )
  }
  return (
    <div>
      <div className="qtext">{p.qtext}</div>
      <div className="qmath"><Katex tex={p.qtextLatex} /></div>
    </div>
  )
}

const DiagnoseScreen = ({ problem, selected, setSelected, onContinue }: DiagnoseScreenProps) => {
  const typeIcon = ({ graph: 'graph', application: 'drop', formula: 'func' } as Record<string, string>)[problem.type]

  return (
    <div className="container screen">
      <div className="diagnose">
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
              {DIFFICULTIES.map((d) => (
                <button key={d.code} className={'opt' + (selected === d.code ? ' sel' : '')} onClick={() => setSelected(d.code)}>
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
              <span className="hint">{selected ? '선택 완료 — 맞춤 풀이를 만들 준비가 됐어요' : '하나를 선택하면 풀이가 시작돼요'}</span>
              <button className="btn btn-primary" disabled={!selected} onClick={onContinue}>
                맞춤 풀이 생성 <Icon name="arrow" size={17} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DiagnoseScreen
