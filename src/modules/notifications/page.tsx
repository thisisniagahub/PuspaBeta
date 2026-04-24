'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Bell, Send, CheckCircle2, XCircle, Clock, Mail, MessageSquare, Smartphone, Globe, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotificationLog {
  id: string
  type: string
  channel: string
  recipient: string
  title: string
  status: string
  priority: string
  sentAt: string
}

const channelIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  whatsapp: Smartphone,
  telegram: MessageSquare,
  email: Mail,
  web: Globe,
}

const channelColor: Record<string, string> = {
  whatsapp: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  telegram: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  email: 'bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary',
  web: 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-400',
}

const statusColor: Record<string, string> = {
  delivered: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
}

const priorityColor: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  normal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  low: 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-400',
}

const mockLogs: NotificationLog[] = [
  { id: '1', type: 'kes_baharu', channel: 'whatsapp', recipient: '+60123456789', title: 'Kes baharu telah didaftarkan', status: 'delivered', priority: 'high', sentAt: '2026-03-04T08:30:00Z' },
  { id: '2', type: 'donasi_terima', channel: 'email', recipient: 'admin@puspa.org', title: 'Donasi RM500 diterima', status: 'delivered', priority: 'normal', sentAt: '2026-03-04T09:00:00Z' },
  { id: '3', type: 'eskalasi', channel: 'telegram', recipient: '@ops_team', title: 'Kes KS-001 perlu perhatian segera', status: 'sent', priority: 'critical', sentAt: '2026-03-04T09:30:00Z' },
  { id: '4', type: 'peringatan', channel: 'web', recipient: 'semua_staf', title: 'Mesyuarat agihan bulan ini', status: 'pending', priority: 'normal', sentAt: '2026-03-04T10:00:00Z' },
  { id: '5', type: 'pembayaran', channel: 'whatsapp', recipient: '+60198765432', title: 'Pembayaran disalurkan', status: 'delivered', priority: 'high', sentAt: '2026-03-04T11:00:00Z' },
  { id: '6', type: 'kes_baharu', channel: 'email', recipient: 'staff@puspa.org', title: 'Kes baru menunggu pengesahan', status: 'failed', priority: 'high', sentAt: '2026-03-04T12:00:00Z' },
  { id: '7', type: 'compliance', channel: 'telegram', recipient: '@compliance', title: 'Laporan compliance bulanan', status: 'delivered', priority: 'normal', sentAt: '2026-03-04T14:00:00Z' },
  { id: '8', type: 'peringatan', channel: 'web', recipient: 'semua_staf', title: 'Tamat tempoh dokumen eKYC', status: 'pending', priority: 'high', sentAt: '2026-03-04T15:00:00Z' },
]

interface NotificationPref {
  eventType: string
  label: string
  whatsapp: boolean
  telegram: boolean
  email: boolean
  web: boolean
}

const mockPrefs: NotificationPref[] = [
  { eventType: 'kes_baharu', label: 'Kes Baharu', whatsapp: true, telegram: true, email: true, web: true },
  { eventType: 'eskalasi', label: 'Eskalasi Kes', whatsapp: true, telegram: true, email: false, web: true },
  { eventType: 'donasi_terima', label: 'Donasi Diterima', whatsapp: false, telegram: false, email: true, web: true },
  { eventType: 'pembayaran', label: 'Pembayaran Disalurkan', whatsapp: true, telegram: false, email: true, web: true },
  { eventType: 'compliance', label: 'Compliance', whatsapp: false, telegram: true, email: true, web: true },
  { eventType: 'peringatan', label: 'Peringatan', whatsapp: true, telegram: true, email: true, web: true },
]

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<NotificationLog[]>([])
  const [prefs, setPrefs] = useState<NotificationPref[]>([])
  const [activeTab, setActiveTab] = useState('log')
  const [sendForm, setSendForm] = useState({ type: 'peringatan', channel: 'whatsapp', recipient: '', title: '', message: '', priority: 'normal' })
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLogs(mockLogs)
      setPrefs(mockPrefs)
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const handleSend = async () => {
    if (!sendForm.recipient || !sendForm.title) { toast.error('Sila isi penerima dan tajuk'); return }
    setSending(true)
    try {
      await new Promise(r => setTimeout(r, 800))
      const newLog: NotificationLog = {
        id: String(Date.now()), type: sendForm.type, channel: sendForm.channel,
        recipient: sendForm.recipient, title: sendForm.title, status: 'sent',
        priority: sendForm.priority, sentAt: new Date().toISOString(),
      }
      setLogs(prev => [newLog, ...prev])
      toast.success('Notifikasi berjaya dihantar')
      setSendForm({ type: 'peringatan', channel: 'whatsapp', recipient: '', title: '', message: '', priority: 'normal' })
    } catch { toast.error('Gagal menghantar notifikasi') } finally { setSending(false) }
  }

  const togglePref = (idx: number, channel: 'whatsapp' | 'telegram' | 'email' | 'web') => {
    setPrefs(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], [channel]: !next[idx][channel] }
      return next
    })
  }

  const totalSent = logs.length
  const delivered = logs.filter(l => l.status === 'delivered').length
  const failed = logs.filter(l => l.status === 'failed').length
  const pending = logs.filter(l => l.status === 'pending').length

  if (loading) return (
    <div className="space-y-4 p-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  )

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-muted">
          <Bell className="h-5 w-5 text-brand" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Notifikasi</h1>
          <p className="text-sm text-muted-foreground">Pengurusan notifikasi berbilang saluran</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Jumlah Dihantar', value: totalSent, icon: Send, color: 'var(--brand)', bgColor: 'var(--brand-muted)' },
          { label: 'Berjaya', value: delivered, icon: CheckCircle2, color: '#059669' },
          { label: 'Gagal', value: failed, icon: XCircle, color: '#dc2626' },
          { label: 'Menunggu', value: pending, icon: Clock, color: '#d97706' },
        ].map(s => (
          <Card key={s.label}><CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: s.bgColor || `${s.color}15` }}><s.icon className="h-5 w-5" style={{ color: s.color }} /></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="log">Log Notifikasi</TabsTrigger>
          <TabsTrigger value="prefs">Keutamaan</TabsTrigger>
          <TabsTrigger value="send">Hantar</TabsTrigger>
        </TabsList>

        <TabsContent value="log" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Log Notifikasi</CardTitle><CardDescription>Senarai semua notifikasi yang dihantar</CardDescription></CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-auto">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Jenis</TableHead><TableHead>Saluran</TableHead><TableHead className="hidden md:table-cell">Penerima</TableHead><TableHead>Tajuk</TableHead><TableHead>Status</TableHead><TableHead className="hidden lg:table-cell">Keutamaan</TableHead><TableHead className="hidden md:table-cell">Masa</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {logs.map(l => {
                      const ChIcon = channelIcons[l.channel] || Globe
                      return (
                        <TableRow key={l.id}>
                          <TableCell><Badge variant="outline">{l.type}</Badge></TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <ChIcon className="h-3.5 w-3.5" />
                              <Badge className={channelColor[l.channel]}>{l.channel}</Badge>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs">{l.recipient}</TableCell>
                          <TableCell className="font-medium text-sm max-w-[200px] truncate">{l.title}</TableCell>
                          <TableCell><Badge className={statusColor[l.status]}>{l.status}</Badge></TableCell>
                          <TableCell className="hidden lg:table-cell"><Badge className={priorityColor[l.priority]}>{l.priority}</Badge></TableCell>
                          <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{new Date(l.sentAt).toLocaleString('ms-MY')}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prefs" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Keutamaan Notifikasi</CardTitle><CardDescription>Tetapkan saluran notifikasi bagi setiap peristiwa</CardDescription></CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-auto">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Peristiwa</TableHead><TableHead className="text-center">WhatsApp</TableHead><TableHead className="text-center">Telegram</TableHead><TableHead className="text-center">E-mel</TableHead><TableHead className="text-center">Web</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {prefs.map((p, idx) => (
                      <TableRow key={p.eventType}>
                        <TableCell className="font-medium">{p.label}</TableCell>
                        {(['whatsapp', 'telegram', 'email', 'web'] as const).map(ch => (
                          <TableCell key={ch} className="text-center">
                            <Switch checked={p[ch]} onCheckedChange={() => togglePref(idx, ch)} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="send" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Hantar Notifikasi</CardTitle><CardDescription>Hantar notifikasi kepada penerima melalui saluran pilihan</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Jenis</Label>
                  <Select value={sendForm.type} onValueChange={v => setSendForm(p => ({ ...p, type: v }))}>
                    <SelectTrigger /><SelectContent>
                      <SelectItem value="peringatan">Peringatan</SelectItem>
                      <SelectItem value="kes_baharu">Kes Baharu</SelectItem>
                      <SelectItem value="eskalasi">Eskalasi</SelectItem>
                      <SelectItem value="pembayaran">Pembayaran</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Saluran</Label>
                  <Select value={sendForm.channel} onValueChange={v => setSendForm(p => ({ ...p, channel: v }))}>
                    <SelectTrigger /><SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="telegram">Telegram</SelectItem>
                      <SelectItem value="email">E-mel</SelectItem>
                      <SelectItem value="web">Web Push</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2"><Label>Penerima</Label><Input placeholder="No. telefon / e-mel / ID" value={sendForm.recipient} onChange={e => setSendForm(p => ({ ...p, recipient: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>Tajuk</Label><Input placeholder="Tajuk notifikasi" value={sendForm.title} onChange={e => setSendForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>Mesej</Label><Textarea placeholder="Kandungan notifikasi…" rows={4} value={sendForm.message} onChange={e => setSendForm(p => ({ ...p, message: e.target.value }))} /></div>
              <div className="grid gap-2">
                <Label>Keutamaan</Label>
                <Select value={sendForm.priority} onValueChange={v => setSendForm(p => ({ ...p, priority: v }))}>
                  <SelectTrigger /><SelectContent>
                    <SelectItem value="critical">Kritikal</SelectItem>
                    <SelectItem value="high">Tinggi</SelectItem>
                    <SelectItem value="normal">Biasa</SelectItem>
                    <SelectItem value="low">Rendah</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSend} disabled={sending} className="gap-2 bg-brand">
                {sending ? <><Clock className="h-4 w-4 animate-spin" /> Menghantar…</> : <><Send className="h-4 w-4" /> Hantar Notifikasi</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
