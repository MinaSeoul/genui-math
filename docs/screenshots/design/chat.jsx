/* ============================================================
   Solvio — 질문 채팅 패널
   답안 화면 하단에서 학생이 추가 질문을 할 수 있는 채팅창
   ============================================================ */
const ChatPanel = ({ problem }) => {
  const chat = problem.chat;
  const [messages, setMessages] = useState([{ role: "ai", text: chat.hello }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [asked, setAsked] = useState([]);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, typing]);

  const reply = (q) => {
    const r = (chat.replies && (chat.replies[q] || chat.replies._default)) || "좋은 질문이에요. 풀이 흐름을 다시 한 번 천천히 따라가 볼까요?";
    setTyping(true);
    const delay = 650 + Math.min(1400, r.length * 14);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { role: "ai", text: r }]);
    }, delay);
  };

  const send = (text) => {
    const q = (text != null ? text : input).trim();
    if (!q || typing) return;
    setMessages((m) => [...m, { role: "me", text: q }]);
    setInput("");
    setAsked((a) => [...a, q]);
    reply(q);
  };

  const remaining = chat.suggestions.filter((s) => !asked.includes(s));

  return (
    <div className="card chat">
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
          <div key={i} className={"msg " + (m.role === "ai" ? "ai" : "me")}>
            <div className="av">{m.role === "ai" ? <Icon name="spark" size={15} /> : "나"}</div>
            <div className="bubble"><RichText text={m.text} /></div>
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
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
        />
        <button className="chat-send" onClick={() => send()} disabled={!input.trim() || typing} aria-label="보내기">
          <Icon name="send" size={18} />
        </button>
      </div>
    </div>
  );
};

window.ChatPanel = ChatPanel;
