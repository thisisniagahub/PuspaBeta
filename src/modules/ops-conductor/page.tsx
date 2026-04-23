'use client'

import { useState, useEffect, useRef } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Send, Bot, User, Zap, Activity, ClipboardList, BarChart3 } from 'lucide-react'

interface WorkItem { id: string; workItemNumber: string; title: string; domain: string; intent: string; status: string; priority: string; createdAt: string }
interface OpsDashboard { totalWorkItems: number; queuedItems: number; activeItems: number; completedItems: number; recentEvents: { summary: string; createdAt: string }[] }
interface ChatMsg { role: 'user' | 'assistant'; content: string }

const statusColor: Record<string, string> = {
  queued: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  waiting_user: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  failed: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  blocked: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

export default function OpsConductorPage() {
  const [dashboard, setDashboard] = useState<OpsDashboard | null>(null)
  const [workItems, setWorkItems] = useState<WorkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [d, w] = await Promise.allSettled([
        api.get<OpsDashboard>('/ops/dashboard'),
        api.get<WorkItem[]>('/ops/work-items'),
      ])
      if (d.status === 'fulfilled') setDashboard(d.value)
      if (w.status === 'fulfilled') setWorkItems(Array.isArray(w.value) ? w.value : [])
    } catch { toast.error('Gagal memuatkan data ops') } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, []) 
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return
    setMessages(p => [...p, { role: 'user', content: input }])
    const msg = input; setInput(''); setSending(true)
    try {
      const data = await api.post<{ response: string }>('/ai/chat', { message: `[Ops Conductor] ${msg}` })
      setMessages(p => [...p, { role: 'assistant', content: data.response || 'Proses selesai.' }])
    } catch { setMessages(p => [...p, { role: 'assistant', content: 'Ralat berlaku.' }]) } finally { setSending(false) }
  }

  if (loading) return <div className="space-y-4 p-6"><div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-24 rounded-xl" />)}</div><Skeleton className="h-80 rounded-xl" /></div>

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold">Ops Conductor</h1>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Jumlah Kerja', value: dashboard?.totalWorkItems ?? workItems.length, icon: ClipboardList, color: '#7c3aed' },
          { label: 'Beratur', value: dashboard?.queuedItems ?? 0, icon: Activity, color: '#6b7280' },
          { label: 'Aktif', value: dashboard?.activeItems ?? 0, icon: Zap, color: '#0ea5e9' },
          { label: 'Selesai', value: dashboard?.completedItems ?? 0, icon: BarChart3, color: '#059669' },
        ].map(s => (
          <Card key={s.label}><CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}15` }}><s.icon className="h-5 w-5" style={{ color: s.color }} /></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chat */}
        <Card>
          <CardHeader><div className="flex items-center gap-2"><Bot className="h-5 w-5" style={{ color: '#4B0082' }} /><CardTitle>Chat Ops</CardTitle></div><CardDescription>Arahan operasi AI</CardDescription></CardHeader>
          <CardContent>
            <div ref={scrollRef} className="mb-3 h-[300px] overflow-y-auto rounded-lg border bg-muted/30 p-3 space-y-2">
              {messages.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Taip arahan operasi anda…</p>}
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && <Bot className="mt-1 h-4 w-4 shrink-0 text-purple-600" />}
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border'}`}>{m.content}</div>
                  {m.role === 'user' && <User className="mt-1 h-4 w-4 shrink-0" />}
                </div>
              ))}
            </div>
            <div className="flex gap-2"><Input placeholder="Arahan ops…" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} disabled={sending} /><Button onClick={handleSend} disabled={sending}><Send className="h-4 w-4" /></Button></div>
          </CardContent>
        </Card>

        {/* Work Items */}
        <Card>
          <CardHeader><CardTitle>Item Kerja</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader><TableRow><TableHead>No.</TableHead><TableHead>Tajuk</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {workItems.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="py-8 text-center text-muted-foreground">Tiada item kerja</TableCell></TableRow>
                  ) : workItems.slice(0, 10).map(w => (
                    <TableRow key={w.id}>
                      <TableCell className="font-mono text-xs">{w.workItemNumber}</TableCell>
                      <TableCell className="text-sm">{w.title}</TableCell>
                      <TableCell><Badge className={statusColor[w.status] || ''}>{w.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
