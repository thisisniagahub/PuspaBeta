'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Brain, Search, Plus, Trash2, Eye, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MemoryRecord {
  id: string
  userId: string
  userName: string
  category: string
  content: string
  confidence: number
  accessCount: number
  source: string
  createdAt: string
  updatedAt: string
}

const categoryColors: Record<string, string> = {
  peribadi: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  kewangan: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  kesihatan: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  keluarga: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  pekerjaan: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
  pendidikan: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400',
  preferensi: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400',
}

const mockMemories: MemoryRecord[] = [
  { id: '1', userId: 'USR-001', userName: 'Ahmad bin Ali', category: 'peribadi', content: 'Berumur 41 tahun, tinggal di Kampung Baru, KL', confidence: 95, accessCount: 23, source: 'onboarding', createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-03-01T10:00:00Z' },
  { id: '2', userId: 'USR-001', userName: 'Ahmad bin Ali', category: 'kewangan', content: 'Pendapatan bulanan RM1,800, tiada simpanan tetap', confidence: 90, accessCount: 18, source: 'triage', createdAt: '2026-01-15T08:05:00Z', updatedAt: '2026-02-28T14:00:00Z' },
  { id: '3', userId: 'USR-001', userName: 'Ahmad bin Ali', category: 'keluarga', content: '4 orang tanggungan (isteri + 3 anak), anak sulung sekolah menengah', confidence: 88, accessCount: 15, source: 'onboarding', createdAt: '2026-01-15T08:10:00Z', updatedAt: '2026-02-20T09:00:00Z' },
  { id: '4', userId: 'USR-001', userName: 'Ahmad bin Ali', category: 'kesihatan', content: 'Mempunyai diabetes jenis 2, memerlukan rawatan berkala', confidence: 92, accessCount: 12, source: 'case_review', createdAt: '2026-02-01T11:00:00Z', updatedAt: '2026-03-02T16:00:00Z' },
  { id: '5', userId: 'USR-002', userName: 'Siti binti Hassan', category: 'peribadi', content: 'Berumur 36 tahun, tinggal di Shah Alam, Selangor', confidence: 97, accessCount: 20, source: 'onboarding', createdAt: '2026-01-20T09:00:00Z', updatedAt: '2026-03-01T11:00:00Z' },
  { id: '6', userId: 'USR-002', userName: 'Siti binti Hassan', category: 'kewangan', content: 'Pendapatan bulanan RM2,200, hutang peribadi RM15,000', confidence: 85, accessCount: 10, source: 'triage', createdAt: '2026-01-20T09:05:00Z', updatedAt: '2026-02-15T13:00:00Z' },
  { id: '7', userId: 'USR-002', userName: 'Siti binti Hassan', category: 'pendidikan', content: 'Ijazah sarjana muda, mencari latihan kemahiran digital', confidence: 80, accessCount: 8, source: 'chat', createdAt: '2026-02-10T14:00:00Z', updatedAt: '2026-02-28T10:00:00Z' },
  { id: '8', userId: 'USR-003', userName: 'Mohd Rizal', category: 'peribadi', content: 'Berumur 38 tahun, tinggal di Cheras, warga pendaftar', confidence: 94, accessCount: 14, source: 'onboarding', createdAt: '2026-02-05T10:00:00Z', updatedAt: '2026-03-03T08:00:00Z' },
  { id: '9', userId: 'USR-003', userName: 'Mohd Rizal', category: 'pekerjaan', content: 'Menganggur selama 6 bulan, pengalaman dalam bidang pengangkutan', confidence: 87, accessCount: 7, source: 'case_review', createdAt: '2026-02-05T10:05:00Z', updatedAt: '2026-03-01T09:00:00Z' },
  { id: '10', userId: 'USR-003', userName: 'Mohd Rizal', category: 'preferensi', content: 'Lebih suka dihubungi melalui WhatsApp pada waktu petang', confidence: 75, accessCount: 5, source: 'chat', createdAt: '2026-02-15T16:00:00Z', updatedAt: '2026-02-15T16:00:00Z' },
]

const mockMemoryContext = `# MEMORY.md — Ahmad bin Ali (USR-001)
# Dijana secara automatik oleh PUSPA Agent Memory
# Terakhir dikemas kini: 4 Mac 2026

## Maklumat Peribadi
- Nama: Ahmad bin Ali
- Umur: 41 tahun
- Alamat: Kampung Baru, Kuala Lumpur
- No. KP: 850101-01-5123

## Status Kewangan
- Pendapatan bulanan: RM1,800
- Simpanan: Tiada simpanan tetap
- Kategori asnaf: Fakir

## Keluarga
- 4 orang tanggungan (isteri + 3 anak)
- Anak sulung: Sekolah menengah

## Kesihatan
- Diabetes jenis 2
- Memerlukan rawatan berkala

## Interaksi Terkini
- Permohonan bantuan perubatan (Feb 2026)
- Sesi triage: Skor 95 (P1 — Kritikal)
- Saluran keutamaan: WhatsApp

## Keutamaan
- Keutamaan komunikasi: WhatsApp pada waktu pagi
- Bahasa: Bahasa Melayu
- Perlu pendekatan lembut dan empati`

export default function AgentMemoryPage() {
  const [loading, setLoading] = useState(true)
  const [memories, setMemories] = useState<MemoryRecord[]>([])
  const [search, setSearch] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('USR-001')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMemory, setNewMemory] = useState({ category: 'peribadi', content: '' })

  useEffect(() => {
    const timer = setTimeout(() => {
      setMemories(mockMemories)
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const filteredMemories = memories.filter(m =>
    m.userId === selectedUserId &&
    (search === '' || m.content.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase()))
  )

  const handleAddMemory = () => {
    if (!newMemory.content) { toast.error('Sila isi kandungan memori'); return }
    const mem: MemoryRecord = {
      id: String(Date.now()), userId: selectedUserId, userName: memories.find(m => m.userId === selectedUserId)?.userName || 'Pengguna',
      category: newMemory.category, content: newMemory.content, confidence: 50, accessCount: 0,
      source: 'manual', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
    setMemories(prev => [mem, ...prev])
    setNewMemory({ category: 'peribadi', content: '' })
    setShowAddForm(false)
    toast.success('Memori berjaya ditambah')
  }

  const handleDeleteMemory = (id: string) => {
    if (!confirm('Pasti mahu memadam memori ini?')) return
    setMemories(prev => prev.filter(m => m.id !== id))
    toast.success('Memori berjaya dipadam')
  }

  const handleForgetMe = () => {
    if (!confirm('AMARAN: Ini akan memadam SEMUA memori pengguna ini. Tindakan ini tidak boleh dibatalkan. Teruskan?')) return
    setMemories(prev => prev.filter(m => m.userId !== selectedUserId))
    toast.success('Semua memori pengguna telah dipadam (PDPA compliance)')
  }

  const uniqueUsers = Array.from(new Set(memories.map(m => m.userId))).map(uid => {
    const m = memories.find(mem => mem.userId === uid)
    return { id: uid, name: m?.userName || uid }
  })

  if (loading) return (
    <div className="space-y-4 p-6">
      <div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-96 rounded-xl" /><Skeleton className="h-96 rounded-xl" /></div>
    </div>
  )

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: '#4B008215' }}>
          <Brain className="h-5 w-5" style={{ color: '#4B0082' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Memori Ejen</h1>
          <p className="text-sm text-muted-foreground">Pengurusan memori kontekstual ejen AI</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Memory Context */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Konteks Memori (MEMORY.md)</CardTitle>
                <Badge variant="outline" className="text-[10px]">Auto-dijana</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-3">
                <Label className="text-sm">Pengguna:</Label>
                <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="h-8 rounded-md border bg-background px-2 text-sm">
                  {uniqueUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <ScrollArea className="rounded-lg border p-4 bg-muted/30" style={{ maxHeight: '480px' }}>
                <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed">{mockMemoryContext}</pre>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm font-medium">Lupa Saya (PDPA)</p>
                    <p className="text-[10px] text-muted-foreground">Padam semua memori pengguna ini</p>
                  </div>
                </div>
                <Button variant="destructive" size="sm" onClick={handleForgetMe}>Lupa Saya</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Memory Records */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Cari memori…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Button size="sm" className="gap-1.5" style={{ backgroundColor: '#4B0082' }} onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-3.5 w-3.5" /> Tambah
            </Button>
          </div>

          {showAddForm && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <select value={newMemory.category} onChange={e => setNewMemory(p => ({ ...p, category: e.target.value }))} className="h-9 w-full rounded-md border bg-background px-3 text-sm">
                  <option value="peribadi">Peribadi</option>
                  <option value="kewangan">Kewangan</option>
                  <option value="kesihatan">Kesihatan</option>
                  <option value="keluarga">Keluarga</option>
                  <option value="pekerjaan">Pekerjaan</option>
                  <option value="pendidikan">Pendidikan</option>
                  <option value="preferensi">Preferensi</option>
                </select>
                <Input placeholder="Kandungan memori…" value={newMemory.content} onChange={e => setNewMemory(p => ({ ...p, content: e.target.value }))} />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddMemory} style={{ backgroundColor: '#4B0082' }}>Simpan</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>Batal</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {filteredMemories.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Tiada rekod memori</p>
              </div>
            ) : filteredMemories.map(mem => (
              <Card key={mem.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={categoryColors[mem.category] || 'bg-gray-100 text-gray-700'}>{mem.category}</Badge>
                      <Badge variant="outline" className="text-[10px]">{mem.source}</Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" onClick={() => handleDeleteMemory(mem.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <p className="text-sm mb-3">{mem.content}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <span>Keyakinan:</span>
                        <Progress value={mem.confidence} className="h-1.5 w-16" />
                        <span className="font-medium">{mem.confidence}%</span>
                      </div>
                      <span>• Akses: {mem.accessCount}×</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(mem.updatedAt).toLocaleDateString('ms-MY')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <label className={cn('text-sm font-medium', className)}>{children}</label>
}
