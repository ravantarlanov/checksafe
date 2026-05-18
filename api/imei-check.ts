import { Resend } from 'resend'

type SickwResponse = {
  status?: string
  result?: unknown
  [key: string]: unknown
}

type ReportRow = {
  label: string
  value: string
  color: string
}

type VercelRequest = {
  method?: string
  query: Record<string, string | string[] | undefined>
}

type VercelResponse = {
  setHeader: (name: string, value: string) => void
  status: (statusCode: number) => {
    json: (body: unknown) => void
    end: () => void
  }
}

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

function detectInputType(input: string): 'imei' | 'serial' {
  // IMEI is 15 digits numeric only
  if (/^\d{15}$/.test(input.trim())) return 'imei'
  // Serial numbers are alphanumeric, usually 10-12 chars
  return 'serial'
}

function selectService(
  manufacturer: string,
  category: string,
  inputType: 'imei' | 'serial',
): string {
  const m = (manufacturer || '').toLowerCase()
  const c = (category || '').toLowerCase()

  // Serial number services
  if (inputType === 'serial') {
    if (m.includes('apple') || c.includes('laptop')) return '26' // APPLE SERIAL INFO $0.01
    return '203' // BRAND & MODEL INFO fallback $0.02
  }

  // IMEI services
  if (c.includes('laptop') && m.includes('apple')) return '110'
  if (m.includes('apple') || m.includes('iphone')) return '61'
  if (m.includes('samsung')) return '80'
  if (m.includes('motorola')) return '13'
  if (m.includes('google') || m.includes('pixel')) return '42'
  return '203'
}

const getQueryValue = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0] || ''
  }

  return value || ''
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    const imei = getQueryValue(req.query.imei).trim()
    const email = getQueryValue(req.query.email).trim()
    const manufacturer = getQueryValue(req.query.manufacturer).trim()
    const category = getQueryValue(req.query.category).trim()
    const inputType = detectInputType(imei)
    const serviceId = selectService(manufacturer, category, inputType)
    console.log('Input type:', inputType, '| Service ID:', serviceId)
    const url = `https://sickw.com/api.php?format=beta&key=${process.env.SICKW_API_KEY}&imei=${imei}&service=${serviceId}`
    const response = await fetch(url)
    const data = (await response.json()) as SickwResponse

    if (data.status !== 'success') {
      res.status(400).json({ error: data.result || 'Check failed' })
      return
    }

    await sendReportEmail(email, data)

    res.status(200).json(data)
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
}
