import { Router } from 'express'
import { Resend } from 'resend'

type SickwResponse = {
  status?: string
  message?: string
  result?: unknown
  [key: string]: unknown
}

type ReportRow = {
  label: string
  value: string
  color: string
}

const router = Router()
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const hiddenResultFields = new Set(
  [
    'IMEI2',
    'MEID',
    'Telephone Technical Support',
    'Telephone Technical Support Expires In',
    'Telephone Technical Support Expiration Date',
    'AppleCare Agreement Code',
    'AppleCare Agreement Number',
    'AppleCare Estimated Expiration Date',
    'AppleCare Eligible',
    'Demo Unit',
    'Loaner Device',
    'Replaced Device',
    'Replacement Device',
    'Refurbished Device',
    'Valid Purchase Date',
    'Registration Status',
    'Repairs and Service Expires In',
    'Repairs and Service Expiration Date',
  ].map((field) => field.toLowerCase()),
)
const serviceCoverageField = 'repairs and service coverage'

// Service IDs from sickw.com — costs per check:
// Apple: $0.10, Samsung: $0.06, Motorola: $0.08
// Google: $0.12, Other: $0.02
function selectService(manufacturer: string): string {
  const m = manufacturer.toLowerCase()
  if (m.includes('apple') || m.includes('iphone')) return '61'
  if (m.includes('samsung')) return '80'
  if (m.includes('motorola')) return '13'
  if (m.includes('google') || m.includes('pixel')) return '42'
  return '203'
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

const stringifyValue = (value: unknown) => {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  return JSON.stringify(value)
}

const getValueColor = (value: string) => {
  const lowerValue = value.toLowerCase()

  if (
    lowerValue.includes('locked') ||
    lowerValue.includes('blacklisted') ||
    lowerValue.includes('lost') ||
    lowerValue.includes('stolen') ||
    /\bon\b/.test(lowerValue) ||
    lowerValue.includes('blocked')
  ) {
    return '#E24B4A'
  }

  if (
    lowerValue.includes('unlocked') ||
    lowerValue.includes('clean') ||
    lowerValue.includes('active') ||
    /\boff\b/.test(lowerValue) ||
    /\bno\b/.test(lowerValue) ||
    /\byes\b/.test(lowerValue) ||
    lowerValue.includes('registered') ||
    lowerValue.includes('activated')
  ) {
    return '#1D9E75'
  }

  return '#1a1a18'
}

const getResultRecord = (payload: SickwResponse) => {
  if (isRecord(payload.result)) {
    return payload.result
  }

  return payload
}

const findField = (record: Record<string, unknown>, field: string) => {
  const entry = Object.entries(record).find(
    ([key]) => key.toLowerCase() === field.toLowerCase(),
  )

  return entry?.[1]
}

const getReportRows = (result: Record<string, unknown>): ReportRow[] => {
  const rows: ReportRow[] = []

  for (const [key, value] of Object.entries(result)) {
    const normalizedKey = key.toLowerCase()

    if (hiddenResultFields.has(normalizedKey)) {
      continue
    }

    if (normalizedKey === serviceCoverageField) {
      const coverageValue = stringifyValue(value)
      const expirationDate = stringifyValue(
        findField(result, 'Repairs and Service Expiration Date') || '',
      )
      const isActive = coverageValue.toLowerCase() === 'active'
      const displayValue =
        isActive && expirationDate
          ? `Active · Expires ${expirationDate}`
          : isActive
            ? 'Active'
            : 'Expired'

      rows.push({
        label: 'Service Coverage',
        value: displayValue,
        color: isActive ? '#1D9E75' : '#E24B4A',
      })
      continue
    }

    const stringValue = stringifyValue(value)

    rows.push({
      label: key,
      value: stringValue,
      color: getValueColor(stringValue),
    })
  }

  return rows
}

const buildReportHtml = (payload: SickwResponse) => {
  const result = getResultRecord(payload)
  const rows = getReportRows(result)
    .map((row) => {
      return `
        <tr>
          <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;color:#5F5E5A;font-weight:700;">${escapeHtml(row.label)}</td>
          <td style="padding:12px 14px;border-bottom:1px solid #eeeeee;color:${row.color};font-weight:700;">${escapeHtml(row.value)}</td>
        </tr>
      `
    })
    .join('')

  return `
    <div style="margin:0;padding:32px;background:#ffffff;font-family:Inter,Arial,sans-serif;color:#1a1a18;">
      <div style="max-width:640px;margin:0 auto;">
        <h1 style="margin:0;color:#1D9E75;font-size:28px;font-weight:800;">CheckSafe</h1>
        <h2 style="margin:12px 0 24px;color:#1a1a18;font-size:22px;font-weight:800;">Your IMEI check is complete</h2>
        <table style="width:100%;border-collapse:collapse;border:1px solid #eeeeee;border-radius:12px;overflow:hidden;background:#ffffff;">
          <tbody>
            ${rows}
          </tbody>
        </table>
        <p style="margin:28px 0 0;color:#888780;font-size:14px;font-weight:700;">CheckSafe · Protecting buyers, one device at a time</p>
      </div>
    </div>
  `
}

const sendReportEmail = async (email: string, payload: SickwResponse) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured.')
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const result = getResultRecord(payload)
  const modelName = stringifyValue(findField(result, 'Model Name') || 'Device')

  await resend.emails.send({
    // TODO: Replace with reports@checksafe.io after connecting domain in Resend dashboard
    from: 'onboarding@resend.dev',
    to: email,
    subject: `Your CheckSafe IMEI Report — ${modelName}`,
    html: buildReportHtml(payload),
  })
}

router.get('/imei-check', async (request, response) => {
  const imei =
    typeof request.query.imei === 'string' ? request.query.imei.trim() : ''
  const email =
    typeof request.query.email === 'string' ? request.query.email.trim() : ''
  const manufacturer =
    typeof request.query.manufacturer === 'string'
      ? request.query.manufacturer.trim()
      : 'unknown'

  if (!imei) {
    response.status(400).json({
      status: 'error',
      message: 'IMEI query parameter is required.',
    })
    return
  }

  if (!email || !emailRegex.test(email)) {
    response.status(400).json({
      status: 'error',
      message: 'A valid email query parameter is required.',
    })
    return
  }

  if (!process.env.SICKW_API_KEY) {
    response.status(500).json({
      status: 'error',
      message: 'SICKW_API_KEY is not configured.',
    })
    return
  }

  const serviceId = selectService(manufacturer || 'unknown')
  const sickwUrl = new URL('https://sickw.com/api.php')
  sickwUrl.searchParams.set('format', 'beta')
  sickwUrl.searchParams.set('key', process.env.SICKW_API_KEY)
  sickwUrl.searchParams.set('imei', imei)
  sickwUrl.searchParams.set('service', serviceId)

  try {
    console.log(
      'Using SICKW service ID:',
      serviceId,
      'for manufacturer:',
      manufacturer,
    )
    console.log('Full SICKW URL being called:', sickwUrl.toString())

    const sickwResponse = await fetch(sickwUrl)
    const payload = (await sickwResponse.json()) as SickwResponse
    const result = getResultRecord(payload)

    console.log('SICKW full response:', JSON.stringify(result, null, 2))

    if (payload.status === 'error') {
      response.status(400).json({
        status: 'error',
        message: payload.message || 'SICKW returned an error.',
        ...payload,
      })
      return
    }

    await sendReportEmail(email, payload)

    response.status(sickwResponse.ok ? 200 : sickwResponse.status).json(payload)
  } catch {
    response.status(502).json({
      status: 'error',
      message: 'Unable to complete the IMEI check or send the report email.',
    })
  }
})

export default router
