import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import Icon from './icons'
import RichText from './shared/RichText'
import type { Problem } from '../data/sampleProblems'

interface ChatPanelProps {
  problem: Problem
}

export interface ChatPanelHandle {
  triggerQuestion: (text: string) => void
}

const ChatPanel = forwardRef<ChatPanelHandle, ChatPanelProps>(({ problem }, ref) => {
  const chat = problem.chat
  const [messages, setMessages] = useState([{ role: 'ai', text: chat.hello }])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [asked, setAsked] = useState<string[]>([])
  const bodyRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages([{ role: 'ai', text: chat.hello }])
    setAsked([])
    setInput('')
  }, [problem.id, chat.hello])

  useImperativeHandle(ref, () => ({
    triggerQuestion: (text: string) => {
      wrapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setTimeout(() => send(text), 300)
    },
  }))

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [messages, typing])

  const send = async (text?: string) => {
    const q = (text != null ? text : input).trim()
    if (!q || typing) return

    const prevMessages = messages
    setMessages((m) => [...m, { role: 'me', text: q }])
    setInput('')
    setAsked((a) => [...a, q])
    setTyping(true)

    try {
      const problemText = [problem.qtext, problem.qtextLatex, problem.qtail, problem.qtail2]
        .filter(Boolean)
        .join(' ')
        .trim()

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: 'chat',
          problemText,
          problemType: problem.type,
          userMessage: q,
          chatHistory: prevMessages,
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = (await res.json()) as { reply: string }
      setTyping(false)
      setMessages((m) => [...m, { role: 'ai', text: data.reply }])
    } catch {
      setTyping(false)
      setMessages((m) => [...m, { role: 'ai', text: '잠시 후 다시 시도해 주세요.' }])
    }
  }

  const remaining = chat.suggestions.filter((s) => !asked.includes(s))

  return (
    <div className="card chat" ref={wrapRef}>
      <div className="chat-head">
        <div className="ci"><Icon name="chat" size={17} /></div>
        <div className="ch">
          <h3>이 풀이에 대해 더 물어보기</h3>
          <p>Solvio가 이 문제 맥락 그대로 이어서 답해드려요</p>
        </div>
        <span className="live"><i /> 응답 가능</span>
      </div>

      <div className="chat-body" ref={bodyRef}>
        {messages.map((m, i) => (
          <div key={i} className={'msg ' + (m.role === 'ai' ? 'ai' : 'me')}>
            <div className="av">{m.role === 'ai' ? <Icon name="spark" size={15} /> : '나'}</div>
            <div className="bubble">
              <RichText text={m.text} />
            </div>
          </div>
        ))}
        {typing && (
          <div className="msg ai">
            <div className="av"><Icon name="spark" size={15} /></div>
            <div className="bubble"><span className="typing"><i /><i /><i /></span></div>
          </div>
        )}
      </div>

      {remaining.length > 0 && (
        <div className="suggest">
          {remaining.map((s) => (
            <button key={s} onClick={() => send(s)}>{s}</button>
          ))}
        </div>
      )}

      <div className="chat-input">
        <input
          value={input}
          placeholder="궁금한 점을 입력해 보세요…"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send() }}
        />
        <button className="chat-send" onClick={() => send()} disabled={!input.trim() || typing} aria-label="보내기">
          <Icon name="send" size={18} />
        </button>
      </div>
    </div>
  )
})

ChatPanel.displayName = 'ChatPanel'

export default ChatPanel
