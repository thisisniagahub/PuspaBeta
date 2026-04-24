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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ShieldCheck, FileCode2, Search, CheckCircle2, Clock, AlertCircle, ArrowRightLeft, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface AuditEntry {
  id: string
  txHash: string
  txType: string
  amount: number
  fundType: string
  fromEntity: string
  toEntity: string
  status: string
  verified: boolean
  timestamp: string
  blockNumber: number
}

interface ContractLog {
  id: string
  contractName: string
  action: string
  result: string
  timestamp: string
}

const txTypeColors: Record<string, string> = {
  zakat_distribution: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
  sadaqah_receipt: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  waqf_allocation: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  infaq_transfer: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  disbursement: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400',
}

const fundTypeColors: Record<string, string> = {
  zakat: 'bg-purple-500',
  sadaqah: 'bg-green-500',
  waqf: 'bg-blue-500',
  infaq: 'bg-amber-500',
}

const mockEntries: AuditEntry[] = [
  { id: '1', txHash: '0x7f3a2b1c4d5e6f7890abcdef1234567890abcdef1234567890abcdef12345678', txType: 'zakat_distribution', amount: 5000, fundType: 'zakat', fromEntity: 'Tabung Zakat PUSPA', toEntity: 'Ahmad bin Ali (USR-001)', status: 'confirmed', verified: true, timestamp: '2026-03-04T08:30:00Z', blockNumber: 14582301 },
  { id: '2', txHash: '0x2b1c4d5e6f7890abcdef1234567890abcdef1234567890abcdef12345678abcd', txType: 'sadaqah_receipt', amount: 500, fundType: 'sadaqah', fromEntity: 'Penderma Anonim', toEntity: 'Tabung Sadaqah PUSPA', status: 'confirmed', verified: true, timestamp: '2026-03-04T09:15:00Z', blockNumber: 14582315 },
  { id: '3', txHash: '0x4d5e6f7890abcdef1234567890abcdef1234567890abcdef12345678abcdef01', txType: 'waqf_allocation', amount: 25000, fundType: 'waqf', fromEntity: 'Tabung Wakaf PUSPA', toEntity: 'Program Pendidikan Wakaf', status: 'confirmed', verified: true, timestamp: '2026-03-04T10:00:00Z', blockNumber: 14582328 },
  { id: '4', txHash: '0x6f7890abcdef1234567890abcdef1234567890abcdef12345678abcdef01234567', txType: 'infaq_transfer', amount: 1200, fundType: 'infaq', fromEntity: 'Tabung Infak PUSPA', toEntity: 'Siti binti Hassan (USR-002)', status: 'pending', verified: false, timestamp: '2026-03-04T11:30:00Z', blockNumber: 14582342 },
  { id: '5', txHash: '0x890abcdef1234567890abcdef1234567890abcdef12345678abcdef0123456789', txType: 'disbursement', amount: 8000, fundType: 'zakat', fromEntity: 'Tabung Zakat PUSPA', toEntity: 'Mohd Rizal (USR-003)', status: 'confirmed', verified: true, timestamp: '2026-03-04T14:00:00Z', blockNumber: 14582367 },
  { id: '6', txHash: '0xabcdef1234567890abcdef1234567890abcdef12345678abcdef0123456789abcd', txType: 'zakat_distribution', amount: 3500, fundType: 'zakat', fromEntity: 'Tabung Zakat PUSPA', toEntity: 'Aminah bt Abdullah (USR-004)', status: 'confirmed', verified: true, timestamp: '2026-03-04T15:45:00Z', blockNumber: 14582381 },
]

const mockContractLogs: ContractLog[] = [
  { id: '1', contractName: 'ZakatDistribution.sol', action: 'distribute(address,uint256)', result: 'Berjaya — 0x7f3a…5678', timestamp: '2026-03-04T08:30:00Z' },
  { id: '2', contractName: 'SadaqahPool.sol', action: 'receive(address,uint256)', result: 'Berjaya — 0x2b1c…abcd', timestamp: '2026-03-04T09:15:00Z' },
  { id: '3', contractName: 'WaqfAllocation.sol', action: 'allocate(uint256,address)', result: 'Berjaya — 0x4d5e…ef01', timestamp: '2026-03-04T10:00:00Z' },
  { id: '4', contractName: 'ComplianceCheck.sol', action: 'verify(address,uint256)', result: 'Menunggu pengesahan', timestamp: '2026-03-04T11:30:00Z' },
]

const fundFlowData = [
  { category: 'Zakat', inflow: 85000, outflow: 72000 },
  { category: 'Sadaqah', inflow: 42000, outflow: 38000 },
  { category: 'Wakaf', inflow: 65000, outflow: 55000 },
  { category: 'Infak', inflow: 28000, outflow: 22000 },
]

function fmtCurrency(n: number) { return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 0 }).format(n) }

export default function AuditTrailPage() {
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [activeTab, setActiveTab] = useState('trail')
  const [verifyHash, setVerifyHash] = useState('')
  const [verifyResult, setVerifyResult] = useState<AuditEntry | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [contractForm, setContractForm] = useState({ contract: '', params: '' })

  useEffect(() => {
    const timer = setTimeout(() => {
      setEntries(mockEntries)
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const handleVerify = async () => {
    if (!verifyHash.trim()) { toast.error('Sila masukkan hash transaksi'); return }
    setVerifying(true)
    try {
      await new Promise(r => setTimeout(r, 1000))
      const entry = entries.find(e => e.txHash.startsWith(verifyHash.trim()))
      setVerifyResult(entry || null)
      if (entry) toast.success('Transaksi berjaya disahkan')
      else toast.error('Transaksi tidak dijumpai')
    } catch { toast.error('Gagal mengesahkan') } finally { setVerifying(false) }
  }

  const totalTransactions = entries.length
  const verifiedCount = entries.filter(e => e.verified).length
  const pendingCount = entries.filter(e => !e.verified).length
  const totalValue = entries.reduce((s, e) => s + e.amount, 0)

  if (loading) return (
    <div className="space-y-4 p-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  )

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: '#4B008215' }}>
          <ShieldCheck className="h-5 w-5" style={{ color: '#4B0082' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Jejak Audit</h1>
          <p className="text-sm text-muted-foreground">Audit trail dan verifikasi blockchain</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Jumlah Transaksi', value: totalTransactions, icon: ArrowRightLeft, color: '#4B0082' },
          { label: 'Disahkan', value: verifiedCount, icon: CheckCircle2, color: '#059669' },
          { label: 'Menunggu', value: pendingCount, icon: Clock, color: '#d97706' },
          { label: 'Jumlah Nilai', value: fmtCurrency(totalValue), icon: ShieldCheck, color: '#2563eb' },
        ].map(s => (
          <Card key={s.label}><CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}15` }}><s.icon className="h-5 w-5" style={{ color: s.color }} /></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Aliran Dana Mengikut Kategori</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={fundFlowData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="category" className="text-xs" />
              <YAxis className="text-xs" tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => fmtCurrency(v)} />
              <Legend />
              <Bar dataKey="inflow" fill="#4B0082" name="Masuk" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outflow" fill="#9333ea" name="Keluar" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="trail">Jejak Audit</TabsTrigger>
          <TabsTrigger value="contract">Kontrak Pintar</TabsTrigger>
          <TabsTrigger value="verify">Verifikasi</TabsTrigger>
        </TabsList>

        <TabsContent value="trail" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Jejak Audit Transaksi</CardTitle><CardDescription>Semua transaksi pada rantaian blok</CardDescription></CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-auto">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Hash Tx</TableHead><TableHead>Jenis</TableHead><TableHead className="hidden md:table-cell">Jumlah</TableHead><TableHead className="hidden lg:table-cell">Jenis Dana</TableHead><TableHead className="hidden md:table-cell">Dari → Kepada</TableHead><TableHead>Status</TableHead><TableHead>Disahkan</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {entries.map(e => (
                      <TableRow key={e.id}>
                        <TableCell><code className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded">{e.txHash.slice(0, 10)}…{e.txHash.slice(-6)}</code></TableCell>
                        <TableCell><Badge className={txTypeColors[e.txType] || 'bg-gray-100 text-gray-700'}>{e.txType.replace('_', ' ')}</Badge></TableCell>
                        <TableCell className="hidden md:table-cell font-medium">{fmtCurrency(e.amount)}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1.5">
                            <div className={cn('h-2 w-2 rounded-full', fundTypeColors[e.fundType])} />
                            <span className="text-xs capitalize">{e.fundType}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs max-w-[180px] truncate">{e.fromEntity} → {e.toEntity}</TableCell>
                        <TableCell><Badge variant={e.status === 'confirmed' ? 'default' : 'secondary'} className={e.status === 'confirmed' ? 'bg-green-600' : ''}>{e.status}</Badge></TableCell>
                        <TableCell>{e.verified ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Clock className="h-4 w-4 text-yellow-600" />}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contract" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Penilaian Kontrak Pintar</CardTitle><CardDescription>Jalankan fungsi kontrak pada rantaian</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Kontrak</Label>
                <Input placeholder="cth: ZakatDistribution.sol" value={contractForm.contract} onChange={e => setContractForm(p => ({ ...p, contract: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Parameter Fungsi</Label>
                <Textarea placeholder='cth: {"function": "distribute", "params": ["0xaddr...", "5000"]}' rows={3} value={contractForm.params} onChange={e => setContractForm(p => ({ ...p, params: e.target.value }))} />
              </div>
              <Button className="gap-2" style={{ backgroundColor: '#4B0082' }}><FileCode2 className="h-4 w-4" /> Jalankan Kontrak</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Log Kontrak</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockContractLogs.map(log => (
                  <div key={log.id} className="rounded-lg border p-3 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium font-mono">{log.contractName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{log.action}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-[10px]">{log.result}</Badge>
                      <p className="text-[10px] text-muted-foreground mt-1">{new Date(log.timestamp).toLocaleString('ms-MY')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verify" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Verifikasi Transaksi</CardTitle><CardDescription>Sahkan ketulenan transaksi pada rantaian blok</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Masukkan hash transaksi (0x…)" value={verifyHash} onChange={e => setVerifyHash(e.target.value)} className="font-mono text-sm" />
                <Button onClick={handleVerify} disabled={verifying} className="gap-2 shrink-0" style={{ backgroundColor: '#4B0082' }}>
                  {verifying ? 'Menyahkan…' : <><Search className="h-4 w-4" /> Sahkan</>}
                </Button>
              </div>

              {verifyResult && (
                <div className="rounded-lg border-2 p-5 space-y-3" style={{ borderColor: '#4B008240' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-700">Transaksi Disahkan</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Hash:</span><p className="font-mono text-xs mt-0.5 break-all">{verifyResult.txHash}</p></div>
                    <div><span className="text-muted-foreground">Blok:</span><p className="font-mono mt-0.5">#{verifyResult.blockNumber}</p></div>
                    <div><span className="text-muted-foreground">Jenis:</span><div className="mt-0.5"><Badge className={txTypeColors[verifyResult.txType]}>{verifyResult.txType.replace('_', ' ')}</Badge></div></div>
                    <div><span className="text-muted-foreground">Jenis Dana:</span><p className="mt-0.5 capitalize">{verifyResult.fundType}</p></div>
                    <div><span className="text-muted-foreground">Jumlah:</span><p className="font-bold mt-0.5">{fmtCurrency(verifyResult.amount)}</p></div>
                    <div><span className="text-muted-foreground">Status:</span><div className="mt-0.5"><Badge className="bg-green-600 text-white">{verifyResult.status}</Badge></div></div>
                    <div><span className="text-muted-foreground">Dari:</span><p className="mt-0.5 text-xs">{verifyResult.fromEntity}</p></div>
                    <div><span className="text-muted-foreground">Kepada:</span><p className="mt-0.5 text-xs">{verifyResult.toEntity}</p></div>
                    <div className="col-span-2"><span className="text-muted-foreground">Masa:</span><p className="mt-0.5">{new Date(verifyResult.timestamp).toLocaleString('ms-MY')}</p></div>
                  </div>
                </div>
              )}

              {verifyHash && verifyResult === null && !verifying && (
                <div className="rounded-lg border-2 border-red-200 p-5 text-center">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-red-700 font-medium">Transaksi tidak dijumpai</p>
                  <p className="text-sm text-muted-foreground">Hash yang dimasukkan tidak sepadan dengan mana-mana transaksi</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
