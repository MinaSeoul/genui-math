import { Fragment } from 'react'
import Katex from './Katex'

function parseText(raw: string): React.ReactNode[] {
  const result: React.ReactNode[] = []
  const lines = raw.split('\n')
  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) result.push(<br key={`br-${lineIdx}`} />)
    const boldParts = line.split(/(\*\*[^*]+\*\*)/g)
    boldParts.forEach((p, partIdx) => {
      const key = `${lineIdx}-${partIdx}`
      const m = p.match(/^\*\*([^*]+)\*\*$/)
      if (m) {
        result.push(<span key={key} className="rich-bold">{m[1]}</span>)
      } else if (p.includes('<b>')) {
        result.push(<span key={key} dangerouslySetInnerHTML={{ __html: p }} />)
      } else {
        result.push(<span key={key}>{p}</span>)
      }
    })
  })
  return result
}

interface RichTextProps {
  text: string
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
        return <Fragment key={i}>{parseText(p)}</Fragment>
      })}
    </>
  )
}

export default RichText
