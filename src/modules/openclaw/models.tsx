'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Cpu, Zap, Clock } from 'lucide-react'

interface Model {
  id: string; name: string; provider: string; type: string; contextWindow: string; status: string; latencyMs?: number
}

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        await api.get('/openclaw/status')
        setModels([
          { id: '1', name: 'GPT-4o Mini', provider: 'OpenAI', type: 'chat', contextWindow: '128K', status: 'available', latencyMs: 340 },
          { id: '2', name: 'GPT-4o', provider: 'OpenAI', type: 'chat', contextWindow: '128K', status: 'available', latencyMs: 890 },
          { id: '3', name: 'GPT-3.5 Turbo', provider: 'OpenAI', type: 'chat', contextWindow: '16K', status: 'deprecated', latencyMs: 210 },
          { id: '4', name: 'Claude 3.5 Haiku', provider: 'Anthropic', type: 'chat', contextWindow: '200K', status: 'available', latencyMs: 420 },
          { id: '5', name: 'text-embedding-3-small', provider: 'OpenAI', type: 'embedding', contextWindow: '8K', status: 'available', latencyMs: 80 },
        ])
      } catch { setModels([]) } finally { setLoading(false) }
    }
    load()
  }, [])

  const statusColor: Record<string, string> = {
    available: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    deprecated: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    unavailable: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  }

  if (loading) return <div className="space-y-4 p-6"><Skeleton className="h-24 rounded-xl" /><Skeleton className="h-60 rounded-xl" /></div>

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <Cpu className="h-6 w-6 text-brand" />
        <h1 className="text-2xl font-bold">Enjin Model</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card><CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(5,150,105,0.1)' }}><Zap className="h-5 w-5 text-emerald-600" /></div>
          <div><p className="text-xs text-muted-foreground">Tersedia</p><p className="text-xl font-bold">{models.filter(m => m.status === 'available').length}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(124,58,237,0.1)' }}><Clock className="h-5 w-5 text-primary" /></div>
          <div><p className="text-xs text-muted-foreground">Jumlah Model</p><p className="text-xl font-bold">{models.length}</p></div>
        </CardContent></Card>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Penyedia</TableHead><TableHead>Jenis</TableHead><TableHead className="hidden md:table-cell">Konteks</TableHead><TableHead>Status</TableHead><TableHead className="hidden md:table-cell">Kelewatan</TableHead></TableRow></TableHeader>
          <TableBody>
            {models.map(m => (
              <TableRow key={m.id}>
                <TableCell className="font-medium font-mono">{m.name}</TableCell>
                <TableCell><Badge variant="outline">{m.provider}</Badge></TableCell>
                <TableCell className="text-xs">{m.type}</TableCell>
                <TableCell className="hidden md:table-cell text-xs">{m.contextWindow}</TableCell>
                <TableCell><Badge className={statusColor[m.status] || ''}>{m.status}</Badge></TableCell>
                <TableCell className="hidden md:table-cell text-xs">{m.latencyMs ? `${m.latencyMs}ms` : '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
