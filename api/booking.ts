import { Resend } from 'resend'

type BookingRequest = {
  method?: string
  body?: unknown
}

type BookingResponse = {
  setHeader: (name: string, value: string) => void
  status: (statusCode: number) => {
    json: (body: unknown) => void
    end: () => void
  }
}

type BookingPayload = {
  service: string
  device: string
  name: string
  email: string
  phone: string
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

const parseBody = (body: unknown): BookingPayload => {
  if (typeof body === 'string') {
    return JSON.parse(body) as BookingPayload
  }

  return body as BookingPayload
}

const getServiceLabel = (service: string) =>
  service.toLowerCase().includes('call') ? 'Agent Call' : 'Live Chat'

const getBadgeStyles = (service: string) =>
  getServiceLabel(service) === 'Agent Call'
    ? {
        text: 'AGENT CALL',
        background: '#1a1a18',
        color: '#ffffff',
      }
    : {
        text: 'LIVE CHAT',
        background: '#E8F1FF',
        color: '#1D4ED8',
      }

const buildTableRow = (label: string, value: string) => `
  <tr>
    <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;color:#5F5E5A;font-weight:700;">${escapeHtml(label)}</td>
    <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;color:#1a1a18;font-weight:700;">${escapeHtml(value)}</td>
  </tr>
`

const buildNotificationHtml = (payload: BookingPayload, bookedAt: string) => {
  const badge = getBadgeStyles(payload.service)

  return `
    <div style="margin:0;padding:32px;background:#ffffff;font-family:Inter,Arial,sans-serif;color:#1a1a18;">
      <div style="max-width:640px;margin:0 auto;">
        <h1 style="margin:0 0 18px;color:#1a1a18;font-size:28px;font-weight:800;">New Booking — CheckSafe</h1>
        <div style="display:inline-block;margin-bottom:22px;padding:10px 16px;border-radius:999px;background:${badge.background};color:${badge.color};font-size:14px;font-weight:800;letter-spacing:0.12em;">${badge.text}</div>
        <table style="width:100%;border-collapse:collapse;border:1px solid #eeeeee;border-radius:12px;overflow:hidden;background:#ffffff;">
          <tbody>
            ${buildTableRow('Name', payload.name)}
            ${buildTableRow('Email', payload.email)}
            ${buildTableRow('Phone', payload.phone)}
            ${buildTableRow('Device', payload.device)}
            ${buildTableRow('Service', payload.service)}
            ${buildTableRow('Time', bookedAt)}
          </tbody>
        </table>
        <a href="mailto:${escapeHtml(payload.email)}" style="display:inline-block;margin-top:24px;padding:12px 18px;border-radius:999px;background:#1D9E75;color:#ffffff;text-decoration:none;font-weight:800;">Reply to ${escapeHtml(payload.name)}</a>
        <p style="margin:28px 0 0;color:#888780;font-size:14px;font-weight:700;">CheckSafe · deviceraptors.org</p>
      </div>
    </div>
  `
}

const buildCustomerHtml = (payload: BookingPayload) => {
  const isCall = getServiceLabel(payload.service) === 'Agent Call'
  const nextSteps = isCall
    ? [
        `A specialist will call you at ${payload.phone} shortly`,
        'Calls are typically answered within 30-60 minutes',
        'Have the device with you during the call',
      ]
    : [
        'An expert is being assigned to you',
        'You will receive a chat link within 30 minutes',
        'Have the device IMEI or serial ready before the session',
      ]

  return `
    <div style="margin:0;padding:32px;background:#ffffff;font-family:Inter,Arial,sans-serif;color:#1a1a18;">
      <div style="max-width:640px;margin:0 auto;">
        <h1 style="margin:0;color:#1D9E75;font-size:28px;font-weight:800;">CheckSafe</h1>
        <h2 style="margin:12px 0 22px;color:#1a1a18;font-size:24px;font-weight:800;">Your booking is confirmed</h2>
        <div style="border:1px solid #eeeeee;border-radius:14px;padding:20px;background:#FAFAF8;">
          <h3 style="margin:0 0 14px;color:#1a1a18;font-size:18px;font-weight:800;">What happens next</h3>
          ${nextSteps
            .map(
              (step, index) => `
                <div style="display:flex;gap:12px;margin-top:12px;">
                  <div style="width:28px;height:28px;border-radius:999px;background:#1D9E75;color:#ffffff;text-align:center;line-height:28px;font-weight:800;flex:0 0 auto;">${index + 1}</div>
                  <p style="margin:4px 0 0;color:#5F5E5A;font-size:15px;font-weight:700;line-height:1.5;">${escapeHtml(step)}</p>
                </div>
              `,
            )
            .join('')}
        </div>
        <p style="margin:22px 0 0;color:#5F5E5A;font-size:15px;font-weight:700;">Questions? Email us at <a href="mailto:support@deviceraptors.org" style="color:#1D9E75;">support@deviceraptors.org</a></p>
        <p style="margin:28px 0 0;color:#888780;font-size:14px;font-weight:700;">CheckSafe · deviceraptors.org</p>
      </div>
    </div>
  `
}

export default async function handler(req: BookingRequest, res: BookingResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured.')
    }

    const payload = parseBody(req.body)
    const serviceLabel = getServiceLabel(payload.service)
    const bookedAt = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'America/New_York',
    }).format(new Date())
    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: 'bookings@deviceraptors.org',
      // TODO: Replace with your real notification email
      to: 'your_personal_email@gmail.com',
      subject: `New ${serviceLabel} Booking — ${payload.name}`,
      html: buildNotificationHtml(payload, bookedAt),
    })

    await resend.emails.send({
      from: 'bookings@deviceraptors.org',
      to: payload.email,
      subject:
        'Your CheckSafe booking is confirmed — we will be in touch shortly',
      html: buildCustomerHtml(payload),
    })

    res.status(200).json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to send confirmation' })
  }
}
