'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Heart, Search, DollarSign, Calendar, TrendingUp } from 'lucide-react'

interface Donation {
  id: string; donationNumber: string; donorName: string; amount: number
  status: string; method: string; fundType: string; donatedAt: string
}

function fmtCurrency(n: number) { return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 0 }).format(n) }

export default function SedekahJumaatPage() {
  const [items, setItems] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await api.get<Donation[]>('/donations', { fundType: 'sadaqah' })
        const donations = Array.isArray(data) ? data : []
        // Filter for Friday donations (simulated: show all sadaqah)
        setItems(donations)
      } catch { toast.error('Gagal memuatkan data Sedekah Jumaat') } finally { setLoading(false) }
    }
    load()
  }, [])

  const totalAmount = items.reduce((s, d) => s + d.amount, 0)
  const confirmedAmount = items.filter(d => d.status === 'confirmed').reduce((s, d) => s + d.amount, 0)

  if (loading) return <div className="space-y-4 p-6"><Skeleton className="h-24 rounded-xl" /><Skeleton className="h-80 rounded-xl" /></div>

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <Heart className="h-6 w-6" style={{ color: '#4B0082' }} />
        <h1 className="text-2xl font-bold">Sedekah Jumaat</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Jumlah Sumbangan', value: items.length, icon: Heart, color: '#7c3aed' },
          { label: 'Jumlah Amount', value: fmtCurrency(totalAmount), icon: DollarSign, color: '#059669' },
          { label: 'Disahkan', value: fmtCurrency(confirmedAmount), icon: TrendingUp, color: '#0ea5e9' },
          { label: 'Jumaat Ini', value: items.filter(d => { const dt = new Date(d.donatedAt); return dt.getDay() === 5 }).length, icon: Calendar, color: '#d97706' },
        ].map(s => (
          <Card key={s.label}><CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}15` }}><s.icon className="h-5 w-5" style={{ color: s.color }} /></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Cari sumbangan Jumaat…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader><TableRow><TableHead>No.</TableHead><TableHead>Penderma</TableHead><TableHead>Jumlah</TableHead><TableHead>Status</TableHead><TableHead>Tarikh</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">Tiada sumbangan Sedekah Jumaat</TableCell></TableRow>
            ) : items.filter(d => !search || d.donorName.toLowerCase().includes(search.toLowerCase())).map(d => (
              <TableRow key={d.id}>
                <TableCell className="font-mono text-xs">{d.donationNumber}</TableCell>
                <TableCell className="font-medium">{d.donorName}</TableCell>
                <TableCell className="font-semibold">{fmtCurrency(d.amount)}</TableCell>
                <TableCell><Badge variant={d.status === 'confirmed' ? 'default' : 'secondary'}>{d.status}</Badge></TableCell>
                <TableCell className="text-xs">{new Date(d.donatedAt).toLocaleDateString('ms-MY')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
