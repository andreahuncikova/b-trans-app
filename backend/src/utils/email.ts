export async function sendReminderEmail(subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.REMINDER_EMAIL_TO
  if (!apiKey || !to) {
    console.warn('RESEND_API_KEY alebo REMINDER_EMAIL_TO nie je nastavené, email sa neodosiela')
    return
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.REMINDER_EMAIL_FROM || 'B-Trans <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Odoslanie emailu zlyhalo: ${res.status} ${text}`)
  }
}
