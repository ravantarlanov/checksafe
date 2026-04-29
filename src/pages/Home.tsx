import { BookingFlow } from '../components/BookingFlow'
import { ScrollReveal } from '../components/ScrollReveal'

const tickerItems = [
  '$847 lost on average per scam',
  'iCloud lock - most common iPhone scam',
  'Blacklisted IMEI - stolen phones can never be activated',
  'Carrier lock trap',
  '$2.99 protects you',
]

const trustBadges = [
  'IMEI status',
  'iCloud check',
  'Carrier lock',
  'Blacklist scan',
]

const checkRows = [
  ['Model', 'iPhone 14 Pro'],
  ['IMEI', '35 123456 789012 4'],
  ['Blacklist', 'Clean'],
  ['Carrier', 'Unlocked'],
]

const stats = [
  ['12,400+', 'Devices checked'],
  ['$2.1M', 'Saved from scams'],
  ['4.9★', 'Average rating'],
  ['<60s', 'Report delivery'],
  ['98%', 'Accuracy rate'],
]

const scamStories = [
  {
    type: 'iCloud lock',
    amount: '$650 lost',
    location: 'Miami buyer',
    badgeClass: 'bg-red-light text-red-brand',
    story:
      'A buyer met a seller outside a shopping center for what looked like a clean iPhone. The setup screen seemed normal, but after payment the phone asked for the previous owner account and the seller stopped replying.',
    quote:
      'I thought checking the serial number was enough. I learned the expensive way that activation lock matters.',
  },
  {
    type: 'Blacklisted IMEI',
    amount: '$400 lost',
    location: 'Chicago buyer',
    badgeClass: 'bg-red-brand/15 text-red-brand',
    story:
      'The phone worked on Wi-Fi during the meetup, so the buyer assumed it was safe. Two days later the carrier blocked activation because the IMEI had been reported stolen after the sale.',
    quote:
      'It looked perfect in person, but it could never be used as a real phone.',
  },
  {
    type: 'Carrier lock',
    amount: '$280 lost',
    location: 'Houston buyer',
    badgeClass: 'bg-green-light text-green-dark',
    story:
      'A used Android was advertised as unlocked, but it was still tied to a financing agreement. The buyer only found out after trying to switch carriers and being denied at activation.',
    quote:
      'The seller kept saying unlocked. A report would have shown the carrier lock before I paid.',
  },
]

const reviews = [
  {
    initials: 'MR',
    name: 'Marcus R.',
    location: 'Brooklyn, NY',
    service: 'IMEI check',
    device: 'iPhone 13 Pro',
    featured: true,
    text: (
      <>
        The report showed the phone was still activation locked before I met the
        seller. <strong>It saved me $550</strong> and a very awkward afternoon.
      </>
    ),
  },
  {
    initials: 'JT',
    name: 'Jamie T.',
    location: 'Austin, TX',
    service: 'Live chat',
    device: 'Samsung Galaxy S23',
    text: (
      <>
        I sent photos through chat and they spotted tiny corrosion near the SIM
        tray. <strong>Hidden water damage</strong> would have been my problem.
      </>
    ),
  },
  {
    initials: 'SL',
    name: 'Sofia L.',
    location: 'Los Angeles',
    service: 'Agent call',
    device: 'MacBook Pro 14"',
    text: (
      <>
        The agent walked me through the serial check live and found a purchase
        flag. <strong>I walked away from a $900 mistake.</strong>
      </>
    ),
  },
]

const howSteps = [
  {
    title: 'Choose your device',
    description: 'Select the phone, laptop, tablet, or other item you want to verify.',
  },
  {
    title: 'Pick a service',
    description: 'Choose a fast report, live chat help, or a guided agent call.',
  },
  {
    title: 'Pay a small fee',
    description: 'Spend a few dollars before risking hundreds on a bad purchase.',
  },
  {
    title: 'Buy with confidence',
    description: 'Use your result to walk away, negotiate, or complete the deal.',
  },
]

export function Home() {
  return (
    <>
      <section className="overflow-hidden bg-text-dark py-3 text-white">
        <div className="flex w-max animate-marquee whitespace-nowrap">
          {[...tickerItems, ...tickerItems].map((item, index) => (
            <div key={`${item}-${index}`} className="flex items-center">
              <span className="px-5 text-sm font-semibold sm:text-base">
                {item}
              </span>
              <span className="h-2 w-2 rounded-full bg-green-brand" />
            </div>
          ))}
        </div>
      </section>

      <ScrollReveal
        id="top"
        className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:min-h-[calc(100vh-121px)] lg:grid-cols-[1fr_0.88fr] lg:items-center lg:py-20"
      >
        <div className="animate-fade-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-red-light px-4 py-2 text-sm font-bold text-red-brand">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-brand opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-brand" />
            </span>
            Buyer scam alerts are rising
          </div>

          <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.02] text-text-dark sm:text-6xl lg:text-7xl">
            Stop buying{' '}
            <span className="text-red-brand line-through decoration-red-brand decoration-[0.12em]">
              scam
            </span>{' '}
            <span className="text-green-brand">safe</span> electronics
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-text-muted">
            Check phones, tablets, laptops, and consoles before you meet a
            seller. See lock status, blacklist history, carrier restrictions,
            and risk warnings in minutes.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#booking"
              className="rounded-full bg-text-dark px-6 py-3 text-center text-sm font-extrabold text-white shadow-sm transition hover:bg-green-dark focus:outline-none focus:ring-2 focus:ring-green-brand focus:ring-offset-2 focus:ring-offset-background"
            >
              Check a device - from $2.99
            </a>
            <a
              href="#scams"
              className="rounded-full border border-border-light bg-white px-6 py-3 text-center text-sm font-extrabold text-text-dark shadow-sm transition hover:border-green-brand/40 hover:text-green-dark focus:outline-none focus:ring-2 focus:ring-green-brand focus:ring-offset-2 focus:ring-offset-background"
            >
              See real scam stories
            </a>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-4">
            {trustBadges.map((badge) => (
              <div
                key={badge}
                className="card-lift rounded-lg border border-border-light bg-white/70 px-4 py-3"
              >
                <p className="text-sm font-bold text-text-dark">{badge}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md animate-fade-up animation-delay-150 lg:mr-0">
          <div className="card-lift absolute -left-3 top-16 z-20 rounded-xl border border-red-brand/15 bg-white p-4 shadow-xl shadow-red-brand/10 sm:-left-12">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-brand">
              Alert
            </p>
            <p className="mt-1 text-base font-extrabold text-text-dark">
              iCloud Locked
            </p>
          </div>

          <div className="card-lift absolute -right-2 bottom-16 z-20 rounded-xl border border-green-brand/20 bg-white p-4 shadow-xl shadow-green-brand/10 sm:-right-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-brand">
              Verified
            </p>
            <p className="mt-1 text-base font-extrabold text-text-dark">
              Device is clean
            </p>
          </div>

          <div className="animate-float rounded-[2.25rem] bg-text-dark p-3 shadow-2xl shadow-text-dark/20">
            <div className="rounded-[1.75rem] bg-white p-5">
              <div className="mx-auto mb-5 h-1.5 w-20 rounded-full bg-text-dark/20" />
              <div className="card-lift rounded-2xl bg-background p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-hint">
                      IMEI check
                    </p>
                    <h2 className="mt-2 text-2xl font-extrabold text-text-dark">
                      Sample result
                    </h2>
                  </div>
                  <span className="rounded-full bg-green-light px-3 py-1 text-sm font-extrabold text-green-dark">
                    Clean
                  </span>
                </div>

                <div className="mt-6 space-y-3">
                  {checkRows.map(([label, value]) => (
                    <div
                      key={label}
                      className="card-lift flex items-center justify-between gap-4 rounded-xl border border-border-light bg-white px-4 py-3"
                    >
                      <span className="text-sm font-semibold text-text-muted">
                        {label}
                      </span>
                      <span className="text-right text-sm font-extrabold text-text-dark">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="card-lift mt-4 rounded-xl border border-red-brand/20 bg-red-light px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-extrabold text-red-brand">Locked</p>
                    <span className="rounded-full bg-red-brand px-3 py-1 text-xs font-extrabold text-white">
                      Warning
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-text-muted">
                    Activation lock detected on a linked owner account.
                  </p>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <span className="rounded-full bg-green-light px-3 py-2 text-center text-xs font-extrabold text-green-dark">
                    IMEI Clean
                  </span>
                  <span className="rounded-full bg-green-light px-3 py-2 text-center text-xs font-extrabold text-green-dark">
                    Not Stolen
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal className="border-y border-border-light bg-white">
        <div className="mx-auto grid max-w-6xl divide-y divide-border-light px-6 md:grid-cols-2 md:divide-x md:divide-y-0 lg:grid-cols-5">
          {stats.map(([value, label]) => (
            <div key={label} className="px-2 py-8 text-center">
              <p className="text-3xl font-extrabold text-text-dark">{value}</p>
              <p className="mt-2 text-sm font-semibold text-text-muted">
                {label}
              </p>
            </div>
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal id="scams" className="scroll-mt-24 bg-text-dark px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-red-brand">
            Real stories, real losses
          </p>
          <h2 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            People lose money every single day.
          </h2>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {scamStories.map((story) => (
              <article
                key={story.type}
                className="card-lift rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/10 backdrop-blur"
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-extrabold ${story.badgeClass}`}
                  >
                    {story.type}
                  </span>
                  <span className="text-sm font-semibold text-white/55">
                    {story.location}
                  </span>
                </div>

                <p className="mt-8 text-4xl font-extrabold text-red-brand">
                  {story.amount}
                </p>
                <p className="mt-5 text-base leading-7 text-white/72">
                  {story.story}
                </p>
                <blockquote className="mt-6 border-l-2 border-green-brand pl-4 text-sm italic leading-6 text-white/80">
                  "{story.quote}"
                </blockquote>
              </article>
            ))}
          </div>

          <div className="card-lift mt-10 flex flex-col items-start justify-between gap-5 rounded-2xl border border-white/10 bg-white/[0.08] p-6 backdrop-blur md:flex-row md:items-center">
            <p className="text-2xl font-extrabold text-white">
              Don't be the next story.{' '}
              <span className="text-green-brand">$2.99 check.</span>
            </p>
            <a
              href="#booking"
              className="rounded-full bg-white px-6 py-3 text-sm font-extrabold text-text-dark transition hover:bg-green-light focus:outline-none focus:ring-2 focus:ring-green-brand focus:ring-offset-2 focus:ring-offset-text-dark"
            >
              Check a device
            </a>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal id="reviews" className="scroll-mt-24 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.62fr] lg:items-end">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-green-brand">
                Reviews
              </p>
              <h2 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight text-text-dark sm:text-5xl">
                People who almost got burned.
              </h2>
            </div>

            <div className="card-lift rounded-2xl border border-border-light bg-white p-6 shadow-sm">
              <div className="flex items-end gap-4">
                <p className="text-6xl font-extrabold leading-none text-text-dark">
                  4.9
                </p>
                <div className="pb-1">
                  <p className="text-2xl tracking-[0.08em] text-green-brand">
                    ★★★★★
                  </p>
                  <p className="mt-1 text-sm font-semibold text-text-muted">
                    Based on 2,418 verified reviews
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {reviews.map((review) => (
              <article
                key={review.name}
                className={`card-lift flex min-h-full flex-col rounded-2xl border bg-white p-6 shadow-sm ${
                  review.featured
                    ? 'border-green-brand shadow-green-brand/10'
                    : 'border-border-light'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-text-dark text-sm font-extrabold text-white">
                    {review.initials}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-text-dark">
                      {review.name}
                    </h3>
                    <p className="text-sm font-semibold text-text-hint">
                      {review.location}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <p className="text-lg tracking-[0.08em] text-green-brand">
                    ★★★★★
                  </p>
                  <span className="rounded-full bg-green-light px-3 py-1 text-xs font-extrabold text-green-dark">
                    {review.service}
                  </span>
                </div>

                <p className="mt-5 grow text-base leading-7 text-text-muted [&_strong]:font-extrabold [&_strong]:text-text-dark">
                  {review.text}
                </p>

                <div className="mt-6 flex items-center justify-between gap-4 border-t border-border-light pt-4">
                  <p className="text-sm font-extrabold text-text-dark">
                    {review.device}
                  </p>
                  <span className="rounded-full bg-surface px-3 py-1 text-xs font-extrabold text-green-dark">
                    Verified
                  </span>
                </div>
              </article>
            ))}
          </div>

          <article className="card-lift mt-8 grid gap-6 rounded-3xl bg-green-brand p-8 text-white shadow-xl shadow-green-brand/15 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-green-light">
                David W. · repeat customer
              </p>
              <blockquote className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight">
                "I use CheckSafe every single time now"
              </blockquote>
            </div>
            <div className="rounded-2xl bg-white/15 p-5 text-left backdrop-blur md:text-center">
              <p className="text-sm font-bold text-green-light">Saved</p>
              <p className="mt-1 text-4xl font-extrabold">~$1,800</p>
            </div>
          </article>
        </div>
      </ScrollReveal>

      <ScrollReveal id="how" className="scroll-mt-24 bg-surface px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-green-brand">
            How it works
          </p>
          <h2 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight text-text-dark sm:text-5xl">
            Four quick steps before you hand over cash.
          </h2>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {howSteps.map((step, index) => (
              <article
                key={step.title}
                className="card-lift rounded-2xl border border-border-light bg-background p-6"
              >
                <div className="grid h-12 w-12 place-items-center rounded-full bg-green-brand text-lg font-extrabold text-white">
                  {index + 1}
                </div>
                <h3 className="mt-6 text-xl font-extrabold text-text-dark">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-text-muted">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal id="booking" className="scroll-mt-24 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-green-brand">
              Start here
            </p>
            <h2 className="mt-4 text-4xl font-extrabold leading-tight text-text-dark sm:text-5xl">
              Check a device before you buy.
            </h2>
          </div>
          <BookingFlow />
        </div>
      </ScrollReveal>
    </>
  )
}
