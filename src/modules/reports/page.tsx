'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DollarSign, TrendingUp, TrendingDown, BarChart3, Download, FileText, ArrowRightCircle } from 'lucide-react'

interface ReportSummary { totalDonations: number; totalDisbursements: number; netBalance: number; donationCount: number; disbursementCount: number; activeProgrammes: number; totalMembers: number; pendingDonations: number }
interface MonthlyFinance { bulan: string; totalDonasi: number; totalAgihan: number; bersih: number }

function fmtCurrency(n: number) { return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 0 }).format(n) }

export default function ReportsPage() {
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [monthly, setMonthly] = useState<MonthlyFinance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [s, m] = await Promise.allSettled([
          api.get<ReportSummary>('/reports'),
          api.get<MonthlyFinance[]>('/reports/financial'),
        ])
        if (s.status === 'fulfilled') setSummary(s.value)
        if (m.status === 'fulfilled') setMonthly(Array.isArray(m.value) ? m.value : [])
      } catch { toast.error('Gagal memuatkan laporan') } finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) return <div className="space-y-4 p-6"><div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-24 rounded-xl" />)}</div><Skeleton className="h-80 rounded-xl" /></div>

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Laporan Kewangan</h1>
        <Button variant="outline" className="gap-2" onClick={() => toast.info('Eksport simulasi — PDF akan dimuat turun')}>
          <Download className="h-4 w-4" /> Eksport PDF
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Jumlah Donasi', value: fmtCurrency(summary?.totalDonations ?? 0), icon: DollarSign, color: '#059669' },
          { label: 'Jumlah Agihan', value: fmtCurrency(summary?.totalDisbursements ?? 0), icon: ArrowRightCircle, color: '#d97706' },
          { label: 'Baki Bersih', value: fmtCurrency(summary?.netBalance ?? 0), icon: BarChart3, color: '#7c3aed' },
          { label: 'Donasi Tertunggak', value: summary?.pendingDonations ?? 0, icon: FileText, color: '#e11d48' },
        ].map(s => (
          <Card key={s.label}><CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}15` }}><s.icon className="h-5 w-5" style={{ color: s.color }} /></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      {summary && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Bil. Donasi</p><p className="text-2xl font-bold">{summary.donationCount}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Bil. Agihan</p><p className="text-2xl font-bold">{summary.disbursementCount}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Program Aktif</p><p className="text-2xl font-bold">{summary.activeProgrammes}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Jumlah Ahli</p><p className="text-2xl font-bold">{summary.totalMembers}</p></CardContent></Card>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Pecahan Bulanan</CardTitle><CardDescription>Ringkasan kewangan mengikut bulan</CardDescription></CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Bulan</TableHead><TableHead className="text-right">Jumlah Donasi</TableHead><TableHead className="text-right">Jumlah Agihan</TableHead><TableHead className="text-right">Bersih</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {monthly.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">Tiada data kewangan</TableCell></TableRow>
                ) : monthly.map(m => (
                  <TableRow key={m.bulan}>
                    <TableCell className="font-medium">{m.bulan}</TableCell>
                    <TableCell className="text-right text-emerald-600 font-medium">{fmtCurrency(m.totalDonasi)}</TableCell>
                    <TableCell className="text-right text-amber-600 font-medium">{fmtCurrency(m.totalAgihan)}</TableCell>
                    <TableCell className={`text-right font-bold ${m.bersih >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{fmtCurrency(m.bersih)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
