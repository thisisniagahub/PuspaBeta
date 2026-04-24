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
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MessageSquare, ArrowRight, ArrowLeft, BarChart3, Settings, Smartphone, Mail, MessageCircle, Wifi, WifiOff, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

interface ChannelMessage {
  id: string
  channel: string
  direction: 'inbound' | 'outbound'
  from: string
  to: string
  content: string
  status: string
  timestamp: string
}

interface ChannelConfig {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  connected: boolean
  status: string
  lastSync: string
  color: string
  bgColor: string
}

const channelBadge: Record<string, { color: string; icon: React.ComponentType<{ className?: string }> }> = {
  whatsapp: { color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400', icon: Smartphone },
  telegram: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400', icon: MessageCircle },
  web: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400', icon: MessageSquare },
  email: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400', icon: Mail },
  sms: { color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400', icon: Smartphone },
}

const mockMessages: ChannelMessage[] = [
  { id: '1', channel: 'whatsapp', direction: 'inbound', from: '+60123456789', to: 'PUSPA', content: 'Saya ingin memohon bantuan zakat', status: 'delivered', timestamp: '2026-03-04T08:00:00Z' },
  { id: '2', channel: 'whatsapp', direction: 'outbound', from: 'PUSPA', to: '+60123456789', content: 'Terima kasih. Sila hantar dokumen berikut…', status: 'delivered', timestamp: '2026-03-04T08:02:00Z' },
  { id: '3', channel: 'telegram', direction: 'inbound', from: '@ahmad123', to: '@puspa_bot', content: 'Bagaimana status permohonan saya?', status: 'delivered', timestamp: '2026-03-04T09:00:00Z' },
  { id: '4', channel: 'telegram', direction: 'outbound', from: '@puspa_bot', to: '@ahmad123', content: 'Permohonan anda sedang diproses.', status: 'delivered', timestamp: '2026-03-04T09:01:00Z' },
  { id: '5', channel: 'web', direction: 'inbound', from: 'Web Chat User', to: 'PUSPA', content: 'Adakah saya layak menerima bantuan?', status: 'delivered', timestamp: '2026-03-04T10:00:00Z' },
  { id: '6', channel: 'email', direction: 'outbound', from: 'noreply@puspa.org', to: 'donor@email.com', content: 'Resit derma anda telah dikeluarkan.', status: 'delivered', timestamp: '2026-03-04T11:00:00Z' },
  { id: '7', channel: 'whatsapp', direction: 'inbound', from: '+60198765432', to: 'PUSPA', content: 'Terima kasih atas bantuan yang diberikan', status: 'delivered', timestamp: '2026-03-04T12:00:00Z' },
  { id: '8', channel: 'sms', direction: 'outbound', from: 'PUSPA', to: '+60111222333', content: 'Pemberitahuan: Temujanji anda esok pukul 9 pagi.', status: 'sent', timestamp: '2026-03-04T14:00:00Z' },
]

const mockChannelConfigs: ChannelConfig[] = [
  { id: 'whatsapp', name: 'WhatsApp', icon: Smartphone, connected: true, status: 'Aktif', lastSync: '2026-03-04T14:30:00Z', color: '#25D366', bgColor: 'bg-green-50 dark:bg-green-950/30' },
  { id: 'telegram', name: 'Telegram', icon: MessageCircle, connected: true, status: 'Aktif', lastSync: '2026-03-04T14:15:00Z', color: '#0088cc', bgColor: 'bg-blue-50 dark:bg-blue-950/30' },
  { id: 'email', name: 'E-mel (SMTP)', icon: Mail, connected: true, status: 'Aktif', lastSync: '2026-03-04T13:00:00Z', color: '#d97706', bgColor: 'bg-amber-50 dark:bg-amber-950/30' },
  { id: 'sms', name: 'SMS (Twilio)', icon: Smartphone, connected: false, status: 'Terputus', lastSync: '2026-03-03T18:00:00Z', color: '#dc2626', bgColor: 'bg-rose-50 dark:bg-rose-950/30' },
]

const barChartData = [
  { channel: 'WhatsApp', mesej: 245, inbound: 130, outbound: 115 },
  { channel: 'Telegram', mesej: 189, inbound: 95, outbound: 94 },
  { channel: 'Web Chat', mesej: 156, inbound: 100, outbound: 56 },
  { channel: 'E-mel', mesej: 98, inbound: 22, outbound: 76 },
  { channel: 'SMS', mesej: 34, inbound: 8, outbound: 26 },
]

const pieData = [
  { name: 'Masuk', value: 355, color: '#4B0082' },
  { name: 'Keluar', value: 367, color: '#9333ea' },
]

export default function MultiChannelPage() {
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<ChannelMessage[]>([])
  const [channelConfigs, setChannelConfigs] = useState<ChannelConfig[]>([])
  const [activeTab, setActiveTab] = useState('messages')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages(mockMessages)
      setChannelConfigs(mockChannelConfigs)
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const filteredMessages = messages.filter(m =>
    m.content.toLowerCase().includes(search.toLowerCase()) ||
    m.channel.toLowerCase().includes(search.toLowerCase()) ||
    m.from.toLowerCase().includes(search.toLowerCase())
  )

  const toggleConnection = (id: string) => {
    setChannelConfigs(prev => prev.map(c =>
      c.id === id ? { ...c, connected: !c.connected, status: c.connected ? 'Terputus' : 'Aktif' } : c
    ))
    const cfg = channelConfigs.find(c => c.id === id)
    toast.success(cfg?.connected ? `${cfg.name} terputus` : `${cfg?.name} disambung`)
  }

  if (loading) return (
    <div className="space-y-4 p-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  )

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: '#4B008215' }}>
          <MessageSquare className="h-5 w-5" style={{ color: '#4B0082' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Berbilang Saluran</h1>
          <p className="text-sm text-muted-foreground">Pengurusan mesej merentas saluran komunikasi</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="messages">Mesej</TabsTrigger>
          <TabsTrigger value="stats">Statistik</TabsTrigger>
          <TabsTrigger value="config">Konfigurasi</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Cari mesej…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="rounded-lg border overflow-auto">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Saluran</TableHead><TableHead>Arah</TableHead><TableHead className="hidden md:table-cell">Daripada</TableHead><TableHead>Kandungan</TableHead><TableHead>Status</TableHead><TableHead className="hidden lg:table-cell">Masa</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {filteredMessages.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Tiada mesej</TableCell></TableRow>
                    ) : filteredMessages.map(m => {
                      const cb = channelBadge[m.channel]
                      const ChIcon = cb?.icon || MessageSquare
                      return (
                        <TableRow key={m.id}>
                          <TableCell><Badge className={cn(cb?.color, 'gap-1')}><ChIcon className="h-3 w-3" />{m.channel}</Badge></TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {m.direction === 'inbound' ? <ArrowRight className="h-3.5 w-3.5 text-green-600" /> : <ArrowLeft className="h-3.5 w-3.5 text-blue-600" />}
                              <span className="text-xs">{m.direction === 'inbound' ? 'Masuk' : 'Keluar'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs">{m.from}</TableCell>
                          <TableCell className="font-medium text-sm max-w-[250px] truncate">{m.content}</TableCell>
                          <TableCell><Badge variant="outline">{m.status}</Badge></TableCell>
                          <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{new Date(m.timestamp).toLocaleString('ms-MY')}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="mt-4 space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Mesej Mengikut Saluran</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="channel" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="inbound" fill="#4B0082" name="Masuk" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="outbound" fill="#9333ea" name="Keluar" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Nisbah Masuk vs Keluar</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="config" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {channelConfigs.map(cfg => {
              const Icon = cfg.icon
              return (
                <Card key={cfg.id} className={cn(cfg.bgColor)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${cfg.color}20` }}>
                          <Icon className="h-6 w-6" style={{ color: cfg.color }} />
                        </div>
                        <div>
                          <h3 className="font-semibold">{cfg.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={cfg.connected ? 'default' : 'secondary'} className={cfg.connected ? 'bg-green-600' : ''}>
                              {cfg.connected ? 'Sambung' : 'Terputus'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{cfg.status}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Penyimpanan terakhir: {new Date(cfg.lastSync).toLocaleString('ms-MY')}</p>
                        </div>
                      </div>
                      <Button variant={cfg.connected ? 'destructive' : 'default'} size="sm" onClick={() => toggleConnection(cfg.id)} className="gap-1.5">
                        {cfg.connected ? <><WifiOff className="h-3.5 w-3.5" /> Putus</> : <><Wifi className="h-3.5 w-3.5" /> Sambung</>}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
