export type ViewId =
  | 'dashboard' | 'members' | 'cases' | 'programmes' | 'donations'
  | 'disbursements' | 'compliance' | 'admin' | 'reports' | 'activities'
  | 'ai' | 'volunteers' | 'donors' | 'documents'
  | 'openclaw-mcp' | 'openclaw-plugins' | 'openclaw-integrations'
  | 'openclaw-terminal' | 'openclaw-agents' | 'openclaw-models' | 'openclaw-automation'
  | 'ekyc' | 'tapsecure' | 'sedekah-jumaat' | 'docs'
  | 'agihan-bulan' | 'ops-conductor'

export interface NavItem {
  id: ViewId
  label: string
  icon: string
  keywords?: string[]
  group: string
}

export interface DashboardStats {
  totalMembers: number
  activeProgrammes: number
  totalDonations: number
  activeVolunteers: number
  complianceScore: number
  trendMembers: number
  trendProgrammes: number
  trendDonations: number
  trendVolunteers: number
  trendCompliance: number
}

export interface MonthlyDonation {
  bulan: string
  zakat: number
  sadaqah: number
  waqf: number
  infaq: number
  general: number
}

export interface MemberCategory {
  name: string
  value: number
  color: string
}

export interface RecentActivity {
  id: string
  type: 'case' | 'donation' | 'member' | 'programme'
  title: string
  description: string
  timestamp: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
