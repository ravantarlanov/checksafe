import type { HTMLAttributes, PropsWithChildren } from 'react'
import { useEffect, useRef, useState } from 'react'

type ScrollRevealProps = PropsWithChildren<HTMLAttributes<HTMLElement>>

export function ScrollReveal({
  children,
  className = '',
  ...props
}: ScrollRevealProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = sectionRef.current

    if (!node) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.15 },
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className={`reveal-on-scroll ${isVisible ? 'is-visible' : ''} ${className}`}
      {...props}
    >
      {children}
    </section>
  )
}
