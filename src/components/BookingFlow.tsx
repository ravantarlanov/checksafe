import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'

type Device = 'Cellphone' | 'Laptop' | 'Tablet' | 'Other'
type Service = 'IMEI / Serial check' | 'Live chat support' | 'Live agent call'

type ContactForm = {
  firstName: string
  lastName: string
  email: string
  phone: string
  imei: string
  deviceBrand: string
}

type PaymentForm = {
  cardNumber: string
  expiry: string
  cvv: string
  nameOnCard: string
}

type ContactTouched = {
  email: boolean
  phone: boolean
}

type ImeiResultRow = {
  label: string
  value: string
  tone: 'green' | 'red' | 'neutral'
}

type ImeiCheckResult = {
  rows: ImeiResultRow[]
  manufacturer?: string
  modelName?: string
}

const emptyContactForm: ContactForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  imei: '',
  deviceBrand: '',
}

const emptyPaymentForm: PaymentForm = {
  cardNumber: '',
  expiry: '',
  cvv: '',
  nameOnCard: '',
}

const emptyContactTouched: ContactTouched = {
  email: false,
  phone: false,
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const deviceBrandOptions = ['Apple', 'Samsung', 'Google', 'Motorola', 'Other']
const hiddenImeiResultFields = new Set(
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

const deviceOptions: Array<{
  name: Device
  icon: ReactNode
}> = [
  {
    name: 'Cellphone',
    icon: (
      <path
        d="M9 3.75h6A2.25 2.25 0 0 1 17.25 6v12A2.25 2.25 0 0 1 15 20.25H9A2.25 2.25 0 0 1 6.75 18V6A2.25 2.25 0 0 1 9 3.75Zm1.5 13.5h3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
  },
  {
    name: 'Laptop',
    icon: (
      <path
        d="M5.75 6.5h12.5v8.25H5.75V6.5Zm-1.5 11h15.5M8.5 17.5h7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
  },
  {
    name: 'Tablet',
    icon: (
      <path
        d="M8 3.75h8A2.25 2.25 0 0 1 18.25 6v12A2.25 2.25 0 0 1 16 20.25H8A2.25 2.25 0 0 1 5.75 18V6A2.25 2.25 0 0 1 8 3.75Zm3 13.5h2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
  },
  {
    name: 'Other',
    icon: (
      <path
        d="M7.5 5.25h9l2.25 3.75v7.5a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25V9l2.25-3.75Zm-2 3.75h13M9 12h6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
  },
]

const serviceOptions: Array<{
  title: Service
  price: number
  description: string
  includes: string[]
  icon: ReactNode
}> = [
  {
    title: 'IMEI / Serial check',
    price: 2.99,
    description: 'Fast automated report for phones, tablets, laptops, and more.',
    includes: ['Blacklist scan', 'Carrier lock status', 'Activation lock risk', 'PDF report'],
    icon: (
      <path
        d="M8 4.75h8A2.25 2.25 0 0 1 18.25 7v10A2.25 2.25 0 0 1 16 19.25H8A2.25 2.25 0 0 1 5.75 17V7A2.25 2.25 0 0 1 8 4.75Zm2 4h4m-4 3h4m-4 3h2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
  },
  {
    title: 'Live chat support',
    price: 4.99,
    description: 'Send photos and listing details to a trained CheckSafe reviewer.',
    includes: ['Listing review', 'Photo red flags', 'Seller script help', 'Chat transcript'],
    icon: (
      <path
        d="M5.75 7.5A2.75 2.75 0 0 1 8.5 4.75h7A2.75 2.75 0 0 1 18.25 7.5v4.25a2.75 2.75 0 0 1-2.75 2.75H12l-4.25 4v-4A2 2 0 0 1 5.75 12.5v-5Zm4 2.5h4.5m-4.5 2.5H12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
  },
  {
    title: 'Live agent call',
    price: 9.99,
    description: 'A CheckSafe agent stays with you while you verify before buying.',
    includes: ['Live verification', 'Seller question prompts', 'Risk decision support', 'Call summary'],
    icon: (
      <path
        d="M7.75 5.25 9.5 4.5l2 4-1.5 1.25a7.5 7.5 0 0 0 4.25 4.25l1.25-1.5 4 2-.75 1.75a2.5 2.5 0 0 1-2.8 1.45c-5.04-.88-8.77-4.61-9.65-9.65a2.5 2.5 0 0 1 1.45-2.8Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    ),
  },
]

const nextSteps: Record<Service, string[]> = {
  'IMEI / Serial check': [
    'Your device details are queued for an instant database scan.',
    'We send the report link to your email as soon as it is ready.',
    'Use the result to verify, negotiate, or walk away before you pay.',
  ],
  'Live chat support': [
    'A secure chat link is sent to your email.',
    'Upload seller photos, screenshots, or listing details for review.',
    'A CheckSafe reviewer points out red flags before you meet.',
  ],
  'Live agent call': [
    'We text and email a scheduling link for the next available agent slot.',
    'Your agent reviews the device details before the call.',
    'Stay on the call while you verify the seller and device in real time.',
  ],
}

const confirmationMessage: Record<Service, string> = {
  'IMEI / Serial check':
    'Your report request is confirmed. We will email the check result and PDF report link shortly.',
  'Live chat support':
    'Your chat request is confirmed. Watch your email for a secure link to connect with a CheckSafe reviewer.',
  'Live agent call':
    'Your call request is confirmed. We will send a scheduling link so you can choose the best agent call time.',
}

function FormField({
  label,
  value,
  onChange,
  onBlur,
  type = 'text',
  placeholder,
  error,
  validationState,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  type?: string
  placeholder?: string
  error?: string
  validationState?: 'valid' | 'invalid'
}) {
  const validationClass =
    validationState === 'invalid'
      ? 'border-red-brand focus:border-red-brand focus:ring-red-brand/10'
      : validationState === 'valid'
        ? 'border-green-brand focus:border-green-brand focus:ring-green-brand/10'
        : 'border-border-light focus:border-green-brand focus:ring-green-brand/10'

  return (
    <label className="block">
      <span className="text-sm font-extrabold text-text-dark">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`mt-2 w-full rounded-2xl border bg-background px-4 py-3 text-text-dark outline-none transition placeholder:text-text-hint focus:ring-4 ${validationClass}`}
      />
      {error ? (
        <p className="mt-2 text-sm font-semibold text-red-brand">{error}</p>
      ) : null}
    </label>
  )
}

function Spinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
}) {
  return (
    <label className="block">
      <span className="text-sm font-extrabold text-text-dark">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-border-light bg-background px-4 py-3 text-text-dark outline-none transition focus:border-green-brand focus:ring-4 focus:ring-green-brand/10"
      >
        <option value="">Select brand</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const stringifyValue = (value: unknown) => {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  return JSON.stringify(value)
}

const getBadgeTone = (value: string): ImeiResultRow['tone'] => {
  const normalizedValue = value.toLowerCase()

  if (
    (normalizedValue.includes('locked') &&
      !normalizedValue.includes('unlocked')) ||
    normalizedValue.includes('blacklisted') ||
    normalizedValue.includes('lost') ||
    normalizedValue.includes('stolen') ||
    /\bon\b/.test(normalizedValue) ||
    normalizedValue.includes('blocked')
  ) {
    return 'red'
  }

  if (
    normalizedValue.includes('unlocked') ||
    normalizedValue.includes('clean') ||
    normalizedValue.includes('active') ||
    /\boff\b/.test(normalizedValue) ||
    /\bno\b/.test(normalizedValue) ||
    /\byes\b/.test(normalizedValue) ||
    normalizedValue.includes('registered') ||
    normalizedValue.includes('activated')
  ) {
    return 'green'
  }

  return 'neutral'
}

const findField = (record: Record<string, unknown>, field: string) => {
  const entry = Object.entries(record).find(
    ([key]) => key.toLowerCase() === field.toLowerCase(),
  )

  return entry?.[1]
}

const getImeiResultRows = (result: Record<string, unknown>) => {
  const rows: ImeiResultRow[] = []

  for (const [label, value] of Object.entries(result)) {
    const normalizedLabel = label.toLowerCase()

    if (hiddenImeiResultFields.has(normalizedLabel)) {
      continue
    }

    if (normalizedLabel === serviceCoverageField) {
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
        tone: isActive ? 'green' : 'red',
      })
      continue
    }

    const stringValue = stringifyValue(value)

    rows.push({
      label,
      value: stringValue,
      tone: getBadgeTone(stringValue),
    })
  }

  return rows
}

const extractImeiResult = (payload: unknown): ImeiCheckResult => {
  const root = isRecord(payload) ? payload : {}
  const result = isRecord(root.result) ? root.result : root

  return {
    rows: getImeiResultRows(result),
    manufacturer: stringifyValue(findField(result, 'Manufacturer') || ''),
    modelName: stringifyValue(findField(result, 'Model Name') || ''),
  }
}

export function BookingFlow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null)
  const [contact, setContact] = useState<ContactForm>(emptyContactForm)
  const [contactTouched, setContactTouched] =
    useState<ContactTouched>(emptyContactTouched)
  const [paymentForm, setPaymentForm] = useState<PaymentForm>(emptyPaymentForm)
  const [isPreparingPayment, setIsPreparingPayment] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false)
  const [isCheckingImei, setIsCheckingImei] = useState(false)
  const [imeiCheckResult, setImeiCheckResult] = useState<ImeiCheckResult | null>(
    null,
  )
  const [imeiCheckError, setImeiCheckError] = useState<string | null>(null)

  const progress = `${(currentStep / 4) * 100}%`
  const emailIsValid = emailRegex.test(contact.email.trim())
  const phoneIsRequired =
    selectedService === 'Live agent call' || selectedService === 'Live chat support'
  const phoneIsValid = contact.phone.replace(/\D/g, '').length >= 10
  const showEmailError = contactTouched.email && !emailIsValid
  const showPhoneError = phoneIsRequired && contactTouched.phone && !phoneIsValid

  const canConfirm = useMemo(() => {
    const baseFields =
      contact.firstName.trim() && contact.lastName.trim() && emailIsValid
    const phoneReady = !phoneIsRequired || phoneIsValid
    const imeiReady =
      selectedService !== 'IMEI / Serial check' || contact.imei.trim().length > 0

    return Boolean(baseFields && phoneReady && imeiReady)
  }, [contact, emailIsValid, phoneIsRequired, phoneIsValid, selectedService])

  const updateContact = (field: keyof ContactForm, value: string) => {
    setContact((current) => ({ ...current, [field]: value }))
  }

  const markContactTouched = (field: keyof ContactTouched) => {
    setContactTouched((current) => ({ ...current, [field]: true }))
  }

  const updatePayment = (field: keyof PaymentForm, value: string) => {
    setPaymentForm((current) => ({ ...current, [field]: value }))
  }

  const formatCardNumber = (value: string) =>
    value
      .replace(/\D/g, '')
      .slice(0, 16)
      .replace(/(.{4})/g, '$1 ')
      .trim()

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4)

    if (digits.length <= 2) {
      return digits
    }

    return `${digits.slice(0, 2)}/${digits.slice(2)}`
  }

  const runImeiCheck = async () => {
    setIsCheckingImei(true)
    setImeiCheckError(null)
    const manufacturer =
      selectedDevice === 'Cellphone' ? contact.deviceBrand || 'unknown' : selectedDevice || 'unknown'

    try {
      const response = await fetch(
        `/api/imei-check?imei=${encodeURIComponent(
          contact.imei.trim(),
        )}&email=${encodeURIComponent(
          contact.email.trim(),
        )}&manufacturer=${encodeURIComponent(manufacturer)}`,
      )
      const payload = (await response.json()) as {
        status?: string
        message?: string
      }

      if (!response.ok || payload.status === 'error') {
        throw new Error(payload.message || 'Unable to check this IMEI.')
      }

      setImeiCheckResult(extractImeiResult(payload))
      return true
    } catch (error) {
      setImeiCheckError(
        error instanceof Error
          ? error.message
          : 'Unable to check this IMEI.',
      )
      return false
    } finally {
      setIsCheckingImei(false)
    }
  }

  const openMockPayment = async () => {
    setContactTouched({
      email: true,
      phone: phoneIsRequired,
    })

    if (!canConfirm || isPreparingPayment || isCheckingImei) {
      return
    }

    if (selectedService === 'IMEI / Serial check') {
      const checked = await runImeiCheck()

      if (!checked) {
        return
      }
    }

    setIsPreparingPayment(true)

    window.setTimeout(() => {
      setIsPreparingPayment(false)
      setIsPaymentModalOpen(true)
    }, 2000)
  }

  // TODO: Replace mock payment with Stripe Checkout
  const submitMockPayment = () => {
    if (isSubmittingPayment) {
      return
    }

    setIsSubmittingPayment(true)

    window.setTimeout(() => {
      setIsSubmittingPayment(false)
      setIsPaymentModalOpen(false)
      setCurrentStep(4)
    }, 1500)
  }

  const resetFlow = () => {
    setCurrentStep(1)
    setSelectedDevice(null)
    setSelectedService(null)
    setSelectedPrice(null)
    setContact(emptyContactForm)
    setContactTouched(emptyContactTouched)
    setPaymentForm(emptyPaymentForm)
    setIsPreparingPayment(false)
    setIsPaymentModalOpen(false)
    setIsSubmittingPayment(false)
    setIsCheckingImei(false)
    setImeiCheckResult(null)
    setImeiCheckError(null)
  }

  return (
    <div className="rounded-3xl border border-border-light bg-white p-5 shadow-xl shadow-text-dark/5 sm:p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-[0.18em] text-text-hint">
          <span>Step {currentStep} of 4</span>
          {selectedPrice ? (
            <span>${selectedPrice.toFixed(2)}</span>
          ) : (
            <span>Start check</span>
          )}
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface">
          <div
            className="h-full rounded-full bg-green-brand transition-all duration-300"
            style={{ width: progress }}
          />
        </div>
      </div>

      {currentStep === 1 && (
        <div>
          <h3 className="text-2xl font-extrabold text-text-dark">
            Choose your device
          </h3>
          <p className="mt-2 text-text-muted">
            Pick the item you want to verify before you meet the seller.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {deviceOptions.map((device) => {
              const isSelected = selectedDevice === device.name

              return (
                <button
                  key={device.name}
                  type="button"
                  onClick={() => setSelectedDevice(device.name)}
                  className={`card-lift rounded-2xl border p-5 text-left transition hover:border-green-brand/60 ${
                    isSelected
                      ? 'selected-pop border-green-brand bg-green-light'
                      : 'border-border-light bg-background'
                  }`}
                >
                  <span
                    className={`grid h-12 w-12 place-items-center rounded-xl ${
                      isSelected
                        ? 'bg-green-brand text-white'
                        : 'bg-white text-text-dark'
                    }`}
                  >
                    <svg
                      aria-hidden="true"
                      className="h-7 w-7"
                      fill="none"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {device.icon}
                    </svg>
                  </span>
                  <span className="mt-4 block text-lg font-extrabold text-text-dark">
                    {device.name}
                  </span>
                </button>
              )
            })}
          </div>

          <button
            type="button"
            disabled={!selectedDevice}
            onClick={() => selectedDevice && setCurrentStep(2)}
            className="mt-8 rounded-full bg-text-dark px-6 py-3 text-sm font-extrabold text-white transition hover:bg-green-dark disabled:cursor-not-allowed disabled:bg-text-hint"
          >
            Continue
          </button>
        </div>
      )}

      {currentStep === 2 && (
        <div>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <h3 className="text-2xl font-extrabold text-text-dark">
                Pick a service
              </h3>
              <p className="mt-2 text-text-muted">
                Choose how much help you want for your {selectedDevice}.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="self-start rounded-full border border-border-light px-4 py-2 text-sm font-bold text-text-muted transition hover:text-text-dark"
            >
              Change device
            </button>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {serviceOptions.map((service) => {
              const isSelected = selectedService === service.title

              return (
                <button
                  key={service.title}
                  type="button"
                  onClick={() => {
                    setSelectedService(service.title)
                    setSelectedPrice(service.price)
                    setImeiCheckResult(null)
                    setImeiCheckError(null)
                  }}
                  className={`card-lift flex min-h-full flex-col rounded-2xl border p-5 text-left transition hover:border-green-brand/60 ${
                    isSelected
                      ? 'selected-pop border-green-brand bg-green-light'
                      : 'border-border-light bg-background'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={`grid h-12 w-12 place-items-center rounded-xl ${
                        isSelected
                          ? 'bg-green-brand text-white'
                          : 'bg-white text-text-dark'
                      }`}
                    >
                      <svg
                        aria-hidden="true"
                        className="h-7 w-7"
                        fill="none"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {service.icon}
                      </svg>
                    </span>
                    <span className="text-3xl font-extrabold text-text-dark">
                      ${service.price.toFixed(2)}
                    </span>
                  </div>

                  <h4 className="mt-5 text-xl font-extrabold text-text-dark">
                    {service.title}
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-text-muted">
                    {service.description}
                  </p>
                  <ul className="mt-5 space-y-2">
                    {service.includes.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm font-semibold text-text-muted"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-green-brand" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </button>
              )
            })}
          </div>

          <button
            type="button"
            disabled={!selectedService}
            onClick={() => selectedService && setCurrentStep(3)}
            className="mt-8 rounded-full bg-text-dark px-6 py-3 text-sm font-extrabold text-white transition hover:bg-green-dark disabled:cursor-not-allowed disabled:bg-text-hint"
          >
            Continue
          </button>
        </div>
      )}

      {currentStep === 3 && selectedDevice && selectedService && (
        <div>
          <h3 className="text-2xl font-extrabold text-text-dark">
            Contact details
          </h3>
          <p className="mt-2 text-text-muted">
            We use this to deliver your result and confirm your order.
          </p>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.42fr]">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="First name"
                value={contact.firstName}
                onChange={(value) => updateContact('firstName', value)}
                placeholder="Avery"
              />
              <FormField
                label="Last name"
                value={contact.lastName}
                onChange={(value) => updateContact('lastName', value)}
                placeholder="Taylor"
              />
              <div className="md:col-span-2">
                <FormField
                  label="Email"
                  type="email"
                  value={contact.email}
                  onChange={(value) => updateContact('email', value)}
                  onBlur={() => markContactTouched('email')}
                  placeholder="you@example.com"
                  error={
                    showEmailError
                      ? 'Please enter a valid email address'
                      : undefined
                  }
                  validationState={
                    contactTouched.email
                      ? emailIsValid
                        ? 'valid'
                        : 'invalid'
                      : undefined
                  }
                />
              </div>
              {selectedDevice === 'Cellphone' &&
                selectedService === 'IMEI / Serial check' && (
                  <div className="md:col-span-2">
                    <SelectField
                      label="Device brand"
                      value={contact.deviceBrand}
                      onChange={(value) => updateContact('deviceBrand', value)}
                      options={deviceBrandOptions}
                    />
                  </div>
                )}
              {phoneIsRequired && (
                <div className="md:col-span-2">
                  <FormField
                    label="Phone number (we'll contact you on this)"
                    type="tel"
                    value={contact.phone}
                    onChange={(value) => updateContact('phone', value)}
                    onBlur={() => markContactTouched('phone')}
                    placeholder="(555) 123-4567"
                    error={
                      showPhoneError
                        ? 'Please enter a valid phone number'
                        : undefined
                    }
                    validationState={
                      contactTouched.phone
                        ? phoneIsValid
                          ? 'valid'
                          : 'invalid'
                        : undefined
                    }
                  />
                </div>
              )}
              {selectedService === 'IMEI / Serial check' && (
                <div className="md:col-span-2">
                  <FormField
                    label="IMEI or serial number"
                    value={contact.imei}
                    onChange={(value) => updateContact('imei', value)}
                    placeholder="35 123456 789012 4"
                  />
                </div>
              )}
            </div>

            <aside className="card-lift rounded-2xl border border-border-light bg-background p-5">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-text-hint">
                Order summary
              </p>
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-text-muted">
                    Device
                  </span>
                  <span className="text-right font-extrabold text-text-dark">
                    {selectedDevice}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-text-muted">
                    Service
                  </span>
                  <span className="text-right font-extrabold text-text-dark">
                    {selectedService}
                  </span>
                </div>
                <div className="border-t border-border-light pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-text-muted">
                      Total
                    </span>
                    <span className="text-3xl font-extrabold text-green-brand">
                      ${selectedPrice?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <div className="mt-8 flex flex-col gap-3 md:flex-row">
            <button
              type="button"
              disabled={!canConfirm || isPreparingPayment || isCheckingImei}
              onClick={() => void openMockPayment()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-text-dark px-6 py-3 text-sm font-extrabold text-white transition hover:bg-green-dark disabled:cursor-not-allowed disabled:bg-text-hint"
            >
              {isCheckingImei ? (
                <>
                  <Spinner />
                  Checking your device...
                </>
              ) : isPreparingPayment ? (
                <>
                  <Spinner />
                  Processing payment...
                </>
              ) : (
                'Pay & confirm'
              )}
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="rounded-full border border-border-light px-6 py-3 text-sm font-extrabold text-text-muted transition hover:text-text-dark"
            >
              Back
            </button>
          </div>
          {imeiCheckError ? (
            <p className="mt-4 text-sm font-semibold text-red-brand">
              {imeiCheckError}
            </p>
          ) : null}
        </div>
      )}

      {currentStep === 4 && selectedService && (
        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-light text-green-brand">
            <svg
              aria-hidden="true"
              className="h-9 w-9"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="m6.75 12.25 3.25 3.25 7.25-7.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
              />
            </svg>
          </div>

          <h3 className="mt-5 text-3xl font-extrabold text-text-dark">
            You're all set!
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-text-muted">
            {confirmationMessage[selectedService]}
          </p>

          {selectedService === 'IMEI / Serial check' && imeiCheckResult ? (
            <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-border-light bg-white p-6 text-left shadow-sm">
              <div className="flex flex-col justify-between gap-3 border-b border-border-light pb-5 md:flex-row md:items-center">
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-green-brand">
                    IMEI result
                  </p>
                  <h4 className="mt-2 text-2xl font-extrabold text-text-dark">
                    {imeiCheckResult.manufacturer || 'Device'}{' '}
                    {imeiCheckResult.modelName || 'information'}
                  </h4>
                </div>
                <span className="self-start rounded-full bg-green-light px-3 py-1 text-sm font-extrabold text-green-dark">
                  Checked
                </span>
              </div>

              <div className="mt-5 divide-y divide-border-light">
                {imeiCheckResult.rows.map((row) => (
                  <div
                    key={row.label}
                    className="flex flex-col justify-between gap-2 py-3 md:flex-row md:items-center"
                  >
                    <span className="text-sm font-extrabold text-text-muted">
                      {row.label}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-extrabold ${
                        row.tone === 'red'
                          ? 'bg-red-light text-red-brand'
                          : row.tone === 'green'
                            ? 'bg-green-light text-green-dark'
                            : 'bg-surface text-text-muted'
                      }`}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-5 rounded-xl bg-surface px-4 py-3 text-sm font-semibold text-text-muted">
                Full report has been sent to your email
              </p>
            </div>
          ) : null}

          <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-border-light bg-background p-6 text-left">
            <h4 className="text-xl font-extrabold text-text-dark">
              What happens next
            </h4>
            <div className="mt-5 grid gap-4">
              {nextSteps[selectedService].map((step, index) => (
                <div key={step} className="flex gap-4">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-green-brand text-sm font-extrabold text-white">
                    {index + 1}
                  </div>
                  <p className="pt-1 text-sm font-semibold leading-6 text-text-muted">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={resetFlow}
            className="mt-8 rounded-full bg-text-dark px-6 py-3 text-sm font-extrabold text-white transition hover:bg-green-dark"
          >
            Check another device
          </button>
        </div>
      )}

      {isPaymentModalOpen && selectedDevice && selectedService && selectedPrice && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-text-dark/60 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-green-brand">
                  Mock payment
                </p>
                <h3 className="mt-2 text-2xl font-extrabold text-text-dark">
                  Confirm your order
                </h3>
              </div>
              <button
                type="button"
                disabled={isSubmittingPayment}
                onClick={() => setIsPaymentModalOpen(false)}
                className="rounded-full border border-border-light px-3 py-1 text-sm font-bold text-text-muted transition hover:text-text-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[0.42fr_1fr]">
              <aside className="rounded-2xl bg-background p-5">
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-text-hint">
                  Order summary
                </p>
                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-text-muted">
                      Device
                    </p>
                    <p className="mt-1 font-extrabold text-text-dark">
                      {selectedDevice}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-muted">
                      Service
                    </p>
                    <p className="mt-1 font-extrabold text-text-dark">
                      {selectedService}
                    </p>
                  </div>
                  <div className="border-t border-border-light pt-4">
                    <p className="text-sm font-semibold text-text-muted">
                      Total
                    </p>
                    <p className="mt-1 text-3xl font-extrabold text-green-brand">
                      ${selectedPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              </aside>

              <div>
                <div className="grid gap-4">
                  <FormField
                    label="Card number"
                    value={paymentForm.cardNumber}
                    onChange={(value) =>
                      updatePayment('cardNumber', formatCardNumber(value))
                    }
                    placeholder="4242 4242 4242 4242"
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      label="Expiry"
                      value={paymentForm.expiry}
                      onChange={(value) =>
                        updatePayment('expiry', formatExpiry(value))
                      }
                      placeholder="MM/YY"
                    />
                    <FormField
                      label="CVV"
                      value={paymentForm.cvv}
                      onChange={(value) =>
                        updatePayment(
                          'cvv',
                          value.replace(/\D/g, '').slice(0, 3),
                        )
                      }
                      placeholder="123"
                    />
                  </div>
                  <FormField
                    label="Name on card"
                    value={paymentForm.nameOnCard}
                    onChange={(value) => updatePayment('nameOnCard', value)}
                    placeholder="Avery Taylor"
                  />
                </div>

                <button
                  type="button"
                  disabled={isSubmittingPayment}
                  onClick={submitMockPayment}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-green-brand px-6 py-3 text-sm font-extrabold text-white transition hover:bg-green-dark disabled:cursor-not-allowed disabled:bg-text-hint"
                >
                  {isSubmittingPayment ? (
                    <>
                      <Spinner />
                      Processing...
                    </>
                  ) : (
                    `Pay $${selectedPrice.toFixed(2)}`
                  )}
                </button>

                <p className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-text-muted">
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4 text-green-brand"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.5 10V8a4.5 4.5 0 0 1 9 0v2m-10 0h11A1.5 1.5 0 0 1 19 11.5v7A1.5 1.5 0 0 1 17.5 20h-11A1.5 1.5 0 0 1 5 18.5v-7A1.5 1.5 0 0 1 6.5 10Z"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                  Secured by CheckSafe
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
