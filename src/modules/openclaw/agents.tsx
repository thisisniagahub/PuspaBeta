'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Bot, Activity, CircleDot } from 'lucide-react'

interface Agent {
  id: string; name: string; type: string; status: string; model?: string; lastActive?: string; tasksCompleted: number
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        await api.get('/openclaw/snapshot')
        setAgents([
          { id: '1', name: 'Ops Conductor Agent', type: 'orchestrator', status: 'active', model: 'gpt-4o-mini', lastActive: new Date().toISOString(), tasksCompleted: 147 },
          { id: '2', name: 'Compliance Checker', type: 'validator', status: 'active', model: 'gpt-4o-mini', lastActive: new Date().toISOString(), tasksCompleted: 89 },
          { id: '3', name: 'Donation Analyzer', type: 'analyzer', status: 'idle', model: 'gpt-4o-mini', lastActive: new Date(Date.now() - 3600000).toISOString(), tasksCompleted: 34 },
          { id: '4', name: 'Report Generator', type: 'generator', status: 'idle', model: 'gpt-4o-mini', lastActive: new Date(Date.now() - 7200000).toISOString(), tasksCompleted: 22 },
          { id: '5', name: 'Member Screener', type: 'validator', status: 'error', model: 'gpt-4o-mini', tasksCompleted: 0 },
        ])
      } catch { setAgents([]) } finally { setLoading(false) }
    }
    load()
  }, [])

  const statusColor: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    idle: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    error: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  }

  if (loading) return <div className="space-y-4 p-6"><Skeleton className="h-24 rounded-xl" /><Skeleton className="h-60 rounded-xl" /></div>

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <Bot className="h-6 w-6" style={{ color: '#4B0082' }} />
        <h1 className="text-2xl font-bold">Ejen AI</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card><CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(5,150,105,0.1)' }}><Activity className="h-5 w-5 text-emerald-600" /></div>
          <div><p className="text-xs text-muted-foreground">Aktif</p><p className="text-xl font-bold">{agents.filter(a => a.status === 'active').length}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(124,58,237,0.1)' }}><CircleDot className="h-5 w-5 text-purple-600" /></div>
          <div><p className="text-xs text-muted-foreground">Jumlah Ejen</p><p className="text-xl font-bold">{agents.length}</p></div>
        </CardContent></Card>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Jenis</TableHead><TableHead>Status</TableHead><TableHead className="hidden md:table-cell">Model</TableHead><TableHead className="hidden md:table-cell">Tugasan Selesai</TableHead><TableHead className="hidden lg:table-cell">Aktif Terakhir</TableHead></TableRow></TableHeader>
          <TableBody>
            {agents.map(a => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.name}</TableCell>
                <TableCell><Badge variant="outline">{a.type}</Badge></TableCell>
                <TableCell><Badge className={statusColor[a.status] || ''}>{a.status}</Badge></TableCell>
                <TableCell className="hidden md:table-cell font-mono text-xs">{a.model || '—'}</TableCell>
                <TableCell className="hidden md:table-cell">{a.tasksCompleted}</TableCell>
                <TableCell className="hidden lg:table-cell text-xs">{a.lastActive ? new Date(a.lastActive).toLocaleString('ms-MY') : '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
