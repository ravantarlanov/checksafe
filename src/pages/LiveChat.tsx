import { BookingFlow } from '../components/BookingFlow'
import { Nav } from '../components/Nav'

export function LiveChat() {
  return (
    <>
      <Nav />
      <section className="px-6 py-16 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-green-brand">
              Live Chat Support
            </p>
            <h1 className="mt-4 text-5xl font-extrabold leading-tight text-text-dark sm:text-6xl">
              Get expert guidance before you buy.
            </h1>
            <p className="mt-6 text-lg leading-8 text-text-muted">
              Chat with a real device expert who walks you through every check
              step by step. 30 minute session.
            </p>
            <span className="mt-8 inline-flex rounded-full bg-green-light px-4 py-2 text-sm font-extrabold text-green-dark">
              $4.99 per session
            </span>
          </div>

          <div className="mt-12">
            <BookingFlow presetService="Live chat support" />
          </div>
        </div>
      </section>
    </>
  )
}
