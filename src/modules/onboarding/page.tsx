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
import { UserPlus, Send, CheckCircle2, Clock, Bot, ChevronRight, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OnboardingSession {
  id: string
  name: string
  ic: string
  phone: string
  category: string
  step: number
  totalSteps: number
  status: string
  createdAt: string
}

interface ChatMessage {
  id: string
  role: 'bot' | 'user'
  content: string
  timestamp: string
}

const stepLabels = ['Nama', 'No. KP', 'No. Telefon', 'Kategori', 'Pendapatan', 'Tanggungan', 'Sahkan']

const mockSessions: OnboardingSession[] = [
  { id: '1', name: 'Ahmad bin Ali', ic: '850101-01-5123', phone: '+60123456789', category: 'fakir', step: 7, totalSteps: 7, status: 'selesai', createdAt: '2026-03-04T08:00:00Z' },
  { id: '2', name: 'Siti binti Hassan', ic: '900215-10-5521', phone: '+60198765432', category: 'miskin', step: 5, totalSteps: 7, status: 'dalam_proses', createdAt: '2026-03-04T09:30:00Z' },
  { id: '3', name: 'Mohd Rizal', ic: '880630-14-5231', phone: '+60112233445', category: 'gharimin', step: 3, totalSteps: 7, status: 'dalam_proses', createdAt: '2026-03-04T10:15:00Z' },
  { id: '4', name: 'Aminah bt Abdullah', ic: '920412-06-5042', phone: '+60155667788', category: 'riqab', step: 7, totalSteps: 7, status: 'selesai', createdAt: '2026-03-04T11:00:00Z' },
  { id: '5', name: 'Faridah bt Ismail', ic: '950723-02-5180', phone: '+60188990011', category: 'fakir', step: 1, totalSteps: 7, status: 'baru', createdAt: '2026-03-04T13:00:00Z' },
]

const statusColor: Record<string, string> = {
  selesai: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  dalam_proses: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  baru: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  ditinggalkan: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
}

export default function OnboardingPage() {
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<OnboardingSession[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [userInput, setUserInput] = useState('')
  const [formData, setFormData] = useState({ name: '', ic: '', phone: '', category: '', income: '', dependents: '' })
  const [activeSession, setActiveSession] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSessions(mockSessions)
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const startNewSession = () => {
    setActiveSession(true)
    setCurrentStep(0)
    setFormData({ name: '', ic: '', phone: '', category: '', income: '', dependents: '' })
    setChatMessages([
      { id: '1', role: 'bot', content: 'Selamat datang ke PUSPA! Saya akan membantu anda mendaftar sebagai penerima bantuan. Boleh berikan nama penuh anda?', timestamp: new Date().toISOString() }
    ])
  }

  const handleSendMessage = () => {
    if (!userInput.trim()) return
    const newMsg: ChatMessage = { id: String(Date.now()), role: 'user', content: userInput, timestamp: new Date().toISOString() }
    setChatMessages(prev => [...prev, newMsg])

    const step = currentStep
    const input = userInput
    setUserInput('')

    if (step === 0) setFormData(p => ({ ...p, name: input }))
    else if (step === 1) setFormData(p => ({ ...p, ic: input }))
    else if (step === 2) setFormData(p => ({ ...p, phone: input }))
    else if (step === 3) setFormData(p => ({ ...p, category: input }))
    else if (step === 4) setFormData(p => ({ ...p, income: input }))
    else if (step === 5) setFormData(p => ({ ...p, dependents: input }))

    const nextStep = step + 1
    setCurrentStep(nextStep)

    setTimeout(() => {
      let botMsg = ''
      if (nextStep === 1) botMsg = `Terima kasih, ${input}. Sila masukkan No. Kad Pengenalan anda (format: YYMMDD-XX-XXXX).`
      else if (nextStep === 2) botMsg = 'Terima kasih. Sekarang, sila masukkan No. Telefon anda.'
      else if (nextStep === 3) botMsg = 'Baik. Sila pilih kategori asnaf anda: Fakir, Miskin, Amil, Gharimin, Riqab, Gharim, Fisabilillah, Ibnu Sabil.'
      else if (nextStep === 4) botMsg = 'Terima kasih. Apakah pendapatan bulanan isi rumah anda (RM)?'
      else if (nextStep === 5) botMsg = 'Berapa orang tanggungan dalam isi rumah anda?'
      else if (nextStep === 6) {
        botMsg = `Sila sahkan maklumat anda:\n\nNama: ${formData.name || input}\nNo. KP: ${formData.ic}\nTelefon: ${formData.phone}\nKategori: ${formData.category}\nPendapatan: RM${formData.income}\nTanggungan: ${formData.dependents || input}\n\nTaip "sah" untuk mengesahkan.`
      } else if (nextStep === 7) {
        botMsg = 'Pendaftaran berjaya! Maklumat anda telah disimpan. Pasukan PUSPA akan menghubungi anda tidak lama lagi. Terima kasih.'
        const newSession: OnboardingSession = {
          id: String(Date.now()), name: formData.name, ic: formData.ic, phone: formData.phone,
          category: formData.category, step: 7, totalSteps: 7, status: 'selesai', createdAt: new Date().toISOString()
        }
        setSessions(prev => [newSession, ...prev])
        toast.success('Sesi onboarding selesai!')
      }
      setChatMessages(prev => [...prev, { id: String(Date.now() + 1), role: 'bot', content: botMsg, timestamp: new Date().toISOString() }])
    }, 500)
  }

  if (loading) return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-24 rounded-xl" />
      <div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-96 rounded-xl" /><Skeleton className="h-96 rounded-xl" /></div>
    </div>
  )

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: '#4B008215' }}>
            <UserPlus className="h-5 w-5" style={{ color: '#4B0082' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Onboarding</h1>
            <p className="text-sm text-muted-foreground">Pendaftaran asnaf melalui sembang pintar</p>
          </div>
        </div>
        <Button onClick={startNewSession} className="gap-2" style={{ backgroundColor: '#4B0082' }}>
          <UserPlus className="h-4 w-4" /> Mulakan Sesi Baharu
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Chat Widget */}
        <div className="lg:col-span-3 space-y-4">
          {/* Step Progress */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Kemajuan Pendaftaran</span>
                <span className="text-xs text-muted-foreground">Langkah {Math.min(currentStep + 1, 7)} / 7</span>
              </div>
              <div className="flex gap-1.5">
                {stepLabels.map((label, idx) => (
                  <div key={label} className="flex-1 flex flex-col items-center gap-1">
                    <div className={cn(
                      'h-2 w-full rounded-full transition-all',
                      idx < currentStep ? 'bg-green-500' : idx === currentStep ? 'bg-primary' : 'bg-muted'
                    )} style={idx < currentStep ? { backgroundColor: '#059669' } : idx === currentStep ? { backgroundColor: '#4B0082' } : {}} />
                    <span className={cn('text-[9px] text-center', idx <= currentStep ? 'text-foreground font-medium' : 'text-muted-foreground')}>{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat */}
          <Card className="flex flex-col" style={{ minHeight: '400px' }}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" style={{ color: '#4B0082' }} />
                <CardTitle className="text-base">Ejen Onboarding</CardTitle>
                <Badge className="bg-green-100 text-green-700 text-[10px]">Aktif</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 mb-4" style={{ maxHeight: '320px' }}>
                <div className="space-y-3 pr-4">
                  {chatMessages.length === 0 && !activeSession && (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Klik &quot;Mulakan Sesi Baharu&quot; untuk mula</p>
                    </div>
                  )}
                  {chatMessages.map(msg => (
                    <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                      <div className={cn(
                        'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                        msg.role === 'user'
                          ? 'text-white'
                          : 'bg-muted text-foreground'
                      )} style={msg.role === 'user' ? { backgroundColor: '#4B0082' } : {}}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-[10px] mt-1 opacity-70">{new Date(msg.timestamp).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              {activeSession && currentStep < 7 && (
                <div className="flex gap-2">
                  <Input
                    placeholder={currentStep === 0 ? 'Masukkan nama…' : currentStep === 6 ? 'Taip "sah" untuk mengesahkan' : 'Taip jawapan…'}
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} size="icon" style={{ backgroundColor: '#4B0082' }}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Session List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Sesi Onboarding</CardTitle><CardDescription>Senarai sesi pendaftaran</CardDescription></CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {sessions.map(s => (
                  <div key={s.id} className="rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.ic}</p>
                      </div>
                      <Badge className={statusColor[s.status]}>{s.status.replace('_', ' ')}</Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{s.category}</Badge>
                        <span className="text-xs text-muted-foreground">Langkah {s.step}/{s.totalSteps}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{new Date(s.createdAt).toLocaleDateString('ms-MY')}</span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${(s.step / s.totalSteps) * 100}%`, backgroundColor: s.status === 'selesai' ? '#059669' : '#4B0082' }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader><CardTitle className="text-base">Ringkasan</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /><span className="text-sm">Selesai</span></div>
                  <span className="font-bold">{sessions.filter(s => s.status === 'selesai').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-blue-600" /><span className="text-sm">Dalam Proses</span></div>
                  <span className="font-bold">{sessions.filter(s => s.status === 'dalam_proses').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><UserPlus className="h-4 w-4 text-yellow-600" /><span className="text-sm">Baru</span></div>
                  <span className="font-bold">{sessions.filter(s => s.status === 'baru').length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
