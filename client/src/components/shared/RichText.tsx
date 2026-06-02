import { Fragment } from 'react'
import Katex from './Katex'

// Split a text segment by math delimiters.
// When bold=true, both plain text and math are wrapped in <strong class="rich-bold">.
function renderSegment(raw: string, baseKey: string, bold = false): React.ReactNode[] {
  if (!raw) return []
  const parts = raw.split(/(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$(?!\$)[^$\n]+?\$)/g)
  return parts.map((p, i) => {
    const key = `${baseKey}-${i}`
    if (p.startsWith('$$') && p.endsWith('$$') && p.length > 4) {
      return bold
        ? <strong key={key} className="rich-bold"><Katex tex={p.slice(2, -2)} display={true} /></strong>
        : <Katex key={key} tex={p.slice(2, -2)} display={true} />
    }
    if (p.startsWith('\\[') && p.endsWith('\\]')) {
      return bold
        ? <strong key={key} className="rich-bold"><Katex tex={p.slice(2, -2)} display={true} /></strong>
        : <Katex key={key} tex={p.slice(2, -2)} display={true} />
    }
    const mParen = p.match(/^\\\(([\s\S]*)\\\)$/)
    if (mParen) {
      return bold
        ? <strong key={key} className="rich-bold"><Katex tex={mParen[1]} display={false} /></strong>
        : <Katex key={key} tex={mParen[1]} display={false} />
    }
    const mDollar = p.match(/^\$(?!\$)([\s\S]+?)\$$/)
    if (mDollar) {
      return bold
        ? <strong key={key} className="rich-bold"><Katex tex={mDollar[1]} display={false} /></strong>
        : <Katex key={key} tex={mDollar[1]} display={false} />
    }
    // plain text
    const lines = p.split('\n')
    const content = lines.map((line, li) => (
      <Fragment key={li}>
        {li > 0 && <br />}
        {line}
      </Fragment>
    ))
    return bold
      ? <strong key={key} className="rich-bold">{content}</strong>
      : <Fragment key={key}>{content}</Fragment>
  })
}

interface RichTextProps {
  text: string
  breakSentences?: boolean
}

// Bold (**...**) is parsed first so math inside bold markers works correctly.
// Within a bold segment, math expressions render unstyled; only plain text is bolded.
const RichText = ({ text, breakSentences }: RichTextProps) => {
  if (!text) return null
  const processed = breakSentences
    ? String(text).replace(/\. /g, '.\n')
    : String(text)

  const boldParts = processed.split(/(\*\*[\s\S]*?\*\*)/g)
  return (
    <>
      {boldParts.map((part, i) => {
        const m = part.match(/^\*\*([\s\S]*)\*\*$/)
        if (m) {
          return <Fragment key={i}>{renderSegment(m[1], `b${i}`, true)}</Fragment>
        }
        return <Fragment key={i}>{renderSegment(part, `t${i}`)}</Fragment>
      })}
    </>
  )
}

export default RichText
