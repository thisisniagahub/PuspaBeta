import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'staff' | 'admin' | 'developer'

interface AppState {
  currentView: string
  sidebarOpen: boolean
  commandPaletteOpen: boolean
  userRole: UserRole
  onboardingDone: boolean
  setView: (view: string) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setCommandPaletteOpen: (open: boolean) => void
  setUserRole: (role: UserRole) => void
  setOnboardingDone: (done: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentView: 'dashboard',
      sidebarOpen: false,
      commandPaletteOpen: false,
      userRole: 'admin',
      onboardingDone: false,
      setView: (view) => set({ currentView: view }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setUserRole: (role) => set({ userRole: role }),
      setOnboardingDone: (done) => set({ onboardingDone: done }),
    }),
    {
      name: 'puspa-app-state',
      partialize: (state) => ({ userRole: state.userRole, onboardingDone: state.onboardingDone }),
    }
  )
)
