import { useState, useRef } from 'react'
import Icon from '../icons'

interface UploadScreenProps {
  onPick: (key: string) => void
  onUpload?: (base64: string, fileName: string) => void
}

const UploadScreen = ({ onPick, onUpload }: UploadScreenProps) => {
  const [drag, setDrag] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!onUpload) {
      onPick('graph')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1]
      onUpload(base64, file.name)
    }
    reader.readAsDataURL(file)
  }

  const samples = [
    { key: 'formula', icon: 'func', cls: 'formula', title: '단순 수식형', desc: '25ˣ − 2·5ˣ⁺¹ + 5 = 0 — 치환으로 지수방정식 풀기' },
    { key: 'graph', icon: 'graph', cls: 'graph', title: '함수·그래프형', desc: 'f(x) = x³ − 3x 의 극값 — 인터랙티브 그래프로 극대·극소 확인' },
    { key: 'application', icon: 'drop', cls: 'ico-app', title: '활용문제형', desc: '주사위 두 번, 합이 8 이상 — 6×6 표 애니메이션으로 경우의 수 파악' },
  ]

  return (
    <div className="container screen">
      <div className="upload-wrap">
        <div className="hero-eyebrow stack stack-1">
          <span className="badge">GenUI</span>
          막힌 곳부터 풀어주는 맞춤 수학 도우미
        </div>
        <h1 className="hero-title stack stack-1">
          수학 문제 사진을 올리면,<br /><em>이해되는 방식으로</em> 풀어드려요
        </h1>
        <p className="hero-sub stack stack-2">
          스크린샷 한 장이면 충분해요. 문제를 알아서 분류하고, 어디서 막혔는지 먼저 물어본 뒤
          그래프·애니메이션·단계 풀이로 <b style={{ color: 'var(--text-1)' }}>학생에게 맞는 설명</b>을 만들어 줍니다.
        </p>

        <div
          className={'dropzone stack stack-2' + (drag ? ' drag' : '')}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDrag(false)
            const file = e.dataTransfer.files[0]
            if (file) handleFile(file)
          }}
        >
          <div className="uic"><Icon name="upload" size={32} /></div>
          <h3>스크린샷을 여기에 끌어다 놓으세요</h3>
          <p>또는 <b style={{ color: 'var(--accent)' }}>클릭해서 파일 선택</b></p>
          <div className="meta">
            <span className="chip"><span className="ico"><Icon name="image" size={14} /></span> PNG · JPG</span>
            <span className="chip"><span className="ico"><Icon name="bolt" size={14} /></span> 평균 3초</span>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
              e.target.value = ''
            }}
          />
        </div>

        <div className="reassure stack stack-3">
          <span><Icon name="check" size={15} style={{ color: 'var(--good)' }} /> 로그인·회원가입 없이 바로 시작</span>
          <span><Icon name="lock" size={15} /> 사진은 풀이에만 쓰이고 저장하지 않아요</span>
        </div>

        <div className="samples stack stack-4">
          <div className="lead">사진이 없다면, 예시 문제로 바로 체험해 보세요</div>
          <div className="sample-grid">
            {samples.map((s) => (
              <button key={s.key} className="sample" onClick={() => onPick(s.key)}>
                <div className={'ico ' + s.cls}><Icon name={s.icon} size={20} /></div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
                <span className="go">체험하기 <Icon name="arrow" size={13} /></span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadScreen
