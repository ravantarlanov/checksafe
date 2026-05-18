import type { PropsWithChildren } from 'react'
import { useLocation } from 'react-router-dom'
import { Footer } from './Footer'
import { RepairQuote } from './RepairQuote'

export function AppShell({ children }: PropsWithChildren) {
  const location = useLocation()
  const hideQuote = ['/check', '/chat', '/call'].includes(location.pathname)

  return (
    <div className="min-h-screen bg-background text-text-dark">
      <main>{children}</main>
      {!hideQuote && <RepairQuote />}
      <Footer />
    </div>
  )
}
