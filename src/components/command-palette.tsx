'use client'

import { useEffect } from 'react'
import { useAppStore, type UserRole } from '@/stores/app-store'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  LayoutDashboard, Users, FileText, Heart, HandCoins,
  CreditCard, Shield, FileBarChart, Activity, Bot,
  UserCheck, FolderOpen, ScanFace, Smartphone, BookOpen,
  CalendarDays, Package, Zap, Cpu, Plug, Globe,
  Terminal, Wrench, ArrowRightLeft, LayoutGrid
} from 'lucide-react'
import type { ViewId } from '@/types'

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

type PaletteItem = {
  id: ViewId
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string }>
  keywords: string[]
  roles: UserRole[]
}

type PaletteGroup = {
  heading: string
  items: PaletteItem[]
}

// ═══════════════════════════════════════════════════════════════════════════════
// Palette items — 4 groups with bilingual keywords (Malay + English)
// ═══════════════════════════════════════════════════════════════════════════════

const PALETTE_GROUPS: PaletteGroup[] = [
  {
    heading: 'Utama / Main',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        keywords: ['dashboard', 'utama', 'home', 'ringkasan', 'overview', 'papan pemuka'],
        roles: ['staff', 'admin', 'developer'],
      },
      {
        id: 'members',
        label: 'Ahli Asnaf',
        icon: Users,
        keywords: ['ahli', 'asnaf', 'members', 'member', 'pendaftaran', 'beneficiaries', 'penerima'],
        roles: ['staff', 'admin', 'developer'],
      },
      {
        id: 'cases',
        label: 'Kes Bantuan',
        icon: FileText,
        keywords: ['kes', 'bantuan', 'cases', 'case', 'permohonan', 'application', 'help'],
        roles: ['staff', 'admin', 'developer'],
      },
      {
        id: 'programmes',
        label: 'Program',
        icon: Heart,
        keywords: ['program', 'programme', 'programs', 'aktiviti program', 'initiative'],
        roles: ['staff', 'admin', 'developer'],
      },
    ],
  },
  {
    heading: 'Kewangan & Operasi / Finance & Ops',
    items: [
      {
        id: 'donations',
        label: 'Donasi',
        icon: HandCoins,
        keywords: ['donasi', 'donation', 'sumbangan', 'contribution', 'zakat', 'sadaqah', 'waqf', 'infaq'],
        roles: ['staff', 'admin', 'developer'],
      },
      {
        id: 'disbursements',
        label: 'Pembayaran',
        icon: CreditCard,
        keywords: ['pembayaran', 'disbursement', 'payment', 'agihan', 'payout', 'bayaran'],
        roles: ['staff', 'admin', 'developer'],
      },
      {
        id: 'donors',
        label: 'Penderma',
        icon: ArrowRightLeft,
        keywords: ['penderma', 'donor', 'donors', 'penyumbang', 'contributor'],
        roles: ['admin', 'developer'],
      },
      {
        id: 'activities',
        label: 'Aktiviti',
        icon: Activity,
        keywords: ['aktiviti', 'activity', 'activities', 'event', 'acara', 'kegiatan'],
        roles: ['staff', 'admin', 'developer'],
      },
      {
        id: 'agihan-bulan',
        label: 'Agihan Bulan',
        icon: CalendarDays,
        keywords: ['agihan', 'bulan', 'monthly', 'distribution', 'agihan bulanan', 'month'],
        roles: ['staff', 'admin', 'developer'],
      },
      {
        id: 'sedekah-jumaat',
        label: 'Sedekah Jumaat',
        icon: Package,
        keywords: ['sedekah', 'jumaat', 'friday', 'charity', 'Friday charity', 'derma jumaat'],
        roles: ['staff', 'admin', 'developer'],
      },
      {
        id: 'volunteers',
        label: 'Sukarelawan',
        icon: UserCheck,
        keywords: ['sukarelawan', 'volunteer', 'volunteers', 'relawan', 'helper'],
        roles: ['staff', 'admin', 'developer'],
      },
      {
        id: 'documents',
        label: 'Dokumen',
        icon: FolderOpen,
        keywords: ['dokumen', 'document', 'documents', 'fail', 'file', 'arkib', 'archive'],
        roles: ['staff', 'admin', 'developer'],
      },
    ],
  },
  {
    heading: 'Compliance & Laporan / Compliance & Reports',
    items: [
      {
        id: 'compliance',
        label: 'Compliance',
        icon: Shield,
        keywords: ['compliance', 'pematuhan', 'regulation', 'peraturan', 'audit', 'ros', 'pdpa'],
        roles: ['admin', 'developer'],
      },
      {
        id: 'reports',
        label: 'Laporan Kewangan',
        icon: FileBarChart,
        keywords: ['laporan', 'report', 'reports', 'kewangan', 'financial', 'statistik', 'statistics'],
        roles: ['admin', 'developer'],
      },
      {
        id: 'ekyc',
        label: 'eKYC',
        icon: ScanFace,
        keywords: ['ekyc', 'kyc', 'verify', 'pengesahan', 'verification', 'identity', 'pengenalan'],
        roles: ['admin', 'developer'],
      },
      {
        id: 'tapsecure',
        label: 'TapSecure',
        icon: Smartphone,
        keywords: ['tapsecure', 'security', 'keselamatan', 'device', 'peranti', 'biometric'],
        roles: ['admin', 'developer'],
      },
    ],
  },
  {
    heading: 'AI & Automasi / AI & Automation',
    items: [
      {
        id: 'ops-conductor',
        label: 'Ops Conductor',
        icon: Zap,
        keywords: ['ops', 'conductor', 'operasi', 'workflow', 'orkestrasi', 'orchestration'],
        roles: ['admin', 'developer'],
      },
      {
        id: 'ai',
        label: 'Alat AI',
        icon: Bot,
        keywords: ['ai', 'artificial', 'intelligence', 'kecerdasan', 'chatbot', 'assistant', 'pembantu'],
        roles: ['staff', 'admin', 'developer'],
      },
      {
        id: 'openclaw-mcp',
        label: 'Pelayan MCP',
        icon: Cpu,
        keywords: ['mcp', 'pelayan', 'server', 'model context protocol', 'openclaw'],
        roles: ['developer'],
      },
      {
        id: 'openclaw-plugins',
        label: 'Sambungan',
        icon: Plug,
        keywords: ['plugins', 'plugin', 'sambungan', 'extension', 'add-on', 'openclaw'],
        roles: ['developer'],
      },
      {
        id: 'openclaw-integrations',
        label: 'Gateway & Channel',
        icon: Globe,
        keywords: ['integrations', 'integration', 'gateway', 'channel', 'saluran', 'openclaw'],
        roles: ['developer'],
      },
      {
        id: 'openclaw-terminal',
        label: 'Console Operator',
        icon: Terminal,
        keywords: ['terminal', 'console', 'operator', 'command', 'arahan', 'cli', 'openclaw'],
        roles: ['developer'],
      },
      {
        id: 'openclaw-agents',
        label: 'Ejen AI',
        icon: LayoutGrid,
        keywords: ['agents', 'agent', 'ejen', 'ai agent', 'autonomous', 'openclaw'],
        roles: ['developer'],
      },
      {
        id: 'openclaw-models',
        label: 'Enjin Model',
        icon: Wrench,
        keywords: ['models', 'model', 'enjin', 'engine', 'llm', 'inference', 'openclaw'],
        roles: ['developer'],
      },
      {
        id: 'openclaw-automation',
        label: 'Automasi',
        icon: Zap,
        keywords: ['automation', 'automasi', 'auto', 'schedule', 'jadual', 'cron', 'openclaw'],
        roles: ['developer'],
      },
      {
        id: 'docs',
        label: 'Panduan',
        icon: BookOpen,
        keywords: ['docs', 'panduan', 'guide', 'help', 'bantuan', 'documentation', 'dokumentasi'],
        roles: ['staff', 'admin', 'developer'],
      },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// CommandPalette — Main export
// ═══════════════════════════════════════════════════════════════════════════════

export function CommandPalette() {
  const commandPaletteOpen = useAppStore((s) => s.commandPaletteOpen)
  const setCommandPaletteOpen = useAppStore((s) => s.setCommandPaletteOpen)
  const setView = useAppStore((s) => s.setView)
  const userRole = useAppStore((s) => s.userRole)

  // Ctrl+K / Cmd+K keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(!commandPaletteOpen)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [commandPaletteOpen, setCommandPaletteOpen])

  const handleSelect = (id: ViewId) => {
    setView(id)
    setCommandPaletteOpen(false)
  }

  // Filter groups and items by current role
  const visibleGroups = PALETTE_GROUPS
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(userRole)),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <CommandDialog
      open={commandPaletteOpen}
      onOpenChange={setCommandPaletteOpen}
      title="Command Palette PUSPA"
      description="Cari navigasi atau arahan..."
    >
      <CommandInput placeholder="Cari panduan, modul, arahan... (Ctrl+K)" />
      <CommandList>
        <CommandEmpty>Tiada keputusan dijumpai.</CommandEmpty>
        {visibleGroups.map((group) => (
          <CommandGroup key={group.heading} heading={group.heading}>
            {group.items.map((item) => {
              const Icon = item.icon
              return (
                <CommandItem
                  key={item.id}
                  value={`${item.label} ${item.keywords.join(' ')}`}
                  onSelect={() => handleSelect(item.id)}
                  className="cursor-pointer"
                >
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{item.label}</span>
                </CommandItem>
              )
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}

export default CommandPalette
