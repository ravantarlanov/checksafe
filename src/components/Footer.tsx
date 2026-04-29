const footerColumns = [
  {
    title: 'Services',
    links: ['IMEI checks', 'Live chat support', 'Agent calls', 'Device reports'],
  },
  {
    title: 'Learn',
    links: ['Scam stories', 'Buyer checklist', 'Carrier locks', 'Activation lock'],
  },
  {
    title: 'Company',
    links: ['About', 'Contact', 'Reviews', 'Support'],
  },
]

export function Footer() {
  return (
    <footer className="bg-text-dark px-6 py-14 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-[1.3fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-green-brand">
                <svg
                  aria-hidden="true"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 3.25 5.75 5.6v5.05c0 4.45 2.65 8.43 6.25 10.1 3.6-1.67 6.25-5.65 6.25-10.1V5.6L12 3.25Z"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                  <path
                    d="m9 12 2 2 4-4"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                </svg>
              </span>
              <span className="text-xl font-extrabold">CheckSafe</span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/65">
              Quick checks for used electronics so you can spot locks, blacklist
              issues, and seller red flags before money changes hands.
            </p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-extrabold uppercase tracking-[0.18em] text-green-brand">
                {column.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#top"
                      className="text-sm font-semibold text-white/65 transition hover:text-white"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-sm font-semibold text-white/55 sm:flex-row">
          <p>© 2026 CheckSafe. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#top" className="transition hover:text-white">
              Privacy
            </a>
            <a href="#top" className="transition hover:text-white">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
