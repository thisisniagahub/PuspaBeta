'use client'

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react'
import Image from 'next/image'
import { useAppStore, type UserRole } from '@/stores/app-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  LayoutDashboard, Users, FileText, Heart, HandCoins,
  CreditCard, Shield, FileBarChart, Activity, Bot,
  UserCheck, FolderOpen, ScanFace, Smartphone, BookOpen,
  CalendarDays, Package, ChevronLeft, ChevronRight, Menu,
  Cpu, Plug, Globe, Terminal, Wrench, Zap,
  ArrowRightLeft, LayoutGrid, Siren, Bell, MessageSquare,
  UserPlus, BarChart3, Brain, ShieldCheck
} from 'lucide-react'
import type { ViewId } from '@/types'

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

type LucideIcon = React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string }>

type NavItem = {
  id: ViewId
  label: string
  icon: LucideIcon
  roles: UserRole[]
}

type NavGroup = {
  title: string
  items: NavItem[]
  subGroup?: string
  roles: UserRole[]
}

// ═══════════════════════════════════════════════════════════════════════════════
// Role config & cycle
// ═══════════════════════════════════════════════════════════════════════════════

const ROLE_CONFIG: Record<UserRole, { label: string; description: string }> = {
  staff: { label: 'Staf', description: 'Modul operasi harian' },
  admin: { label: 'Pentadbir', description: 'Operasi + compliance + laporan' },
  developer: { label: 'Developer', description: 'Penuh termasuk AI & Automasi' },
}

const ROLE_CYCLE: UserRole[] = ['staff', 'admin', 'developer']

// ═══════════════════════════════════════════════════════════════════════════════
// Navigation groups — role-based filtering
// ═══════════════════════════════════════════════════════════════════════════════

const ALL_GROUPS: NavGroup[] = [
  {
    title: 'Utama',
    roles: ['staff', 'admin', 'developer'],
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['staff', 'admin', 'developer'] },
      { id: 'members', label: 'Ahli Asnaf', icon: Users, roles: ['staff', 'admin', 'developer'] },
      { id: 'cases', label: 'Kes Bantuan', icon: FileText, roles: ['staff', 'admin', 'developer'] },
      { id: 'programmes', label: 'Program', icon: Heart, roles: ['staff', 'admin', 'developer'] },
    ],
  },
  {
    title: 'Kewangan',
    roles: ['staff', 'admin', 'developer'],
    items: [
      { id: 'donations', label: 'Donasi', icon: HandCoins, roles: ['staff', 'admin', 'developer'] },
      { id: 'disbursements', label: 'Pembayaran', icon: CreditCard, roles: ['staff', 'admin', 'developer'] },
      { id: 'donors', label: 'Penderma', icon: ArrowRightLeft, roles: ['admin', 'developer'] },
    ],
  },
  {
    title: 'Operasi',
    roles: ['staff', 'admin', 'developer'],
    items: [
      { id: 'activities', label: 'Aktiviti', icon: Activity, roles: ['staff', 'admin', 'developer'] },
      { id: 'agihan-bulan', label: 'Agihan Bulan', icon: CalendarDays, roles: ['staff', 'admin', 'developer'] },
      { id: 'sedekah-jumaat', label: 'Sedekah Jumaat', icon: Package, roles: ['staff', 'admin', 'developer'] },
      { id: 'volunteers', label: 'Sukarelawan', icon: UserCheck, roles: ['staff', 'admin', 'developer'] },
      { id: 'documents', label: 'Dokumen', icon: FolderOpen, roles: ['staff', 'admin', 'developer'] },
    ],
  },
  {
    title: 'Compliance & Laporan',
    roles: ['admin', 'developer'],
    items: [
      { id: 'compliance', label: 'Compliance', icon: Shield, roles: ['admin', 'developer'] },
      { id: 'reports', label: 'Laporan Kewangan', icon: FileBarChart, roles: ['admin', 'developer'] },
      { id: 'ekyc', label: 'eKYC', icon: ScanFace, roles: ['admin', 'developer'] },
      { id: 'tapsecure', label: 'TapSecure', icon: Smartphone, roles: ['admin', 'developer'] },
    ],
  },
  {
    title: 'Fasa 1 — Triage & Saluran',
    roles: ['admin', 'developer'],
    items: [
      { id: 'triage', label: 'Enjin Triage', icon: Siren, roles: ['admin', 'developer'] },
      { id: 'notifications', label: 'Notifikasi', icon: Bell, roles: ['admin', 'developer'] },
      { id: 'multi-channel', label: 'Berbilang Saluran', icon: MessageSquare, roles: ['admin', 'developer'] },
    ],
  },
  {
    title: 'Fasa 2 — Automasi & Ramalan',
    roles: ['admin', 'developer'],
    items: [
      { id: 'onboarding', label: 'Onboarding', icon: UserPlus, roles: ['admin', 'developer'] },
      { id: 'automation-rules', label: 'Peraturan Automasi', icon: Zap, roles: ['admin', 'developer'] },
      { id: 'predictive', label: 'Analisis Ramalan', icon: BarChart3, roles: ['admin', 'developer'] },
    ],
  },
  {
    title: 'Fasa 3 — Ejen & Kemahiran',
    roles: ['admin', 'developer'],
    items: [
      { id: 'skills', label: 'Pasar Kemahiran', icon: Package, roles: ['admin', 'developer'] },
      { id: 'agent-memory', label: 'Memori Ejen', icon: Brain, roles: ['admin', 'developer'] },
      { id: 'multi-agent', label: 'Berbilang Ejen', icon: LayoutGrid, roles: ['admin', 'developer'] },
    ],
  },
  {
    title: 'Fasa 4 — Audit & Transparansi',
    roles: ['admin', 'developer'],
    items: [
      { id: 'audit-trail', label: 'Jejak Audit', icon: ShieldCheck, roles: ['admin', 'developer'] },
    ],
  },
  {
    title: 'AI & Automasi',
    subGroup: 'AI Ops (Internal)',
    roles: ['staff', 'admin', 'developer'],
    items: [
      { id: 'ops-conductor', label: 'Ops Conductor', icon: Zap, roles: ['admin', 'developer'] },
      { id: 'ai', label: 'Alat AI', icon: Bot, roles: ['staff', 'admin', 'developer'] },
      { id: 'openclaw-mcp', label: 'Pelayan MCP', icon: Cpu, roles: ['developer'] },
      { id: 'openclaw-plugins', label: 'Sambungan', icon: Plug, roles: ['developer'] },
      { id: 'openclaw-integrations', label: 'Gateway & Channel', icon: Globe, roles: ['developer'] },
      { id: 'openclaw-terminal', label: 'Console Operator', icon: Terminal, roles: ['developer'] },
      { id: 'openclaw-agents', label: 'Ejen AI', icon: LayoutGrid, roles: ['developer'] },
      { id: 'openclaw-models', label: 'Enjin Model', icon: Wrench, roles: ['developer'] },
      { id: 'openclaw-automation', label: 'Automasi', icon: Zap, roles: ['developer'] },
    ],
  },
  {
    title: 'Bantuan',
    roles: ['staff', 'admin', 'developer'],
    items: [
      { id: 'docs', label: 'Panduan', icon: BookOpen, roles: ['staff', 'admin', 'developer'] },
    ],
  },
]

/** Filter groups + items based on current role */
function getVisibleGroups(role: UserRole): NavGroup[] {
  return ALL_GROUPS
    .filter((g) => g.roles.includes(role))
    .map((g) => ({
      ...g,
      items: g.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((g) => g.items.length > 0)
}

// ═══════════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════════

const BRAND_COLOR = '#4B0082'
const SIDEBAR_EXPANDED_WIDTH = 260
const SIDEBAR_COLLAPSED_WIDTH = 72

// ═══════════════════════════════════════════════════════════════════════════════
// SidebarBrand — Logo + org name
// ═══════════════════════════════════════════════════════════════════════════════

function SidebarBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn(
      'flex items-center px-4 py-5 transition-all duration-300 ease-in-out',
      collapsed ? 'justify-center' : 'gap-3',
    )}>
      <div className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm transition-all duration-300',
        'bg-white ring-1 ring-purple-100 dark:bg-purple-950/50 dark:ring-purple-800/50',
      )}>
        <Image
          src="/puspa-logo-official.png"
          alt="PUSPA Logo"
          width={40}
          height={40}
          className="object-contain"
          priority
        />
      </div>
      <div
        className={cn(
          'flex flex-col overflow-hidden transition-all duration-300 ease-in-out',
          collapsed ? 'max-h-0 max-w-0 opacity-0' : 'max-h-20 max-w-[200px] opacity-100',
        )}
      >
        <span className="text-lg font-bold tracking-tight whitespace-nowrap" style={{ color: BRAND_COLOR }}>
          PUSPA
        </span>
        <span className="text-[11px] leading-tight text-muted-foreground whitespace-nowrap">
          Pertubuhan Urus Peduli Asnaf
        </span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// NavItemButton — Navigation link with active gradient + left bar
// ═══════════════════════════════════════════════════════════════════════════════

function NavItemButton({
  item,
  isActive,
  onClick,
  collapsed,
}: {
  item: NavItem
  isActive: boolean
  onClick: () => void
  collapsed: boolean
}) {
  const Icon = item.icon

  const button = (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200',
        collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2 pl-3.5',
        'outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2',
        isActive ? 'text-white shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
      style={
        isActive
          ? { background: `linear-gradient(135deg, ${BRAND_COLOR}, #6B21A8)`, boxShadow: `0 2px 8px ${BRAND_COLOR}30` }
          : undefined
      }
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-white/80" />
      )}
      <Icon className={cn(
        'h-[18px] w-[18px] shrink-0 transition-all duration-200',
        isActive ? 'text-white' : 'text-muted-foreground group-hover:text-foreground',
      )} />
      <span className={cn(
        'truncate whitespace-nowrap transition-all duration-300 ease-in-out',
        collapsed ? 'max-h-0 max-w-0 opacity-0 overflow-hidden' : 'max-h-6 opacity-100',
      )}>
        {item.label}
      </span>
    </button>
  )

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8} className="font-medium">{item.label}</TooltipContent>
      </Tooltip>
    )
  }
  return button
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section / Sub-group labels
// ═══════════════════════════════════════════════════════════════════════════════

function NavSectionLabel({ title, collapsed }: { title: string; collapsed: boolean }) {
  return (
    <h3 className={cn(
      'mb-1 font-semibold uppercase tracking-wider text-muted-foreground/50 select-none transition-all duration-300 ease-in-out',
      collapsed ? 'max-h-0 overflow-hidden opacity-0 px-0 text-[0px]' : 'px-3 text-[10px] pt-3 pb-1',
    )}>
      {title}
    </h3>
  )
}

function NavSubGroupLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center py-1.5">
            <div className="h-5 w-5 rounded-md bg-muted/60 flex items-center justify-center">
              <span className="text-[8px] font-bold text-muted-foreground">OC</span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8} className="text-xs font-medium">{label}</TooltipContent>
      </Tooltip>
    )
  }
  return (
    <div className="flex items-center gap-2 px-3 pt-4 pb-1 select-none">
      <div className="flex items-center gap-1.5 text-muted-foreground/70">
        <ChevronRight className="h-3 w-3" />
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex-1 h-px bg-border/60" />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// RoleSwitcher — Click to cycle role in sidebar footer
// ═══════════════════════════════════════════════════════════════════════════════

function RoleSwitcher({ collapsed }: { collapsed: boolean }) {
  const userRole = useAppStore((s) => s.userRole)
  const setUserRole = useAppStore((s) => s.setUserRole)
  const config = ROLE_CONFIG[userRole]

  const cycle = () => {
    const idx = ROLE_CYCLE.indexOf(userRole)
    const next = ROLE_CYCLE[(idx + 1) % ROLE_CYCLE.length]
    setUserRole(next)
  }

  const roleBadgeColor: Record<UserRole, string> = {
    staff: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    admin: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    developer: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400',
  }

  const switcher = (
    <button
      type="button"
      onClick={cycle}
      className={cn(
        'flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-all duration-200',
        'hover:bg-muted w-full',
        collapsed ? 'justify-center' : '',
      )}
      title={`Tukar peranan: ${config.label}`}
    >
      <div className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold',
        roleBadgeColor[userRole],
      )}>
        {userRole === 'staff' ? 'S' : userRole === 'admin' ? 'A' : 'D'}
      </div>
      <div className={cn(
        'flex flex-col overflow-hidden transition-all duration-300',
        collapsed ? 'max-h-0 max-w-0 opacity-0' : 'max-h-10 max-w-[160px] opacity-100',
      )}>
        <span className="text-[10px] font-semibold whitespace-nowrap" style={{ color: BRAND_COLOR }}>
          Peranan: {config.label}
        </span>
        <span className="text-[9px] text-muted-foreground whitespace-nowrap">{config.description}</span>
      </div>
    </button>
  )

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{switcher}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8} className="text-xs">
          <div className="font-semibold" style={{ color: BRAND_COLOR }}>Peranan: {config.label}</div>
          <div className="text-muted-foreground">Klik untuk tukar</div>
        </TooltipContent>
      </Tooltip>
    )
  }
  return switcher
}

// ═══════════════════════════════════════════════════════════════════════════════
// SidebarFooter — Org info + role switcher
// ═══════════════════════════════════════════════════════════════════════════════

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn('px-4 py-3 transition-all duration-300', collapsed ? 'flex flex-col items-center gap-2' : 'space-y-2')}>
      <RoleSwitcher collapsed={collapsed} />
      <Separator className="bg-border/40" />
      <div className={cn(
        'flex items-center gap-3 transition-all duration-300 ease-in-out overflow-hidden',
        collapsed ? 'justify-center' : '',
      )}>
        <div className={cn(
          'flex shrink-0 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/40',
          collapsed ? 'h-7 w-7' : 'h-8 w-8',
        )}>
          <Image src="/puspa-logo-official.png" alt="PUSPA" width={collapsed ? 16 : 20} height={collapsed ? 16 : 20} className="object-contain" />
        </div>
        <div className={cn(
          'flex flex-col gap-0.5 overflow-hidden transition-all duration-300',
          collapsed ? 'max-h-0 max-w-0 opacity-0' : 'max-h-10 max-w-[180px] opacity-100',
        )}>
          <span className="text-[11px] font-semibold whitespace-nowrap" style={{ color: BRAND_COLOR }}>PUSPA KL & Selangor</span>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">v3.0.0</span>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// NavGroupRenderer — One section of nav items
// ═══════════════════════════════════════════════════════════════════════════════

function NavGroupRenderer({
  group,
  currentView,
  onNavigate,
  collapsed,
  isLastGroup,
}: {
  group: NavGroup
  currentView: ViewId
  onNavigate: (id: ViewId) => void
  collapsed: boolean
  isLastGroup: boolean
}) {
  return (
    <div className={cn(collapsed ? 'px-2' : 'px-2.5')}>
      <NavSectionLabel title={group.title} collapsed={collapsed} />
      {group.subGroup && <NavSubGroupLabel label={group.subGroup} collapsed={collapsed} />}
      <div className="flex flex-col gap-0.5">
        {group.items.map((item) => (
          <NavItemButton
            key={item.id}
            item={item}
            isActive={currentView === item.id}
            onClick={() => onNavigate(item.id)}
            collapsed={collapsed}
          />
        ))}
      </div>
      {!isLastGroup && (
        <div className={cn('my-2 transition-all duration-300', collapsed ? 'mx-auto w-6' : 'w-full')}>
          <Separator className="bg-border/40" />
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SidebarContent — Shared inner layout (Sheet + aside)
// ═══════════════════════════════════════════════════════════════════════════════

function SidebarContent({
  onNavigate,
  onClose,
  collapsed,
}: {
  onNavigate: (id: ViewId) => void
  onClose?: () => void
  collapsed?: boolean
}) {
  const currentView = useAppStore((s) => s.currentView)
  const userRole = useAppStore((s) => s.userRole)

  const handleNavigate = (id: ViewId) => {
    onNavigate(id)
    onClose?.()
  }

  const isCollapsed = !!collapsed
  const visibleGroups = getVisibleGroups(userRole)

  return (
    <TooltipProvider delayDuration={300}>
      <div className="relative flex h-full flex-col bg-card overflow-hidden">
        <SidebarBrand collapsed={isCollapsed} />

        <Separator className="mx-4" />

        {/* Navigation */}
        <ScrollArea className="flex-1 py-1 min-h-0">
          <nav className="flex flex-col gap-0" aria-label="Navigasi utama">
            {visibleGroups.map((group, idx) => (
              <NavGroupRenderer
                key={group.title}
                group={group}
                currentView={currentView as ViewId}
                onNavigate={handleNavigate}
                collapsed={isCollapsed}
                isLastGroup={idx === visibleGroups.length - 1}
              />
            ))}
          </nav>
        </ScrollArea>

        <Separator className="mx-4" />
        <SidebarFooter collapsed={isCollapsed} />
      </div>
    </TooltipProvider>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// useIsDesktop hook
// ═══════════════════════════════════════════════════════════════════════════════

function useIsDesktop() {
  const mq = typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)') : null
  return useSyncExternalStore(
    useCallback((cb) => { mq?.addEventListener('change', cb); return () => mq?.removeEventListener('change', cb) }, [mq]),
    () => mq?.matches ?? false,
    () => false,
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// AppSidebar — Main export
// ═══════════════════════════════════════════════════════════════════════════════

export function AppSidebar() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen)
  const setView = useAppStore((s) => s.setView)
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const isDesktop = useIsDesktop()

  useEffect(() => {
    if (isDesktop) setSidebarOpen(false)
  }, [isDesktop, setSidebarOpen])

  const expanded = !isCollapsed || (isCollapsed && isHovered)

  return (
    <>
      {/* Mobile/Tablet Sheet (< 1024px) */}
      {!isDesktop && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-[280px] p-0" aria-describedby={undefined}>
            <SidebarContent onNavigate={setView} onClose={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop aside (>= 1024px) */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden border-r border-border bg-card',
          'lg:flex lg:flex-col lg:transition-all lg:duration-300 lg:ease-in-out',
          expanded ? `lg:w-[${SIDEBAR_EXPANDED_WIDTH}px]` : `lg:w-[${SIDEBAR_COLLAPSED_WIDTH}px]`,
        )}
        style={{ width: expanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Sidebar navigasi"
      >
        <SidebarContent onNavigate={setView} collapsed={!expanded} />

        {/* Collapse toggle (visible when expanded) */}
        {expanded && isCollapsed && (
          <div className="absolute right-2 top-4 hidden lg:flex">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80"
              onClick={() => setIsHovered(false)}
              aria-label="Tutup sidebar"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* Pin expand button (visible when collapsed) */}
        {!expanded && (
          <div className="absolute -right-3 top-7 z-50 hidden lg:flex">
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6 rounded-full border bg-background shadow-md transition-all duration-200 hover:bg-muted"
              onClick={() => setIsCollapsed(false)}
              aria-label="Pin buka sidebar"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Collapse to icon button (visible when pinned open) */}
        {expanded && !isCollapsed && (
          <div className="absolute right-2 top-4 hidden lg:flex">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80"
              onClick={() => setIsCollapsed(true)}
              aria-label="Kecilkan sidebar"
            >
              <ChevronRight className="h-3.5 w-3.5 rotate-180" />
            </Button>
          </div>
        )}
      </aside>

      {/* Mobile hamburger trigger */}
      {!isDesktop && !sidebarOpen && (
        <div className="fixed top-3 left-3 z-40 lg:hidden">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg shadow-sm bg-background">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Buka menu</span>
              </Button>
            </SheetTrigger>
          </Sheet>
        </div>
      )}
    </>
  )
}

export default AppSidebar
