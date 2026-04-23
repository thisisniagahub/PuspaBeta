import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

interface OpsState {
  activeTab: string
  messages: ChatMessage[]
  setActiveTab: (tab: string) => void
  addMessage: (msg: ChatMessage) => void
  clearMessages: () => void
}

export const useOpsStore = create<OpsState>()(
  persist(
    (set) => ({
      activeTab: 'chat',
      messages: [],
      setActiveTab: (tab) => set({ activeTab: tab }),
      addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'puspa-ops-state',
      partialize: (state) => ({ activeTab: state.activeTab, messages: state.messages }),
    }
  )
)
