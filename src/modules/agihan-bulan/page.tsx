'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowRightCircle, Calendar, DollarSign, Users, TrendingUp } from 'lucide-react'

interface Disbursement {
  id: string; disbursementNumber: string; amount: number; purpose: string
  status: string; recipientName: string; scheduledDate?: string; processedDate?: string; createdAt: string
}

function fmtCurrency(n: number) { return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 0 }).format(n) }

const monthNames = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember']

export default function AgihanBulanPage() {
  const [items, setItems] = useState<Disbursement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await api.get<Disbursement[]>('/disbursements')
        setItems(Array.isArray(data) ? data : [])
      } catch { toast.error('Gagal memuatkan data agihan') } finally { setLoading(false) }
    }
    load()
  }, [])

  const totalAmount = items.reduce((s, d) => s + d.amount, 0)
  const completedAmount = items.filter(d => d.status === 'completed').reduce((s, d) => s + d.amount, 0)

  // Group by month
  const monthlyMap = new Map<string, Disbursement[]>()
  items.forEach(d => {
    const dt = new Date(d.createdAt)
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
    if (!monthlyMap.has(key)) monthlyMap.set(key, [])
    monthlyMap.get(key)!.push(d)
  })
  const months = Array.from(monthlyMap.entries()).sort((a, b) => b[0].localeCompare(a[0]))

  if (loading) return <div className="space-y-4 p-6"><Skeleton className="h-24 rounded-xl" /><Skeleton className="h-80 rounded-xl" /></div>

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <Calendar className="h-6 w-6" style={{ color: '#4B0082' }} />
        <h1 className="text-2xl font-bold">Agihan Bulanan</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Jumlah Agihan', value: items.length, icon: ArrowRightCircle, color: '#7c3aed' },
          { label: 'Total Amount', value: fmtCurrency(totalAmount), icon: DollarSign, color: '#d97706' },
          { label: 'Selesai', value: fmtCurrency(completedAmount), icon: TrendingUp, color: '#059669' },
          { label: 'Penerima', value: new Set(items.map(d => d.recipientName)).size, icon: Users, color: '#0ea5e9' },
        ].map(s => (
          <Card key={s.label}><CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}15` }}><s.icon className="h-5 w-5" style={{ color: s.color }} /></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      {months.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Tiada data agihan bulanan</CardContent></Card>
      ) : months.map(([monthKey, disbs]) => {
        const [yr, mn] = monthKey.split('-')
        const monthTotal = disbs.reduce((s, d) => s + d.amount, 0)
        return (
          <Card key={monthKey}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{monthNames[parseInt(mn) - 1]} {yr}</CardTitle>
                <Badge variant="outline" className="text-sm">{fmtCurrency(monthTotal)}</Badge>
              </div>
              <CardDescription>{disbs.length} agihan</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>No.</TableHead><TableHead>Penerima</TableHead><TableHead>Tujuan</TableHead><TableHead>Jumlah</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {disbs.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="font-mono text-xs">{d.disbursementNumber}</TableCell>
                      <TableCell>{d.recipientName}</TableCell>
                      <TableCell className="text-sm">{d.purpose}</TableCell>
                      <TableCell className="font-semibold">{fmtCurrency(d.amount)}</TableCell>
                      <TableCell><Badge variant={d.status === 'completed' ? 'default' : 'secondary'}>{d.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
