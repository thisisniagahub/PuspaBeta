'use client'

import { useState, useEffect, useRef } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Send, Bot, User, Sparkles, BarChart3, Lightbulb } from 'lucide-react'

interface ChatMessage { role: 'user' | 'assistant'; content: string; timestamp: string }
interface AnalyticsInsight { category: string; insight: string; priority: string }

export default function AIPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [insights, setInsights] = useState<AnalyticsInsight[]>([])
  const [loadingInsights, setLoadingInsights] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadInsights() {
      try {
        const data = await api.get<AnalyticsInsight[]>('/ai/analytics')
        setInsights(Array.isArray(data) ? data : [])
      } catch { setInsights([]) } finally { setLoadingInsights(false) }
    }
    loadInsights()
  }, [])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return
    const userMsg: ChatMessage = { role: 'user', content: input, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setSending(true)
    try {
      const data = await api.post<{ response: string }>('/ai/chat', { message: input })
      const aiMsg: ChatMessage = { role: 'assistant', content: data.response || 'Maaf, saya tidak dapat memproses permintaan anda.', timestamp: new Date().toISOString() }
      setMessages(prev => [...prev, aiMsg])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Maaf, ralat berlaku semasa memproses.', timestamp: new Date().toISOString() }])
    } finally { setSending(false) }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold">Alat AI</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chat */}
        <Card className="lg:col-span-2">
          <CardHeader><div className="flex items-center gap-2"><Bot className="h-5 w-5" style={{ color: '#4B0082' }} /><CardTitle>Pembantu AI PUSPA</CardTitle></div><CardDescription>Tanya apa-apa tentang data dan operasi PUSPA</CardDescription></CardHeader>
          <CardContent>
            <div ref={scrollRef} className="mb-4 h-[400px] overflow-y-auto rounded-lg border bg-muted/30 p-4 space-y-3">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Sparkles className="h-10 w-10 mb-2 opacity-40" />
                  <p className="text-sm">Mulakan perbualan dengan Pembantu AI PUSPA</p>
                  <p className="text-xs mt-1">Cuba tanya: &quot;Berapa jumlah ahli asnaf bulan ini?&quot;</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/40"><Bot className="h-4 w-4 text-purple-600" /></div>}
                  <div className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border shadow-sm'}`}>
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                  {m.role === 'user' && <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted"><User className="h-4 w-4" /></div>}
                </div>
              ))}
              {sending && <div className="flex gap-2"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/40"><Bot className="h-4 w-4 text-purple-600" /></div><div className="rounded-xl bg-card border px-4 py-3"><Skeleton className="h-4 w-32" /></div></div>}
            </div>
            <div className="flex gap-2">
              <Input placeholder="Taip mesej anda…" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()} disabled={sending} />
              <Button onClick={handleSend} disabled={sending || !input.trim()}><Send className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>

        {/* Analytics */}
        <Card>
          <CardHeader><div className="flex items-center gap-2"><BarChart3 className="h-5 w-5" style={{ color: '#4B0082' }} /><CardTitle>Analisis AI</CardTitle></div><CardDescription>Insight daripada data organisasi</CardDescription></CardHeader>
          <CardContent>
            {loadingInsights ? (
              <div className="space-y-3">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-16 rounded-lg" />)}</div>
            ) : insights.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Tiada insight tersedia</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {insights.map((ins, i) => (
                  <div key={i} className="rounded-lg border p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                      <Badge variant="outline" className="text-[10px]">{ins.category}</Badge>
                      <Badge variant={ins.priority === 'high' ? 'destructive' : 'secondary'} className="text-[10px]">{ins.priority}</Badge>
                    </div>
                    <p className="text-sm">{ins.insight}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
