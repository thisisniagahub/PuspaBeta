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
import { Package, Search, Download, Star, ToggleLeft, Grid3X3, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Skill {
  id: string
  name: string
  description: string
  version: string
  category: string
  author: string
  rating: number
  installed: boolean
  enabled: boolean
  icon: string
}

interface SkillCategory {
  id: string
  name: string
  description: string
  icon: string
  count: number
  color: string
}

const categoryColors: Record<string, string> = {
  Communication: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  Productivity: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  Data: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
  Finance: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  Security: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
}

const mockInstalled: Skill[] = [
  { id: '1', name: 'WhatsApp Channel', description: 'Hantar dan terima mesej WhatsApp melalui OpenClaw', version: '2.4.1', category: 'Communication', author: 'OpenClaw', rating: 4.8, installed: true, enabled: true, icon: '💬' },
  { id: '2', name: 'Zakat Calculator', description: 'Pengiraan zakat automatik berdasarkan harta dan pendapatan', version: '1.2.0', category: 'Finance', author: 'PUSPA Dev', rating: 4.5, installed: true, enabled: true, icon: '🧮' },
  { id: '3', name: 'PDF Generator', description: 'Jana dokumen PDF seperti resit, sijil, dan laporan', version: '3.1.0', category: 'Productivity', author: 'OpenClaw', rating: 4.7, installed: true, enabled: false, icon: '📄' },
  { id: '4', name: 'Data Analyzer', description: 'Analisis data penderma dan penerima bantuan', version: '1.0.3', category: 'Data', author: 'DataLab', rating: 4.2, installed: true, enabled: true, icon: '📊' },
  { id: '5', name: 'Audit Logger', description: 'Log audit trail untuk semua transaksi kewangan', version: '1.5.2', category: 'Security', author: 'SecureOps', rating: 4.6, installed: true, enabled: true, icon: '🔒' },
]

const mockMarketplace: Skill[] = [
  { id: '6', name: 'Telegram Bot', description: 'Integrasi bot Telegram untuk notifikasi dan interaksi', version: '2.1.0', category: 'Communication', author: 'OpenClaw', rating: 4.6, installed: false, enabled: false, icon: '✈️' },
  { id: '7', name: 'Email Templates', description: 'Template e-mel profesional untuk komunikasi NGO', version: '1.3.1', category: 'Communication', author: 'MailCraft', rating: 4.3, installed: false, enabled: false, icon: '📧' },
  { id: '8', name: 'Scheduling Engine', description: 'Penjadualan automatik temujanji dan program', version: '2.0.0', category: 'Productivity', author: 'SchedulePro', rating: 4.9, installed: false, enabled: false, icon: '📅' },
  { id: '9', name: 'Report Builder', description: 'Bina laporan kustom dengan visualisasi carta', version: '1.7.0', category: 'Data', author: 'ReportLab', rating: 4.4, installed: false, enabled: false, icon: '📈' },
  { id: '10', name: 'Budget Planner', description: 'Perancangan bajet dan unjuran kewangan', version: '1.1.2', category: 'Finance', author: 'FinTools', rating: 4.1, installed: false, enabled: false, icon: '💰' },
  { id: '11', name: 'KYC Verifier', description: 'Pengesahan identiti digital untuk eKYC', version: '1.0.0', category: 'Security', author: 'IDSecure', rating: 4.7, installed: false, enabled: false, icon: '🪪' },
  { id: '12', name: 'SMS Gateway', description: 'Hantar SMS pemberitahuan secara automatik', version: '1.4.0', category: 'Communication', author: 'MsgFlow', rating: 4.0, installed: false, enabled: false, icon: '📱' },
  { id: '13', name: 'Form Builder', description: 'Cipta borang digital untuk pendaftaran dan survei', version: '2.2.0', category: 'Productivity', author: 'FormCraft', rating: 4.5, installed: false, enabled: false, icon: '📝' },
]

const mockCategories: SkillCategory[] = [
  { id: 'communication', name: 'Communication', description: 'Saluran komunikasi dan integrasi mesej', icon: '💬', count: 4, color: '#059669' },
  { id: 'productivity', name: 'Productivity', description: 'Automasi dan peningkatan produktiviti', icon: '⚡', count: 3, color: '#2563eb' },
  { id: 'data', name: 'Data', description: 'Analisis data dan visualisasi', icon: '📊', count: 2, color: '#4B0082' },
  { id: 'finance', name: 'Finance', description: 'Pengurusan kewangan dan perakaunan', icon: '💰', count: 2, color: '#d97706' },
  { id: 'security', name: 'Security', description: 'Keselamatan dan pengesahan', icon: '🔒', count: 2, color: '#dc2626' },
]

export default function SkillsPage() {
  const [loading, setLoading] = useState(true)
  const [installed, setInstalled] = useState<Skill[]>([])
  const [marketplace, setMarketplace] = useState<Skill[]>([])
  const [categories, setCategories] = useState<SkillCategory[]>([])
  const [activeTab, setActiveTab] = useState('installed')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    const timer = setTimeout(() => {
      setInstalled(mockInstalled)
      setMarketplace(mockMarketplace)
      setCategories(mockCategories)
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const toggleSkill = (id: string) => {
    let wasEnabled = false
    let skillName = ''
    setInstalled(prev => {
      const updated = prev.map(s => {
        if (s.id === id) {
          wasEnabled = s.enabled
          skillName = s.name
          return { ...s, enabled: !s.enabled }
        }
        return s
      })
      return updated
    })
    toast.success(wasEnabled ? `"${skillName}" dinyahaktifkan` : `"${skillName}" diaktifkan`)
  }

  const installSkill = (id: string) => {
    const skill = marketplace.find(s => s.id === id)
    if (!skill) return
    setInstalled(prev => [...prev, { ...skill, installed: true, enabled: true }])
    setMarketplace(prev => prev.map(s => s.id === id ? { ...s, installed: true } : s))
    toast.success(`"${skill.name}" berjaya dipasang`)
  }

  const filteredMarketplace = marketplace.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === 'all' || s.category === categoryFilter
    return matchSearch && matchCategory
  })

  if (loading) return (
    <div className="space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
    </div>
  )

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: '#4B008215' }}>
          <Package className="h-5 w-5" style={{ color: '#4B0082' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Pasar Kemahiran</h1>
          <p className="text-sm text-muted-foreground">Pasang dan urus kemahiran AI untuk platform PUSPA</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="installed">Dipasang</TabsTrigger>
          <TabsTrigger value="marketplace">Pasar ClawHub</TabsTrigger>
          <TabsTrigger value="categories">Kategori</TabsTrigger>
        </TabsList>

        <TabsContent value="installed" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {installed.map(skill => (
              <Card key={skill.id} className={cn(!skill.enabled && 'opacity-60')}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{skill.icon}</span>
                      <div>
                        <h3 className="font-semibold text-sm">{skill.name}</h3>
                        <p className="text-[10px] text-muted-foreground">v{skill.version} • {skill.author}</p>
                      </div>
                    </div>
                    <Switch checked={skill.enabled} onCheckedChange={() => toggleSkill(skill.id)} />
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{skill.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge className={categoryColors[skill.category] || 'bg-gray-100 text-gray-700'}>{skill.category}</Badge>
                    <div className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-medium">{skill.rating}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="marketplace" className="mt-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Cari kemahiran…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm">
              <option value="all">Semua Kategori</option>
              <option value="Communication">Communication</option>
              <option value="Productivity">Productivity</option>
              <option value="Data">Data</option>
              <option value="Finance">Finance</option>
              <option value="Security">Security</option>
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMarketplace.map(skill => (
              <Card key={skill.id}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-2.5 mb-3">
                    <span className="text-2xl">{skill.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">{skill.name}</h3>
                      <p className="text-[10px] text-muted-foreground">oleh {skill.author} • v{skill.version}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{skill.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={categoryColors[skill.category] || 'bg-gray-100 text-gray-700'}>{skill.category}</Badge>
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs">{skill.rating}</span>
                      </div>
                    </div>
                    <Button size="sm" variant={skill.installed ? 'secondary' : 'default'} disabled={skill.installed} onClick={() => installSkill(skill.id)} className="gap-1.5 text-xs" style={!skill.installed ? { backgroundColor: '#4B0082' } : {}}>
                      {skill.installed ? <><Check className="h-3 w-3" /> Dipasang</> : <><Download className="h-3 w-3" /> Pasang</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map(cat => (
              <Card key={cat.id}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl" style={{ backgroundColor: `${cat.color}15` }}>
                      {cat.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{cat.name}</h3>
                      <p className="text-sm text-muted-foreground">{cat.count} kemahiran</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{cat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Check({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
