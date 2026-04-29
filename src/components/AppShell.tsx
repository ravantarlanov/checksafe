import type { PropsWithChildren } from 'react'
import { Footer } from './Footer'
import { Nav } from './Nav'

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-background text-text-dark">
      <Nav />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
