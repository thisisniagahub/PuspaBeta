'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { TrendingUp, TrendingDown, AlertTriangle, BarChart3, History, Target, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts'

interface ForecastData {
  month: string
  actual: number | null
  predicted: number | null
}

interface AllocationItem {
  category: string
  current: number
  recommended: number
  change: number
}

interface PredictionRecord {
  id: string
  type: string
  predicted: number
  actual: number
  accuracy: number
  date: string
}

const mockForecast: ForecastData[] = [
  { month: 'Sep', actual: 45, predicted: null },
  { month: 'Okt', actual: 52, predicted: null },
  { month: 'Nov', actual: 48, predicted: null },
  { month: 'Dis', actual: 63, predicted: null },
  { month: 'Jan', actual: 58, predicted: null },
  { month: 'Feb', actual: 55, predicted: null },
  { month: 'Mac', actual: null, predicted: 62 },
  { month: 'Apr', actual: null, predicted: 68 },
  { month: 'Mei', actual: null, predicted: 71 },
  { month: 'Jun', actual: null, predicted: 65 },
]

const mockAllocations: AllocationItem[] = [
  { category: 'Zakat — Fakir', current: 45000, recommended: 52000, change: 7000 },
  { category: 'Zakat — Miskin', current: 38000, recommended: 41000, change: 3000 },
  { category: 'Zakat — Amil', current: 12000, recommended: 11000, change: -1000 },
  { category: 'Zakat — Gharimin', current: 8000, recommended: 12500, change: 4500 },
  { category: 'Sadaqah', current: 25000, recommended: 28000, change: 3000 },
  { category: 'Wakaf', current: 30000, recommended: 35000, change: 5000 },
  { category: 'Infak', current: 15000, recommended: 14000, change: -1000 },
]

const mockPredictions: PredictionRecord[] = [
  { id: '1', type: 'kes_baharu', predicted: 62, actual: 58, accuracy: 93.5, date: '2026-02-28' },
  { id: '2', type: 'dana_diperlukan', predicted: 185000, actual: 192000, accuracy: 96.4, date: '2026-02-28' },
  { id: '3', type: 'kes_baharu', predicted: 55, actual: 52, accuracy: 94.5, date: '2026-01-31' },
  { id: '4', type: 'dana_diperlukan', predicted: 175000, actual: 168000, accuracy: 95.8, date: '2026-01-31' },
  { id: '5', type: 'kes_baharu', predicted: 48, actual: 48, accuracy: 100, date: '2025-12-31' },
  { id: '6', type: 'dana_diperlukan', predicted: 160000, actual: 155000, accuracy: 96.8, date: '2025-12-31' },
]

function fmtCurrency(n: number) { return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 0 }).format(n) }

export default function PredictivePage() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('forecast')

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const predictedCases = 68
  const fundRequired = 198500
  const fundAvailable = 173000
  const shortfall = fundRequired - fundAvailable

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
          <BarChart3 className="h-5 w-5 text-brand" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Analisis Ramalan</h1>
          <p className="text-sm text-muted-foreground">Ramalan permintaan dan optimasi agihan dana</p>
        </div>
      </div>

      {shortfall > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Amaran Defisit Dana</AlertTitle>
          <AlertDescription>Ramalan menunjukkan defisit dana sebanyak {fmtCurrency(shortfall)} untuk bulan hadapan. Sila rancang pengumpulan dana tambahan.</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="forecast">Ramalan Permintaan</TabsTrigger>
          <TabsTrigger value="allocation">Optimasi Agihan</TabsTrigger>
          <TabsTrigger value="history">Sejarah</TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: 'Kes Diramal (Bulan Depan)', value: predictedCases, icon: TrendingUp, color: 'var(--brand)', bgColor: 'var(--brand-muted)', trend: '+12%' },
              { label: 'Dana Diperlukan', value: fmtCurrency(fundRequired), icon: Target, color: '#d97706', trend: '+8%' },
              { label: 'Defisit Dana', value: fmtCurrency(shortfall), icon: TrendingDown, color: '#dc2626', trend: '-5%' },
              { label: 'Tahap Keyakinan', value: '94.2%', icon: BarChart3, color: '#059669', trend: '+2.1%' },
            ].map(s => (
              <Card key={s.label}><CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: s.bgColor || `${s.color}15` }}><s.icon className="h-4.5 w-4.5" style={{ color: s.color }} /></div>
                  <Badge variant="outline" className="text-[10px] ml-auto">{s.trend}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold">{s.value}</p>
              </CardContent></Card>
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Trend Kes: Sebenar vs Ramalan</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={mockForecast}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="actual" stroke="var(--brand)" strokeWidth={2} name="Sebenar" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="predicted" stroke="#9333ea" strokeWidth={2} strokeDasharray="5 5" name="Ramalan" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Cadangan Tindakan</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { text: 'Tingkatkan pengumpulan dana zakat sebanyak 15% untuk menampung defisit ramalan', priority: 'high' },
                  { text: 'Aktifkan kempen sadaqah digital untuk meningkatkan sumbangan bulanan', priority: 'high' },
                  { text: 'Optimasi agihan kepada kategori Gharimin yang menunjukkan peningkatan permintaan 56%', priority: 'medium' },
                  { text: 'Jadualkan semula program wakaf Q3 untuk menyelaraskan dengan ketersediaan dana', priority: 'low' },
                ].map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 rounded-lg border p-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white bg-brand">{idx + 1}</div>
                    <div className="flex-1">
                      <p className="text-sm">{rec.text}</p>
                      <Badge variant="outline" className={cn('mt-1 text-[10px]', rec.priority === 'high' ? 'border-red-300 text-red-700' : rec.priority === 'medium' ? 'border-yellow-300 text-yellow-700' : 'border-gray-300 text-gray-700')}>{rec.priority === 'high' ? 'Segera' : rec.priority === 'medium' ? 'Sederhana' : 'Rendah'}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Agihan Semasa vs Cadangan</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={mockAllocations} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="category" className="text-xs" width={120} />
                  <Tooltip formatter={(v: number) => fmtCurrency(v)} />
                  <Legend />
                  <Bar dataKey="current" fill="var(--brand)" name="Semasa" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="recommended" fill="#9333ea" name="Cadangan" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Jadual Perubahan Agihan</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-auto">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Kategori</TableHead><TableHead className="text-right">Semasa</TableHead><TableHead className="text-right">Cadangan</TableHead><TableHead className="text-right">Perubahan</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {mockAllocations.map(a => (
                      <TableRow key={a.category}>
                        <TableCell className="font-medium">{a.category}</TableCell>
                        <TableCell className="text-right">{fmtCurrency(a.current)}</TableCell>
                        <TableCell className="text-right">{fmtCurrency(a.recommended)}</TableCell>
                        <TableCell className="text-right">
                          <span className={cn('font-medium', a.change > 0 ? 'text-green-600' : a.change < 0 ? 'text-red-600' : 'text-gray-600')}>
                            {a.change > 0 ? '+' : ''}{fmtCurrency(a.change)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Sejarah Ramalan</CardTitle><CardDescription>Ketepatan ramalan lepas</CardDescription></CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-auto">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Tarikh</TableHead><TableHead>Jenis</TableHead><TableHead className="text-right">Ramalan</TableHead><TableHead className="text-right">Sebenar</TableHead><TableHead className="text-right">Ketepatan</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {mockPredictions.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="text-sm">{new Date(p.date).toLocaleDateString('ms-MY')}</TableCell>
                        <TableCell><Badge variant="outline">{p.type === 'kes_baharu' ? 'Kes Baharu' : 'Dana Diperlukan'}</Badge></TableCell>
                        <TableCell className="text-right font-mono">{p.type === 'kes_baharu' ? p.predicted : fmtCurrency(p.predicted)}</TableCell>
                        <TableCell className="text-right font-mono">{p.type === 'kes_baharu' ? p.actual : fmtCurrency(p.actual)}</TableCell>
                        <TableCell className="text-right">
                          <Badge className={p.accuracy >= 95 ? 'bg-green-100 text-green-700' : p.accuracy >= 90 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}>
                            {p.accuracy}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
