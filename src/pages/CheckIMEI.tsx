import { BookingFlow } from '../components/BookingFlow'
import { Nav } from '../components/Nav'

export function CheckIMEI() {
  return (
    <>
      <Nav />
      <section className="px-6 py-16 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-green-brand">
              IMEI & Serial Check
            </p>
            <h1 className="mt-4 text-5xl font-extrabold leading-tight text-text-dark sm:text-6xl">
              Find out if this device is safe to buy.
            </h1>
            <p className="mt-6 text-lg leading-8 text-text-muted">
              Enter the IMEI or serial number and we'll check carrier lock,
              iCloud status, blacklist, and warranty - in seconds.
            </p>
            <span className="mt-8 inline-flex rounded-full bg-green-light px-4 py-2 text-sm font-extrabold text-green-dark">
              From $2.99
            </span>
          </div>

          <div className="mt-12">
            <BookingFlow presetService="IMEI / Serial check" />
          </div>
        </div>
      </section>
    </>
  )
}
