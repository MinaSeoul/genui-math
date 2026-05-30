import Icon from '../icons'

type Phase = 'upload' | 'recognizing' | 'diagnose' | 'generating' | 'result'

interface StepperProps {
  phase: Phase
}

const STEPS = [
  { key: 'upload', label: '업로드' },
  { key: 'diagnose', label: '진단' },
  { key: 'result', label: '풀이' },
]

const Stepper = ({ phase }: StepperProps) => {
  const idx = ({ upload: 0, recognizing: 0, diagnose: 1, generating: 1, result: 2 } as Record<Phase, number>)[phase]

  return (
    <div className="stepper">
      {STEPS.map((s, i) => {
        const isDone = i < idx
        const isActive = i === idx
        return (
          <div key={s.key} style={{ display: 'contents' }}>
            {i > 0 && <span className="sep" />}
            <div className={'dot' + (isActive ? ' active' : '') + (isDone ? ' done' : '')}>
              <span className="n">{isDone ? <Icon name="check" size={12} /> : i + 1}</span>
              <span className="lbl">{s.label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export type { Phase }
export default Stepper
