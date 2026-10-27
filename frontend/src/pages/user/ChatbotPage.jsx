import { useEffect, useRef, useState } from 'react'
import { Send, Bot, Trash2, MessageSquareText } from 'lucide-react'
import api from '../../api/client.js'

export default function ChatbotPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const bottomRef = useRef(null)

  const loadHistory = async () => {
    setLoadingHistory(true)
    try {
      const { data } = await api.get('/chat/history')
      setMessages(data)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => { loadHistory() }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (e) => {
    e.preventDefault()
    if (!input.trim() || sending) return
    const userMsg = { id: `tmp-${Date.now()}`, role: 'user', message: input }
    setMessages((m) => [...m, userMsg])
    const toSend = input
    setInput('')
    setSending(true)
    try {
      const { data } = await api.post('/chat', { message: toSend })
      setMessages((m) => [...m, { id: `tmp-bot-${Date.now()}`, role: 'bot', message: data.reply }])
    } catch (err) {
      setMessages((m) => [...m, { id: `err-${Date.now()}`, role: 'bot', message: 'Sorry, something went wrong processing that request.' }])
    } finally {
      setSending(false)
    }
  }

  const clearHistory = async () => {
    await api.delete('/chat/history')
    setMessages([])
  }

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Threat Intelligence Chatbot</h1>
          <p>Ask about threats in the repository, or paste text for instant classification.</p>
        </div>
        {messages.length > 0 && (
          <button className="btn btn-ghost" onClick={clearHistory}><Trash2 size={14} /> Clear Chat</button>
        )}
      </div>

      <div className="glass-card panel chat-shell">
        <div className="chat-messages scrollbar-thin">
          {loadingHistory ? (
            <div className="skeleton" style={{ height: 200 }} />
          ) : messages.length === 0 ? (
            <div className="empty-state">
              <MessageSquareText size={40} />
              <p>Ask me something like "What ransomware threats were seen this week?" or paste a suspicious log.</p>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`chat-bubble ${m.role}`}>
                {m.role === 'bot' && <Bot size={14} style={{ marginRight: 6, verticalAlign: -2 }} />}
                {m.message}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
        <form className="chat-input-row" onSubmit={send}>
          <input className="input-field" value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a threat, CVE, or paste suspicious text..." disabled={sending} />
          <button className="btn btn-primary" type="submit" disabled={sending || !input.trim()}>
            {sending ? <span className="spinner" /> : <Send size={16} />}
          </button>
        </form>
      </div>
    </div>
  )
}
