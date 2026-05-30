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
    try {
      katex.render(tex, ref.current, { displayMode: display, throwOnError: false })
    } catch {
      ref.current.textContent = tex
    }
  }, [tex, display])
  return <span ref={ref} />
}

export default Katex
