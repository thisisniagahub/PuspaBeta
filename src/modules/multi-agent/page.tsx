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
import { Slider } from '@/components/ui/slider'
import { LayoutGrid, Settings, GitBranch, Bot, Wifi, MessageSquare, Smartphone, Mail, Brain, Wrench, Activity, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Agent {
  id: string
  name: string
  displayName: string
  role: string
  model: string
  channels: string[]
  skills: string[]
  status: 'active' | 'inactive' | 'error'
  sessionCount: number
  skillsCount: number
  memoryEnabled: boolean
  temperature: number
  systemPrompt: string
}

const channelIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  whatsapp: Smartphone,
  telegram: MessageSquare,
  web: LayoutGrid,
  email: Mail,
}

const channelColors: Record<string, string> = {
  whatsapp: 'bg-green-100 text-green-700',
  telegram: 'bg-blue-100 text-blue-700',
  web: 'bg-primary/10 text-primary',
  email: 'bg-amber-100 text-amber-700',
}

const statusColors: Record<string, string> = {
  active: 'bg-green-500',
  inactive: 'bg-gray-400',
  error: 'bg-red-500',
}

const mockAgents: Agent[] = [
  { id: '1', name: 'kewangan', displayName: 'Ejen Kewangan', role: 'Menguruskan pertanyaan kewangan, zakat, dan donasi', model: 'gpt-4o-mini', channels: ['whatsapp', 'web'], skills: ['zakat-calculator', 'pdf-generator', 'audit-logger'], status: 'active', sessionCount: 145, skillsCount: 3, memoryEnabled: true, temperature: 0.3, systemPrompt: 'Anda adalah ejen kewangan PUSPA. Bantu asnaf dengan pertanyaan zakat, donasi, dan hal kewangan.' },
  { id: '2', name: 'operasi', displayName: 'Ejen Operasi', role: 'Menguruskan operasi harian, kes, dan pembayaran', model: 'gpt-4o-mini', channels: ['whatsapp', 'telegram', 'web'], skills: ['whatsapp-channel', 'data-analyzer', 'pdf-generator'], status: 'active', sessionCount: 230, skillsCount: 3, memoryEnabled: true, temperature: 0.4, systemPrompt: 'Anda adalah ejen operasi PUSPA. Uruskan kes bantuan, pembayaran, dan tugasan operasi.' },
  { id: '3', name: 'compliance', displayName: 'Ejen Compliance', role: 'Memantau pematuhan dan audit', model: 'gpt-4o', channels: ['web', 'email'], skills: ['audit-logger', 'data-analyzer'], status: 'active', sessionCount: 56, skillsCount: 2, memoryEnabled: false, temperature: 0.1, systemPrompt: 'Anda adalah ejen compliance PUSPA. Pastikan semua operasi mematuhi peraturan dan garis panduan.' },
  { id: '4', name: 'asnaf', displayName: 'Ejen Asnaf', role: 'Membantu asnaf dengan pendaftaran dan onboarding', model: 'gpt-4o-mini', channels: ['whatsapp', 'telegram', 'web'], skills: ['whatsapp-channel', 'pdf-generator', 'zakat-calculator'], status: 'active', sessionCount: 312, skillsCount: 3, memoryEnabled: true, temperature: 0.5, systemPrompt: 'Anda adalah ejen asnaf PUSPA. Bantu asnaf mendaftar, onboarding, dan menjawab soalan mereka.' },
]

const routingData = [
  { channel: 'WhatsApp', agents: ['asnaf', 'operasi', 'kewangan'] },
  { channel: 'Telegram', agents: ['asnaf', 'operasi'] },
  { channel: 'Web Chat', agents: ['asnaf', 'operasi', 'kewangan', 'compliance'] },
  { channel: 'E-mel', agents: ['compliance', 'kewangan'] },
]

export default function MultiAgentPage() {
  const [loading, setLoading] = useState(true)
  const [agents, setAgents] = useState<Agent[]>([])
  const [activeTab, setActiveTab] = useState('active')
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [form, setForm] = useState({
    name: '', displayName: '', role: '', model: 'gpt-4o-mini', channels: [] as string[],
    skills: '', memoryEnabled: true, temperature: 0.4, systemPrompt: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAgents(mockAgents)
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent)
    setForm({
      name: agent.name, displayName: agent.displayName, role: agent.role, model: agent.model,
      channels: agent.channels, skills: agent.skills.join(', '), memoryEnabled: agent.memoryEnabled,
      temperature: agent.temperature, systemPrompt: agent.systemPrompt,
    })
    setActiveTab('config')
  }

  const handleSaveAgent = async () => {
    if (!form.name || !form.displayName) { toast.error('Sila isi nama ejen'); return }
    setSaving(true)
    try {
      await new Promise(r => setTimeout(r, 600))
      if (editingAgent) {
        setAgents(prev => prev.map(a => a.id === editingAgent.id ? {
          ...a, name: form.name, displayName: form.displayName, role: form.role,
          model: form.model, channels: form.channels, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
          memoryEnabled: form.memoryEnabled, temperature: form.temperature, systemPrompt: form.systemPrompt,
        } : a))
        toast.success('Ejen berjaya dikemas kini')
      } else {
        const newAgent: Agent = {
          id: String(Date.now()), name: form.name, displayName: form.displayName, role: form.role,
          model: form.model, channels: form.channels, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
          status: 'active', sessionCount: 0, skillsCount: form.skills.split(',').filter(Boolean).length,
          memoryEnabled: form.memoryEnabled, temperature: form.temperature, systemPrompt: form.systemPrompt,
        }
        setAgents(prev => [...prev, newAgent])
        toast.success('Ejen berjaya ditambah')
      }
      setEditingAgent(null)
      setForm({ name: '', displayName: '', role: '', model: 'gpt-4o-mini', channels: [], skills: '', memoryEnabled: true, temperature: 0.4, systemPrompt: '' })
      setActiveTab('active')
    } catch { toast.error('Gagal menyimpan ejen') } finally { setSaving(false) }
  }

  const toggleChannel = (ch: string) => {
    setForm(prev => ({
      ...prev,
      channels: prev.channels.includes(ch) ? prev.channels.filter(c => c !== ch) : [...prev.channels, ch]
    }))
  }

  if (loading) return (
    <div className="space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
    </div>
  )

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-muted">
          <LayoutGrid className="h-5 w-5 text-brand" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Berbilang Ejen</h1>
          <p className="text-sm text-muted-foreground">Pengurusan ejen AI berbilang peranan</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Ejen Aktif</TabsTrigger>
          <TabsTrigger value="config">Konfigurasi</TabsTrigger>
          <TabsTrigger value="routing">Routing</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {agents.map(agent => (
              <Card key={agent.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-muted">
                          <Bot className="h-6 w-6 text-brand" />
                        </div>
                        <div className={cn('absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white', statusColors[agent.status])} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{agent.displayName}</h3>
                        <p className="text-[10px] text-muted-foreground font-mono">@{agent.name} • {agent.model}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleEditAgent(agent)} className="gap-1 text-xs">
                      <Settings className="h-3 w-3" /> Konfig
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{agent.role}</p>
                  <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                    {agent.channels.map(ch => {
                      const ChIcon = channelIcons[ch] || MessageSquare
                      return <Badge key={ch} className={cn(channelColors[ch], 'gap-0.5 text-[10px]')}><ChIcon className="h-2.5 w-2.5" />{ch}</Badge>
                    })}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Activity className="h-3 w-3" />{agent.sessionCount} sesi</span>
                      <span className="flex items-center gap-1"><Wrench className="h-3 w-3" />{agent.skillsCount} kemahiran</span>
                      {agent.memoryEnabled && <span className="flex items-center gap-1"><Brain className="h-3 w-3" />Memori</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="config" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{editingAgent ? 'Edit Ejen' : 'Tambah Ejen Baharu'}</CardTitle>
              <CardDescription>Konfigurasi ejen AI dengan peranan dan kemahiran</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label>Nama Ejen</Label><Input placeholder="cth: kewangan" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
                <div className="grid gap-2"><Label>Nama Paparan</Label><Input placeholder="cth: Ejen Kewangan" value={form.displayName} onChange={e => setForm(p => ({ ...p, displayName: e.target.value }))} /></div>
              </div>
              <div className="grid gap-2"><Label>Peranan</Label><Input placeholder="Penerangan peranan ejen" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Model</Label>
                  <Select value={form.model} onValueChange={v => setForm(p => ({ ...p, model: v }))}>
                    <SelectTrigger /><SelectContent>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Suhu (Temperature): {form.temperature}</Label>
                  <Slider value={[form.temperature]} onValueChange={v => setForm(p => ({ ...p, temperature: v[0] }))} min={0} max={1} step={0.1} className="mt-2" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Saluran</Label>
                <div className="flex gap-2 flex-wrap">
                  {['whatsapp', 'telegram', 'web', 'email'].map(ch => (
                    <Button key={ch} variant={form.channels.includes(ch) ? 'default' : 'outline'} size="sm" onClick={() => toggleChannel(ch)} className={cn("gap-1.5 text-xs", form.channels.includes(ch) && "bg-brand")}>
                      {ch}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid gap-2"><Label>Kemahiran (dipisah koma)</Label><Input placeholder="cth: zakat-calculator, pdf-generator" value={form.skills} onChange={e => setForm(p => ({ ...p, skills: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>Arahan Sistem (System Prompt)</Label><Textarea placeholder="Arahan untuk ejen AI…" rows={4} value={form.systemPrompt} onChange={e => setForm(p => ({ ...p, systemPrompt: e.target.value }))} /></div>
              <div className="flex items-center gap-3">
                <Switch checked={form.memoryEnabled} onCheckedChange={v => setForm(p => ({ ...p, memoryEnabled: v }))} />
                <Label>Aktifkan Memori Ejen</Label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveAgent} disabled={saving} className="bg-brand">
                  {saving ? 'Menyimpan…' : editingAgent ? 'Kemas Kini Ejen' : 'Tambah Ejen'}
                </Button>
                {editingAgent && (
                  <Button variant="outline" onClick={() => { setEditingAgent(null); setForm({ name: '', displayName: '', role: '', model: 'gpt-4o-mini', channels: [], skills: '', memoryEnabled: true, temperature: 0.4, systemPrompt: '' }); setActiveTab('active') }}>Batal</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routing" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Routing Saluran → Ejen</CardTitle>
              <CardDescription>Saluran mana disambung ke ejen mana</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {routingData.map(route => (
                  <div key={route.channel} className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 mb-3">
                      {route.channel === 'WhatsApp' && <Smartphone className="h-4 w-4 text-green-600" />}
                      {route.channel === 'Telegram' && <MessageSquare className="h-4 w-4 text-blue-600" />}
                      {route.channel === 'Web Chat' && <LayoutGrid className="h-4 w-4 text-primary" />}
                      {route.channel === 'E-mel' && <Mail className="h-4 w-4 text-amber-600" />}
                      <span className="font-semibold text-sm">{route.channel}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      {route.agents.map(agentName => {
                        const agent = agents.find(a => a.name === agentName)
                        return (
                          <Badge key={agentName} className="gap-1 bg-brand-muted text-brand">
                            <Bot className="h-3 w-3" /> {agent?.displayName || agentName}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Komunikasi Ejen-ke-Ejen</CardTitle>
              <CardDescription>Aliran komunikasi antara ejen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="gap-1 bg-brand-muted text-brand"><Bot className="h-3 w-3" /> Asnaf</Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Badge className="gap-1 bg-brand-muted text-brand"><Bot className="h-3 w-3" /> Operasi</Badge>
                  <span className="text-xs text-muted-foreground">— Hantar kes untuk pemprosesan</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="gap-1 bg-brand-muted text-brand"><Bot className="h-3 w-3" /> Operasi</Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Badge className="gap-1 bg-brand-muted text-brand"><Bot className="h-3 w-3" /> Kewangan</Badge>
                  <span className="text-xs text-muted-foreground">— Rujuk hal kewangan</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="gap-1 bg-brand-muted text-brand"><Bot className="h-3 w-3" /> Kewangan</Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Badge className="gap-1 bg-brand-muted text-brand"><Bot className="h-3 w-3" /> Compliance</Badge>
                  <span className="text-xs text-muted-foreground">— Semak pematuhan</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="gap-1 bg-brand-muted text-brand"><Bot className="h-3 w-3" /> Compliance</Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Badge className="gap-1 bg-brand-muted text-brand"><Bot className="h-3 w-3" /> Operasi</Badge>
                  <span className="text-xs text-muted-foreground">— Laporkan isu</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
