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

function translateSamsungModel(modelCode: string): string {
  if (!modelCode) return modelCode
  const code = modelCode.toUpperCase()

  const modelMap: Record<string, string> = {
    // Galaxy S25 series
    'SM-S938': 'Galaxy S25 Ultra',
    'SM-S936': 'Galaxy S25+',
    'SM-S931': 'Galaxy S25',
    // Galaxy S24 series
    'SM-S928': 'Galaxy S24 Ultra',
    'SM-S926': 'Galaxy S24+',
    'SM-S921': 'Galaxy S24',
    'SM-S924': 'Galaxy S24 FE',
    // Galaxy S23 series
    'SM-S918': 'Galaxy S23 Ultra',
    'SM-S916': 'Galaxy S23+',
    'SM-S911': 'Galaxy S23',
    'SM-S711': 'Galaxy S23 FE',
    // Galaxy S22 series
    'SM-S908': 'Galaxy S22 Ultra',
    'SM-S906': 'Galaxy S22+',
    'SM-S901': 'Galaxy S22',
    // Galaxy S21 series
    'SM-S998': 'Galaxy S21 Ultra',
    'SM-S996': 'Galaxy S21+',
    'SM-S991': 'Galaxy S21',
    // Galaxy S20 series
    'SM-G988': 'Galaxy S20 Ultra',
    'SM-G986': 'Galaxy S20+',
    'SM-G981': 'Galaxy S20',
    'SM-G780': 'Galaxy S20 FE',
    // Galaxy Z Fold series
    'SM-F956': 'Galaxy Z Fold 6',
    'SM-F946': 'Galaxy Z Fold 5',
    'SM-F936': 'Galaxy Z Fold 4',
    'SM-F926': 'Galaxy Z Fold 3',
    // Galaxy Z Flip series
    'SM-F741': 'Galaxy Z Flip 6',
    'SM-F731': 'Galaxy Z Flip 5',
    'SM-F721': 'Galaxy Z Flip 4',
    'SM-F711': 'Galaxy Z Flip 3',
    // Galaxy A series
    'SM-A556': 'Galaxy A55',
    'SM-A546': 'Galaxy A54',
    'SM-A536': 'Galaxy A53',
    'SM-A526': 'Galaxy A52',
    'SM-A356': 'Galaxy A35',
    'SM-A346': 'Galaxy A34',
    'SM-A336': 'Galaxy A33',
    'SM-A256': 'Galaxy A25',
    'SM-A246': 'Galaxy A24',
    'SM-A236': 'Galaxy A23',
    'SM-A156': 'Galaxy A15',
    'SM-A146': 'Galaxy A14',
    'SM-A136': 'Galaxy A13',
    'SM-A057': 'Galaxy A05s',
    'SM-A055': 'Galaxy A05',
    // Galaxy Note series
    'SM-N986': 'Galaxy Note 20 Ultra',
    'SM-N981': 'Galaxy Note 20',
    'SM-N976': 'Galaxy Note 10+',
    'SM-N971': 'Galaxy Note 10',
    // Galaxy Tab series
    'SM-X818': 'Galaxy Tab S9 Ultra',
    'SM-X816': 'Galaxy Tab S9+',
    'SM-X716': 'Galaxy Tab S9',
    'SM-X610': 'Galaxy Tab S9 FE',
    'SM-X910': 'Galaxy Tab S9 Ultra',
  }

  // Match first 7 characters of model code
  const prefix = code.substring(0, 7)
  if (modelMap[prefix]) return modelMap[prefix]

  // Try first 6 characters
  const shortPrefix = code.substring(0, 6)
  if (modelMap[shortPrefix]) return modelMap[shortPrefix]

  // Return original if no match
  return modelCode
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

const titleCaseToken = (value: string) =>
  value
    .toLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase())

const formatSamsungDetailToken = (token: string) => {
  const normalized = token.toUpperCase()
  const carrierMap: Record<string, string> = {
    ATT: 'AT&T',
    'AT&T': 'AT&T',
    TMB: 'T-Mobile',
    TMOBILE: 'T-Mobile',
    VZW: 'Verizon',
    USC: 'US Cellular',
    XAA: 'Unlocked',
    SPR: 'Sprint',
  }

  return carrierMap[normalized] || titleCaseToken(token)
}

const formatSamsungFullName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/)
  const rawCode = parts[0] || ''
  const translatedName = translateSamsungModel(rawCode)

  if (!rawCode || translatedName === rawCode) {
    return fullName
  }

  const details = parts.slice(1).map(formatSamsungDetailToken)
  return [translatedName, ...details].join(' · ')
}

const enhanceSamsungResult = (
  payload: SickwResponse,
  requestedManufacturer: string,
): SickwResponse => {
  const result = getResultRecord(payload)
  const manufacturerValue = stringifyValue(
    findField(result, 'Manufacturer') || findField(result, 'Brand') || '',
  )
  const isSamsung =
    requestedManufacturer.toLowerCase().includes('samsung') ||
    manufacturerValue.toLowerCase().includes('samsung')

  if (!isSamsung) {
    return payload
  }

  const modelSource = stringifyValue(
    findField(result, 'Model Number') || findField(result, 'Full Name') || '',
  )
  const deviceName = translateSamsungModel(modelSource.split(/\s+/)[0] || modelSource)

  if (!deviceName || deviceName === modelSource) {
    return payload
  }

  const enhancedResult: Record<string, unknown> = {
    'Device Name': deviceName,
  }

  for (const [key, value] of Object.entries(result)) {
    if (key.toLowerCase() === 'device name') {
      continue
    }

    enhancedResult[key] =
      key.toLowerCase() === 'full name' && typeof value === 'string'
        ? formatSamsungFullName(value)
        : value
  }

  return {
    ...payload,
    result: enhancedResult,
  }
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
  const deviceHeading = stringifyValue(
    findField(result, 'Device Name') ||
      findField(result, 'Model Name') ||
      'Your IMEI check is complete',
  )
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
        <p style="margin:12px 0 6px;color:#5F5E5A;font-size:14px;font-weight:700;">Your IMEI check is complete</p>
        <h2 style="margin:0 0 24px;color:#1a1a18;font-size:22px;font-weight:800;">${escapeHtml(deviceHeading)}</h2>
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
  const modelName = stringifyValue(
    findField(result, 'Device Name') || findField(result, 'Model Name') || 'Device',
  )

  await resend.emails.send({
    from: 'reports@deviceraptors.org',
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

    const enhancedData = enhanceSamsungResult(data, manufacturer)

    await sendReportEmail(email, enhancedData)

    res.status(200).json(enhancedData)
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
}
