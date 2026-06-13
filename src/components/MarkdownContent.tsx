import type { ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import styles from './MarkdownContent.module.css'

type MarkdownContentProps = {
  children: string
  className?: string
  inline?: boolean
}

const linkComponent: Components['a'] = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
)

const inlineComponents: Components = {
  p: ({ children }) => <>{children}</>,
  a: linkComponent,
}

const blockComponents: Components = {
  a: linkComponent,
}

export default function MarkdownContent({ children, className, inline = false }: MarkdownContentProps) {
  if (!children.trim()) return null

  return (
    <div className={[styles.markdown, inline ? styles.inline : '', className].filter(Boolean).join(' ')}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        disallowedElements={['script', 'iframe', 'style', 'img']}
        unwrapDisallowed
        components={inline ? inlineComponents : blockComponents}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
