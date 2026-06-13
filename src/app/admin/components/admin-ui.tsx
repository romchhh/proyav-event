import type { ReactNode } from 'react'
import type { SiteContent } from '@/lib/site-content/types'
import MarkdownContent from '@/components/MarkdownContent'

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export async function uploadImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch('/api/admin/upload', { method: 'POST', body: formData })
  const data = (await response.json()) as { url?: string; error?: string }
  if (!response.ok || !data.url) throw new Error(data.error ?? 'Upload failed')
  return data.url
}

type FieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  multiline?: boolean
  markdown?: boolean
}

export function Field({ label, value, onChange, multiline, markdown }: FieldProps) {
  if (multiline && markdown) {
    return (
      <div className="adminField adminMarkdownField">
        <span>{label}</span>
        <p className="adminHint">
          Markdown: **жирний**, *курсив*, [посилання](https://), списки, &gt; цитата
        </p>
        <textarea rows={5} value={value} onChange={(event) => onChange(event.target.value)} />
        <div className="adminMarkdownPreview">
          <span className="adminMarkdownPreviewLabel">Перегляд</span>
          {value.trim() ? <MarkdownContent>{value}</MarkdownContent> : <p className="adminHint">Тут зʼявиться відформатований текст</p>}
        </div>
      </div>
    )
  }

  return (
    <label className="adminField">
      <span>{label}</span>
      {multiline ? (
        <textarea rows={3} value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input type="text" value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  )
}

type ImageFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
}

export function ImageField({ label, value, onChange }: ImageFieldProps) {
  return (
    <div className="adminImageField">
      <Field label={label} value={value} onChange={onChange} />
      {value ? <img src={value} alt="" className="adminImagePreview" /> : null}
      <label className="adminUploadBtn">
        Завантажити файл
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={async (event) => {
            const file = event.target.files?.[0]
            if (!file) return
            try {
              const url = await uploadImage(file)
              onChange(url)
            } catch {
              window.alert('Не вдалося завантажити зображення')
            }
          }}
        />
      </label>
    </div>
  )
}

export function Section({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  return (
    <details className="adminSection" open={defaultOpen}>
      <summary>{title}</summary>
      <div className="adminSectionBody">{children}</div>
    </details>
  )
}

export type ContentEditorProps = {
  content: SiteContent
  onChange: (next: SiteContent) => void
}
