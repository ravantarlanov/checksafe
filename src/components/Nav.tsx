const navLinks = [
  { href: '#scams', label: 'Scam stories' },
  { href: '#reviews', label: 'Reviews' },
  { href: '#how', label: 'How it works' },
]

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border-light bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-6">
        <a
          href="#top"
          className="flex min-w-0 items-center gap-3 text-text-dark"
          aria-label="CheckSafe home"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-green-brand text-white shadow-sm">
            <svg
              aria-hidden="true"
              className="h-5 w-5"
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
          <span className="truncate text-xl font-extrabold">CheckSafe</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-text-muted transition hover:text-text-dark"
            >
              {link.label}
            </a>
          ))}
        </div>

        <a
          href="#booking"
          className="shrink-0 rounded-full bg-text-dark px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-green-dark focus:outline-none focus:ring-2 focus:ring-green-brand focus:ring-offset-2 focus:ring-offset-background sm:px-5"
        >
          Check a device
        </a>
      </nav>
    </header>
  )
}
