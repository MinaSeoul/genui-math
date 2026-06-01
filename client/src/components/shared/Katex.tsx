import { useEffect, useRef } from 'react'

declare const katex: {
  render: (tex: string, el: HTMLElement, opts: { displayMode: boolean; throwOnError: boolean }) => void
}

interface KatexProps {
  tex: string
  display?: boolean
}

const Katex = ({ tex, display = true }: KatexProps) => {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!ref.current || typeof katex === 'undefined') return
    let processedTex = tex
    // 다줄 수식(\\)을 array 환경으로 감싸 행간 확보 (이미 환경 지정된 경우 제외)
    if (display && tex.includes('\\\\') && !tex.includes('\\begin{')) {
      processedTex = '\\begin{array}{l}' + tex.replace(/\\\\/g, '\\\\[10pt]') + '\\end{array}'
    }
    try {
      katex.render(processedTex, ref.current, { displayMode: display, throwOnError: false })
    } catch {
      ref.current.textContent = tex
    }
  }, [tex, display])
  return <span ref={ref} />
}

export default Katex
