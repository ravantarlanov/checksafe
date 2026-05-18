import { BookingFlow } from '../components/BookingFlow'
import { Nav } from '../components/Nav'

export function LiveCall() {
  return (
    <>
      <Nav />
      <section className="px-6 py-16 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-green-brand">
              Live Agent Call
            </p>
            <h1 className="mt-4 text-5xl font-extrabold leading-tight text-text-dark sm:text-6xl">
              Talk to a specialist before you pay.
            </h1>
            <p className="mt-6 text-lg leading-8 text-text-muted">
              A real expert calls you, verifies the device live, and gives you a
              clear buy or don't buy verdict. Up to 20 minutes.
            </p>
            <span className="mt-8 inline-flex rounded-full bg-green-light px-4 py-2 text-sm font-extrabold text-green-dark">
              $9.99 per call
            </span>
          </div>

          <div className="mt-12">
            <BookingFlow presetService="Live agent call" />
          </div>
        </div>
      </section>
    </>
  )
}
