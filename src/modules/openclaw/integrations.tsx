'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Radio, Wifi, ArrowRightLeft } from 'lucide-react'

interface Channel {
  id: string; name: string; type: string; gateway: string; status: string; lastActivity?: string
}

export default function IntegrationsPage() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        await api.get('/openclaw/status')
        setChannels([
          { id: '1', name: 'WhatsApp Business', type: 'messaging', gateway: 'WhatsApp API', status: 'connected', lastActivity: new Date().toISOString() },
          { id: '2', name: 'E-mel SMTP', type: 'email', gateway: 'Gmail SMTP', status: 'connected', lastActivity: new Date().toISOString() },
          { id: '3', name: 'Telegram Bot', type: 'messaging', gateway: 'Telegram API', status: 'disconnected' },
          { id: '4', name: 'Bank Transfer API', type: 'financial', gateway: 'FPX/Maybank', status: 'connected', lastActivity: new Date().toISOString() },
          { id: '5', name: 'SMS Gateway', type: 'messaging', gateway: 'Twilio', status: 'disconnected' },
        ])
      } catch {
        setChannels([])
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const connectedCount = channels.filter(c => c.status === 'connected').length

  if (loading) return <div className="space-y-4 p-6"><Skeleton className="h-24 rounded-xl" /><Skeleton className="h-60 rounded-xl" /></div>

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <Radio className="h-6 w-6" style={{ color: '#4B0082' }} />
        <h1 className="text-2xl font-bold">Gateway &amp; Channel</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card><CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(5,150,105,0.1)' }}><Wifi className="h-5 w-5 text-emerald-600" /></div>
          <div><p className="text-xs text-muted-foreground">Bersambung</p><p className="text-xl font-bold">{connectedCount}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(124,58,237,0.1)' }}><ArrowRightLeft className="h-5 w-5 text-purple-600" /></div>
          <div><p className="text-xs text-muted-foreground">Jumlah Saluran</p><p className="text-xl font-bold">{channels.length}</p></div>
        </CardContent></Card>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Jenis</TableHead><TableHead>Gateway</TableHead><TableHead>Status</TableHead><TableHead className="hidden md:table-cell">Aktiviti Terakhir</TableHead></TableRow></TableHeader>
          <TableBody>
            {channels.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell><Badge variant="outline">{c.type}</Badge></TableCell>
                <TableCell className="text-xs">{c.gateway}</TableCell>
                <TableCell><Badge variant={c.status === 'connected' ? 'default' : 'secondary'}>{c.status === 'connected' ? 'Bersambung' : 'Terputus'}</Badge></TableCell>
                <TableCell className="hidden md:table-cell text-xs">{c.lastActivity ? new Date(c.lastActivity).toLocaleString('ms-MY') : '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
