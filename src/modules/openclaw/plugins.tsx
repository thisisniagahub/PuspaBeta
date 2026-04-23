'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Puzzle, Power, PowerOff } from 'lucide-react'

interface Plugin {
  id: string; name: string; type: string; version: string; isEnabled: boolean; description?: string
}

export default function PluginsPage() {
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<Record<string, unknown>>('/openclaw/snapshot')
        // Simulate plugins from snapshot
        setPlugins([
          { id: '1', name: 'WhatsApp Connector', type: 'channel', version: '1.2.0', isEnabled: true, description: 'Sambungan WhatsApp untuk mesej masuk/keluar' },
          { id: '2', name: 'Email Gateway', type: 'channel', version: '1.0.3', isEnabled: true, description: 'Penghantaran dan penerimaan e-mel' },
          { id: '3', name: 'PDF Generator', type: 'tool', version: '2.1.0', isEnabled: true, description: 'Penjanaan resit dan laporan PDF' },
          { id: '4', name: 'SMS Notifier', type: 'channel', version: '1.1.0', isEnabled: false, description: 'Penghantaran notifikasi SMS' },
          { id: '5', name: 'Calendar Sync', type: 'integration', version: '0.9.0', isEnabled: false, description: 'Penyegerakan kalendar Google/Outlook' },
          { id: '6', name: 'Bank Feed', type: 'integration', version: '1.0.0', isEnabled: true, description: 'Integrasi penyata bank automatik' },
        ])
      } catch {
        setPlugins([])
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const togglePlugin = (id: string) => {
    setPlugins(prev => prev.map(p => p.id === id ? { ...p, isEnabled: !p.isEnabled } : p))
    toast.info('Tetapan sambungan dikemas kini')
  }

  const enabledCount = plugins.filter(p => p.isEnabled).length

  if (loading) return <div className="space-y-4 p-6"><Skeleton className="h-24 rounded-xl" /><Skeleton className="h-60 rounded-xl" /></div>

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <Puzzle className="h-6 w-6" style={{ color: '#4B0082' }} />
        <h1 className="text-2xl font-bold">Sambungan (Plugins)</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card><CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(5,150,105,0.1)' }}><Power className="h-5 w-5 text-emerald-600" /></div>
          <div><p className="text-xs text-muted-foreground">Diaktifkan</p><p className="text-xl font-bold">{enabledCount}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(107,114,128,0.1)' }}><PowerOff className="h-5 w-5 text-gray-600" /></div>
          <div><p className="text-xs text-muted-foreground">Dilumpuhkan</p><p className="text-xl font-bold">{plugins.length - enabledCount}</p></div>
        </CardContent></Card>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Jenis</TableHead><TableHead className="hidden md:table-cell">Versi</TableHead><TableHead className="hidden lg:table-cell">Penerangan</TableHead><TableHead>Aktif</TableHead></TableRow></TableHeader>
          <TableBody>
            {plugins.map(p => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell><Badge variant="outline">{p.type}</Badge></TableCell>
                <TableCell className="hidden md:table-cell font-mono text-xs">{p.version}</TableCell>
                <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{p.description}</TableCell>
                <TableCell><Switch checked={p.isEnabled} onCheckedChange={() => togglePlugin(p.id)} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
