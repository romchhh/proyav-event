import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const fromEmail = process.env.EMAIL_FROM || 'info@nieznanypiekarz.com'

export type EmailAttachment = {
  filename: string
  content: Buffer | string
  contentType?: string
}

export type SendEmailOptions = {
  to: string | string[]
  subject: string
  text?: string
  html?: string
  attachments?: EmailAttachment[]
}

export async function sendEmail(
  options: SendEmailOptions,
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.error('[email] RESEND_API_KEY is not set')
    return {
      success: false,
      error: 'Email не налаштовано: відсутній RESEND_API_KEY',
    }
  }

  const to = Array.isArray(options.to) ? options.to : [options.to]
  const toValid = to.filter((email) => typeof email === 'string' && email.includes('@'))

  if (toValid.length === 0) {
    return { success: false, error: 'Немає валідних email-адрес' }
  }

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: toValid,
      subject: options.subject,
      text: options.text ?? '',
      html: options.html ?? undefined,
      attachments: options.attachments?.map((attachment) => ({
        filename: attachment.filename,
        content:
          attachment.content instanceof Buffer
            ? attachment.content.toString('base64')
            : attachment.content,
        contentType: attachment.contentType,
      })),
    })

    if (error) {
      console.error('[email] Resend error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Невідома помилка'
    console.error('[email] Send failed:', err)
    return { success: false, error: message }
  }
}
