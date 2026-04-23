'use client'

import { useState, useRef, useEffect } from 'react'
import { api } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Terminal, ChevronRight } from 'lucide-react'

interface LogEntry { type: 'input' | 'output' | 'error' | 'system'; text: string; time: string }

export default function TerminalPage() {
  const [logs, setLogs] = useState<LogEntry[]>([
    { type: 'system', text: 'OpenClaw Console v2.1.0 — Sistem PUSPA', time: new Date().toISOString() },
    { type: 'system', text: 'Taip "help" untuk senarai arahan.', time: new Date().toISOString() },
  ])
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [logs])

  const addLog = (type: LogEntry['type'], text: string) => {
    setLogs(p => [...p, { type, text, time: new Date().toISOString() }])
  }

  const handleCommand = async () => {
    if (!input.trim()) return
    const cmd = input.trim()
    addLog('input', cmd)
    setInput('')

    if (cmd === 'help') {
      addLog('output', 'Arahan tersedia: help, status, snapshot, ping, clear')
    } else if (cmd === 'clear') {
      setLogs([])
    } else if (cmd === 'status') {
      try {
        const data = await api.get('/openclaw/status')
        addLog('output', JSON.stringify(data, null, 2))
      } catch { addLog('error', 'Gagal mendapatkan status') }
    } else if (cmd === 'snapshot') {
      try {
        const data = await api.get('/openclaw/snapshot')
        addLog('output', JSON.stringify(data, null, 2))
      } catch { addLog('error', 'Gagal mendapatkan snapshot') }
    } else if (cmd === 'ping') {
      addLog('output', 'pong — sambungan OK')
    } else {
      addLog('error', `Arahan tidak dikenali: ${cmd}`)
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <Terminal className="h-6 w-6" style={{ color: '#4B0082' }} />
        <h1 className="text-2xl font-bold">Console Operator</h1>
      </div>

      <Card className="bg-gray-950 text-gray-100 border-gray-800">
        <CardContent className="p-0">
          <div ref={scrollRef} className="h-[500px] overflow-y-auto p-4 font-mono text-sm space-y-1">
            {logs.map((log, i) => (
              <div key={i} className={log.type === 'error' ? 'text-rose-400' : log.type === 'system' ? 'text-cyan-400' : log.type === 'input' ? 'text-emerald-400' : 'text-gray-300'}>
                {log.type === 'input' && <span className="text-emerald-500">$ </span>}
                <span className="whitespace-pre-wrap">{log.text}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center border-t border-gray-800 px-4 py-2">
            <ChevronRight className="h-4 w-4 text-emerald-500 shrink-0" />
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCommand()}
              className="border-0 bg-transparent font-mono text-sm text-gray-100 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-600"
              placeholder="Taip arahan…"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
