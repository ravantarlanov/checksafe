import { useEffect, useRef, useState } from 'react'
import priceData from '../data/device_raptors_prices.json'

type ChatMessage = {
  id: number
  role: 'user' | 'assistant'
  content: string
}

type AnthropicResponse = {
  content?: Array<{
    type: string
    text?: string
  }>
}

const introMessage =
  "Hi! Tell me your device and what's wrong with it - I'll give you an instant price estimate based on our real repair prices."

const systemPrompt = `You are a friendly repair assistant for Device Raptors, an electronics repair shop in Wallingford, CT. Use the price data below as a reference to give customers rough estimates only. Always present prices as approximate - never as confirmed or exact. Use phrases like 'typically around', 'usually starts at', or 'approximately'. Always end with a note that the final price depends on parts availability and quality, and that they should bring the device in for a confirmed quote. Never mention databases, systems, or price lists. Keep responses under 3 sentences and stay friendly and helpful.

PRICE DATA:
${JSON.stringify(priceData)}`

const cleanMessage = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // remove ** bold **
    .replace(/\*(.*?)\*/g, '$1') // remove * italic *
    .replace(/`(.*?)`/g, '$1') // remove ` code `
}

export function RepairQuote() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const nextId = useRef(1)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: nextId.current++,
          role: 'assistant',
          content: introMessage,
        },
      ])
    }
  }, [isOpen, messages.length])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = async () => {
    const trimmedInput = input.trim()

    if (!trimmedInput || isTyping) {
      return
    }

    const userMessage: ChatMessage = {
      id: nextId.current++,
      role: 'user',
      content: trimmedInput,
    }
    const conversation = [...messages, userMessage]

    setMessages(conversation)
    setInput('')
    setIsTyping(true)

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

    if (!apiKey) {
      setMessages((current) => [
        ...current,
        {
          id: nextId.current++,
          role: 'assistant',
          content:
            'I need an Anthropic API key configured before I can quote live prices. Add VITE_ANTHROPIC_API_KEY to your local env and try again.',
        },
      ])
      setIsTyping(false)
      return
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 220,
          system: systemPrompt,
          messages: conversation.map((message) => ({
            role: message.role === 'user' ? 'user' : 'assistant',
            content: message.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error(`Anthropic request failed: ${response.status}`)
      }

      const data = (await response.json()) as AnthropicResponse
      const reply =
        data.content?.find((item) => item.type === 'text')?.text?.trim() ||
        'I could not find a matching repair price. Please share the exact model and issue.'

      setMessages((current) => [
        ...current,
        {
          id: nextId.current++,
          role: 'assistant',
          content: cleanMessage(reply),
        },
      ])
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: nextId.current++,
          role: 'assistant',
          content:
            'Sorry, I could not reach the quote assistant right now. Please try again in a moment.',
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[75] flex flex-col items-end gap-3">
      {isOpen ? (
        <div className="flex h-[480px] w-[360px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl shadow-text-dark/20 ring-1 ring-border-light">
          <header className="flex items-center justify-between gap-3 border-b border-border-light px-5 py-4">
            <div>
              <p className="text-sm font-extrabold text-text-dark">
                Device Raptors - Repair Quote
              </p>
              <p className="mt-1 text-xs font-semibold text-text-hint">
                AI price estimates
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-full border border-border-light text-text-muted transition hover:text-text-dark"
              aria-label="Close repair quote chat"
            >
              ×
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-background p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm font-semibold leading-6 ${
                    message.role === 'user'
                      ? 'bg-green-brand text-white'
                      : 'bg-surface text-text-dark'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isTyping ? (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl bg-surface px-4 py-3">
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className="h-2 w-2 animate-bounce rounded-full bg-text-hint"
                      style={{ animationDelay: `${dot * 120}ms` }}
                    />
                  ))}
                </div>
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          <form
            className="flex gap-2 border-t border-border-light bg-white p-3"
            onSubmit={(event) => {
              event.preventDefault()
              void sendMessage()
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Describe your repair..."
              className="min-w-0 flex-1 rounded-full border border-border-light bg-background px-4 py-2 text-sm font-semibold text-text-dark outline-none transition placeholder:text-text-hint focus:border-green-brand focus:ring-4 focus:ring-green-brand/10"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="rounded-full bg-text-dark px-4 py-2 text-sm font-extrabold text-white transition hover:bg-green-dark disabled:cursor-not-allowed disabled:bg-text-hint"
            >
              Send
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex items-center gap-3 rounded-full bg-green-brand px-5 py-4 font-extrabold text-white shadow-xl shadow-green-brand/25 transition hover:-translate-y-0.5 hover:bg-green-dark"
        aria-label="Get a repair quote"
      >
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.75 5.5a4.25 4.25 0 0 0 4.75 5.75l-7.65 7.65a2.3 2.3 0 0 1-3.25 0l-1.5-1.5a2.3 2.3 0 0 1 0-3.25l7.65-7.65Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <path
            d="m7.75 16.25 2 2"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
        Get a quote
      </button>
    </div>
  )
}
