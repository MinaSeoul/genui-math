import Katex from './Katex'

interface RichTextProps {
  text: string
}

function parseBold(raw: string): React.ReactNode[] {
  const parts = raw.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) => {
    const m = p.match(/^\*\*([^*]+)\*\*$/)
    if (m) {
      return (
        <span key={i} className="rich-bold">{m[1]}</span>
      )
    }
    if (p.includes('<b>')) {
      return <span key={i} dangerouslySetInnerHTML={{ __html: p }} />
    }
    return <span key={i}>{p}</span>
  })
}

const RichText = ({ text }: RichTextProps) => {
  if (!text) return null
  // Order matters: $$...$$ and \[...\] before $...$ to avoid partial matches
  const parts = String(text).split(/(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\(.*?\\\)|\$(?!\$)[^$\n]+?\$)/g)
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('$$') && p.endsWith('$$') && p.length > 4) {
          return <Katex key={i} tex={p.slice(2, -2)} display={true} />
        }
        if (p.startsWith('\\[') && p.endsWith('\\]')) {
          return <Katex key={i} tex={p.slice(2, -2)} display={true} />
        }
        const mParen = p.match(/^\\\(([\s\S]*)\\\)$/)
        if (mParen) return <Katex key={i} tex={mParen[1]} display={false} />
        const mDollar = p.match(/^\$(?!\$)([\s\S]+?)\$$/)
        if (mDollar) return <Katex key={i} tex={mDollar[1]} display={false} />
        return <>{parseBold(p)}</>
      })}
    </>
  )
}

export default RichText
