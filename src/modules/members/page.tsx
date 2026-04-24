'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

import {
  Users,
  UserCheck,
  UserX,
  Ban,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Wallet,
  Home,
  Briefcase,
  Building2,
  StickyNote,
  RefreshCw,
} from 'lucide-react'

// ============ TYPES ============

interface Member {
  id: string
  memberNumber: string
  name: string
  ic: string
  phone: string
  email: string | null
  address: string
  city: string | null
  state: string | null
  postalCode: string | null
  householdSize: number
  monthlyIncome: number
  maritalStatus: string
  occupation: string | null
  bankAccount: string | null
  bankName: string | null
  status: string
  notes: string | null
  joinedAt: string
  createdAt: string
}

interface MemberStats {
  total: number
  active: number
  inactive: number
  blacklisted: number
}

interface MemberListResponse {
  items: Member[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  stats: MemberStats
}

// ============ ZOD SCHEMA ============

const memberSchema = z.object({
  name: z.string().min(1, 'Nama diperlukan'),
  ic: z.string().min(1, 'No. IC diperlukan'),
  phone: z.string().min(1, 'No. telefon diperlukan'),
  email: z.string().email('Emel tidak sah').optional().or(z.literal('')),
  address: z.string().min(1, 'Alamat diperlukan'),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  postalCode: z.string().optional().or(z.literal('')),
  householdSize: z.coerce.number().min(0, 'Saiz isi rumah tidak boleh negatif'),
  monthlyIncome: z.coerce.number().min(0, 'Pendapatan tidak boleh negatif'),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
  occupation: z.string().optional().or(z.literal('')),
  bankAccount: z.string().optional().or(z.literal('')),
  bankName: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive', 'blacklisted']),
  notes: z.string().optional().or(z.literal('')),
})

type MemberFormValues = z.infer<typeof memberSchema>

// ============ CONSTANTS ============

const ITEMS_PER_PAGE = 10

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive'; className: string }> = {
  active: { label: 'Aktif', variant: 'default', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  inactive: { label: 'Tidak Aktif', variant: 'secondary', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700' },
  blacklisted: { label: 'Senarai Hitam', variant: 'destructive', className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800' },
}

const MARITAL_STATUS_MAP: Record<string, string> = {
  single: 'Bujang',
  married: 'Berkahwin',
  divorced: 'Bercerai',
  widowed: 'Janda/Duda',
}

const MALAYSIAN_STATES = [
  'Johor', 'Kedah', 'Kelantan', 'Kuala Lumpur', 'Labuan',
  'Melaka', 'Negeri Sembilan', 'Pahang', 'Perak', 'Perlis',
  'Pulau Pinang', 'Putrajaya', 'Sabah', 'Sarawak', 'Selangor', 'Terengganu',
]

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Nama (A → Z)' },
  { value: 'name-desc', label: 'Nama (Z → A)' },
  { value: 'income-asc', label: 'Pendapatan (Rendah → Tinggi)' },
  { value: 'income-desc', label: 'Pendapatan (Tinggi → Rendah)' },
  { value: 'joined-desc', label: 'Tarikh Sertai (Terbaru)' },
  { value: 'joined-asc', label: 'Tarikh Sertai (Lama)' },
]

// ============ HELPERS ============

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)

const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })

// ============ COMPONENT ============

export default function MembersPage() {
  // --- State ---
  const [members, setMembers] = useState<Member[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState<MemberStats>({ total: 0, active: 0, inactive: 0, blacklisted: 0 })
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [statusFilter, setStatusFilter] = useState('Semua')
  const [maritalFilter, setMaritalFilter] = useState('Semua')
  const [sortBy, setSortBy] = useState('joined-desc')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [viewSheetOpen, setViewSheetOpen] = useState(false)
  const [viewingMember, setViewingMember] = useState<Member | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingMember, setDeletingMember] = useState<Member | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // --- Form ---
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: '',
      ic: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      householdSize: 1,
      monthlyIncome: 0,
      maritalStatus: 'single',
      occupation: '',
      bankAccount: '',
      bankName: '',
      status: 'active',
      notes: '',
    },
  })

  // --- Debounced search ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(searchQuery)
      setCurrentPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // --- Fetch members ---
  const fetchMembers = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number | boolean> = {
        page: currentPage,
        pageSize: ITEMS_PER_PAGE,
      }
      if (searchDebounced) params.search = searchDebounced
      if (statusFilter !== 'Semua') params.status = statusFilter
      if (maritalFilter !== 'Semua') params.maritalStatus = maritalFilter

      const data = await api.get<MemberListResponse>('/members', params)
      setMembers(data.items)
      setTotalCount(data.total)
      setTotalPages(data.totalPages)
      setStats(data.stats)
    } catch {
      toast.error('Gagal memuatkan senarai ahli')
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchDebounced, statusFilter, maritalFilter])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  // --- Sort members client-side ---
  const sortedMembers = useMemo(() => {
    const sorted = [...members]
    switch (sortBy) {
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'income-asc':
        sorted.sort((a, b) => a.monthlyIncome - b.monthlyIncome)
        break
      case 'income-desc':
        sorted.sort((a, b) => b.monthlyIncome - a.monthlyIncome)
        break
      case 'joined-desc':
        sorted.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())
        break
      case 'joined-asc':
        sorted.sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime())
        break
      default:
        break
    }
    return sorted
  }, [members, sortBy])

  // --- Reset page on filter change ---
  useEffect(() => { setCurrentPage(1) }, [statusFilter, maritalFilter])

  // --- CRUD Handlers ---
  const openAddDialog = () => {
    setEditingMember(null)
    form.reset({
      name: '', ic: '', phone: '', email: '', address: '', city: '', state: '',
      postalCode: '', householdSize: 1, monthlyIncome: 0, maritalStatus: 'single',
      occupation: '', bankAccount: '', bankName: '', status: 'active', notes: '',
    })
    setDialogOpen(true)
  }

  const openEditDialog = (member: Member) => {
    setEditingMember(member)
    form.reset({
      name: member.name,
      ic: member.ic,
      phone: member.phone,
      email: member.email || '',
      address: member.address,
      city: member.city || '',
      state: member.state || '',
      postalCode: member.postalCode || '',
      householdSize: member.householdSize,
      monthlyIncome: member.monthlyIncome,
      maritalStatus: member.maritalStatus as 'single' | 'married' | 'divorced' | 'widowed',
      occupation: member.occupation || '',
      bankAccount: member.bankAccount || '',
      bankName: member.bankName || '',
      status: member.status as 'active' | 'inactive' | 'blacklisted',
      notes: member.notes || '',
    })
    setDialogOpen(true)
  }

  const openViewSheet = (member: Member) => {
    setViewingMember(member)
    setViewSheetOpen(true)
  }

  const openDeleteDialog = (member: Member) => {
    setDeletingMember(member)
    setDeleteDialogOpen(true)
  }

  const onSubmit = async (data: MemberFormValues) => {
    setSubmitting(true)
    try {
      if (editingMember) {
        await api.put('/members?id=' + editingMember.id, data)
        toast.success('Maklumat ahli berjaya dikemas kini')
      } else {
        await api.post('/members', data)
        toast.success('Ahli baharu berjaya ditambah')
      }
      setDialogOpen(false)
      form.reset()
      setEditingMember(null)
      fetchMembers()
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Gagal menyimpan maklumat ahli'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingMember) return
    try {
      await api.delete('/members', { id: deletingMember.id })
      toast.success('Ahli berjaya dipadam')
      setDeleteDialogOpen(false)
      setDeletingMember(null)
      fetchMembers()
    } catch {
      toast.error('Gagal memadam ahli')
    }
  }

  // --- Stats Cards ---
  const statCards = [
    { title: 'Jumlah Ahli', value: stats.total, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/50' },
    { title: 'Aktif', value: stats.active, icon: UserCheck, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/50' },
    { title: 'Tidak Aktif', value: stats.inactive, icon: UserX, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-900/50' },
    { title: 'Senarai Hitam', value: stats.blacklisted, icon: Ban, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/50' },
  ]

  // --- Pagination Helpers ---
  const canGoPrev = currentPage > 1
  const canGoNext = currentPage < totalPages
  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE + 1
  const pageEnd = Math.min(currentPage * ITEMS_PER_PAGE, totalCount)

  // ============ RENDER ============

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengurusan Ahli Asnaf</h1>
          <p className="text-sm text-muted-foreground mt-1">Urus dan pantau maklumat ahli asnaf PUSPA</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchMembers} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Muat Semula</span>
          </Button>
          <Button size="sm" onClick={openAddDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Ahli
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.title} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{card.title}</p>
                  <div className="text-2xl font-bold mt-1">{loading ? <Skeleton className="h-7 w-12 inline-block" /> : card.value.toLocaleString('ms-MY')}</div>
                </div>
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${card.bg}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, no. IC, telefon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua">Semua Status</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Tidak Aktif</SelectItem>
                  <SelectItem value="blacklisted">Senarai Hitam</SelectItem>
                </SelectContent>
              </Select>

              <Select value={maritalFilter} onValueChange={setMaritalFilter}>
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Status Perkahwinan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua">Semua</SelectItem>
                  <SelectItem value="single">Bujang</SelectItem>
                  <SelectItem value="married">Berkahwin</SelectItem>
                  <SelectItem value="divorced">Bercerai</SelectItem>
                  <SelectItem value="widowed">Janda/Duda</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Susun mengikut" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Desktop Table */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : sortedMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Users className="h-12 w-12 mb-4 opacity-40" />
              <p className="text-lg font-medium">Tiada ahli dijumpai</p>
              <p className="text-sm">Cuba ubah carian atau tapisan anda</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">No. Ahli</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>No. IC</TableHead>
                  <TableHead className="hidden lg:table-cell">Telefon</TableHead>
                  <TableHead className="hidden xl:table-cell">Pendapatan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Tindakan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMembers.map((member) => {
                  const statusInfo = STATUS_MAP[member.status] || STATUS_MAP.active
                  return (
                    <TableRow key={member.id}>
                      <TableCell className="font-mono text-xs">{member.memberNumber}</TableCell>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell className="font-mono text-xs">{member.ic}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">{member.phone}</TableCell>
                      <TableCell className="hidden xl:table-cell text-sm">{formatCurrency(member.monthlyIncome)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusInfo.className}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openViewSheet(member)} title="Lihat">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(member)} title="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => openDeleteDialog(member)} title="Padam">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))
        ) : sortedMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Users className="h-12 w-12 mb-4 opacity-40" />
            <p className="text-lg font-medium">Tiada ahli dijumpai</p>
            <p className="text-sm">Cuba ubah carian atau tapisan anda</p>
          </div>
        ) : (
          sortedMembers.map((member) => {
            const statusInfo = STATUS_MAP[member.status] || STATUS_MAP.active
            return (
              <Card key={member.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate">{member.name}</p>
                        <Badge variant="outline" className={`shrink-0 text-[10px] px-1.5 py-0 ${statusInfo.className}`}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">{member.memberNumber}</p>
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2"><span className="font-mono text-xs">{member.ic}</span></p>
                        <p className="flex items-center gap-2"><Phone className="h-3 w-3" />{member.phone}</p>
                        <p className="flex items-center gap-2"><Wallet className="h-3 w-3" />{formatCurrency(member.monthlyIncome)}/bulan</p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openViewSheet(member)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(member)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => openDeleteDialog(member)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {!loading && totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Menunjukkan <span className="font-medium">{pageStart}</span>–<span className="font-medium">{pageEnd}</span> daripada <span className="font-medium">{totalCount}</span> ahli
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={!canGoPrev}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Sebelum
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  if (totalPages <= 5) return true
                  if (page === 1 || page === totalPages) return true
                  if (Math.abs(page - currentPage) <= 1) return true
                  return false
                })
                .map((page, idx, arr) => {
                  const prevPage = arr[idx - 1]
                  const showEllipsis = prevPage !== undefined && page - prevPage > 1
                  return (
                    <span key={page} className="flex items-center">
                      {showEllipsis && <span className="px-1 text-muted-foreground text-sm">…</span>}
                      <Button
                        variant={page === currentPage ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    </span>
                  )
                })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={!canGoNext}
              className="gap-1"
            >
              Seterusnya
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ============ ADD/EDIT DIALOG ============ */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        if (!open) { setEditingMember(null); form.reset() }
        setDialogOpen(open)
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMember ? 'Edit Maklumat Ahli' : 'Tambah Ahli Baharu'}</DialogTitle>
            <DialogDescription>
              {editingMember ? 'Kemas kini maklumat ahli asnaf' : 'Isikan maklumat ahli asnaf baharu'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Maklumat Peribadi</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Penuh <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input placeholder="Ahmad bin Ali" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="ic" render={({ field }) => (
                    <FormItem>
                      <FormLabel>No. Kad Pengenalan <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input placeholder="900101-10-1234" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>No. Telefon <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input placeholder="012-3456789" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emel</FormLabel>
                      <FormControl><Input type="email" placeholder="ahmad@email.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="maritalStatus" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status Perkahwinan <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="single">Bujang</SelectItem>
                          <SelectItem value="married">Berkahwin</SelectItem>
                          <SelectItem value="divorced">Bercerai</SelectItem>
                          <SelectItem value="widowed">Janda/Duda</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="occupation" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pekerjaan</FormLabel>
                      <FormControl><Input placeholder="Pekerja kilang" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <Separator />

              {/* Address */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Alamat</h4>
                <div className="grid grid-cols-1 gap-4">
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Textarea placeholder="No. 12, Jalan Maju 3, Taman Seri Indah" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bandar</FormLabel>
                      <FormControl><Input placeholder="Shah Alam" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="state" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Negeri</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih negeri" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {MALAYSIAN_STATES.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="postalCode" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Poskod</FormLabel>
                      <FormControl><Input placeholder="40000" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <Separator />

              {/* Financial */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Maklumat Kewangan</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="householdSize" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Saiz Isi Rumah <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input type="number" min={0} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="monthlyIncome" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pendapatan Bulanan (RM) <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input type="number" min={0} step={100} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <Separator />

              {/* Bank */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Maklumat Bank</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="bankName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Bank</FormLabel>
                      <FormControl><Input placeholder="Maybank" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="bankAccount" render={({ field }) => (
                    <FormItem>
                      <FormLabel>No. Akaun Bank</FormLabel>
                      <FormControl><Input placeholder="1234567890123" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <Separator />

              {/* Status & Notes */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Status & Catatan</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="active">Aktif</SelectItem>
                          <SelectItem value="inactive">Tidak Aktif</SelectItem>
                          <SelectItem value="blacklisted">Senarai Hitam</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan</FormLabel>
                    <FormControl><Textarea placeholder="Catatan tambahan mengenai ahli..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); setEditingMember(null); form.reset() }}>
                  Batal
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : editingMember ? 'Kemas Kini' : 'Tambah Ahli'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ============ VIEW SHEET ============ */}
      <Sheet open={viewSheetOpen} onOpenChange={setViewSheetOpen}>
        <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
          <SheetHeader className="px-4 pt-4">
            <SheetTitle>Butiran Ahli</SheetTitle>
            <SheetDescription>Maklumat lengkap ahli asnaf</SheetDescription>
          </SheetHeader>
          {viewingMember && (
            <div className="px-4 pb-6 space-y-6">
              {/* Header section */}
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xl font-bold text-primary">{viewingMember.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold truncate">{viewingMember.name}</h3>
                  <p className="text-sm font-mono text-muted-foreground">{viewingMember.memberNumber}</p>
                  <Badge variant="outline" className={`mt-1 ${STATUS_MAP[viewingMember.status]?.className || ''}`}>
                    {STATUS_MAP[viewingMember.status]?.label || viewingMember.status}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Personal Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Maklumat Peribadi</h4>
                <div className="space-y-2">
                  <DetailRow icon={Users} label="No. IC" value={viewingMember.ic} mono />
                  <DetailRow icon={Phone} label="Telefon" value={viewingMember.phone} />
                  {viewingMember.email && <DetailRow icon={Mail} label="Emel" value={viewingMember.email} />}
                  <DetailRow label="Status Perkahwinan" value={MARITAL_STATUS_MAP[viewingMember.maritalStatus] || viewingMember.maritalStatus} />
                  {viewingMember.occupation && <DetailRow icon={Briefcase} label="Pekerjaan" value={viewingMember.occupation} />}
                </div>
              </div>

              <Separator />

              {/* Address */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Alamat</h4>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <div>
                    <p>{viewingMember.address}</p>
                    {(viewingMember.city || viewingMember.state || viewingMember.postalCode) && (
                      <p className="text-muted-foreground">
                        {[viewingMember.postalCode, viewingMember.city, viewingMember.state].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Financial */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Maklumat Kewangan</h4>
                <div className="space-y-2">
                  <DetailRow icon={Wallet} label="Pendapatan Bulanan" value={formatCurrency(viewingMember.monthlyIncome)} />
                  <DetailRow icon={Home} label="Saiz Isi Rumah" value={String(viewingMember.householdSize)} />
                  {viewingMember.bankName && <DetailRow icon={Building2} label="Bank" value={viewingMember.bankName} />}
                  {viewingMember.bankAccount && <DetailRow label="No. Akaun" value={viewingMember.bankAccount} mono />}
                </div>
              </div>

              <Separator />

              {/* Dates */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Tarikh Penting</h4>
                <div className="space-y-2">
                  <DetailRow icon={Calendar} label="Tarikh Sertai" value={formatDate(viewingMember.joinedAt)} />
                  <DetailRow icon={Calendar} label="Didaftarkan Pada" value={formatDate(viewingMember.createdAt)} />
                </div>
              </div>

              {viewingMember.notes && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Catatan</h4>
                    <div className="flex items-start gap-2 text-sm">
                      <StickyNote className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                      <p className="whitespace-pre-wrap">{viewingMember.notes}</p>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => { setViewSheetOpen(false); openEditDialog(viewingMember) }}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-2 text-destructive hover:text-destructive" onClick={() => { setViewSheetOpen(false); openDeleteDialog(viewingMember) }}>
                  <Trash2 className="h-4 w-4" />
                  Padam
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ============ DELETE CONFIRMATION ============ */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Padam Ahli</AlertDialogTitle>
            <AlertDialogDescription>
              Adakah anda pasti ingin memadam ahli <span className="font-semibold">{deletingMember?.name}</span> ({deletingMember?.memberNumber})? Tindakan ini akan menandakan ahli sebagai dipadam dan tidak boleh diundur.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingMember(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Padam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ============ SUB-COMPONENTS ============

function DetailRow({ icon: Icon, label, value, mono }: { icon?: React.ComponentType<{ className?: string }>; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />}
      <span className="text-muted-foreground min-w-[120px]">{label}</span>
      <span className={mono ? 'font-mono' : ''}>{value}</span>
    </div>
  )
}
