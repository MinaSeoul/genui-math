import Katex from './Katex'

interface RichTextProps {
  text: string
}

const RichText = ({ text }: RichTextProps) => {
  if (!text) return null
  const parts = String(text).split(/(\\\(.*?\\\))/g)
  return (
    <>
      {parts.map((p, i) => {
        const m = p.match(/^\\\((.*)\\\)$/)
        if (m) return <Katex key={i} tex={m[1]} display={false} />
        if (p.includes('<b>')) {
          return <span key={i} dangerouslySetInnerHTML={{ __html: p }} />
        }
        return <span key={i}>{p}</span>
      })}
    </>
  )
}

export default RichText
