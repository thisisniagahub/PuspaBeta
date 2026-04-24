export interface OpenClawSnapshot {
  gateway: { status: string; uptime: number; version: string }
  channels: Array<{ id: string; type: string; status: string; connected: boolean }>
  models: Array<{ id: string; name: string; provider: string; status: string }>
  agents: Array<{ id: string; name: string; status: string; tasks: number }>
  automation: { enabled: boolean; activeJobs: number; lastRun: string | null }
  plugins: Array<{ id: string; name: string; version: string; enabled: boolean }>
  mcpServers: Array<{ id: string; name: string; url: string; status: string }>
}

export interface OpenClawStatus {
  connected: boolean
  latency: number
  version: string | null
  error?: string
}

const BRIDGE_URL = process.env.OPENCLAW_BRIDGE_URL || 'https://operator.gangniaga.my/puspa-bridge'

export async function fetchOpenClawSnapshot(): Promise<OpenClawSnapshot> {
  const res = await fetch(`${BRIDGE_URL}/api/snapshot`)
  if (!res.ok) throw new Error('Failed to fetch OpenClaw snapshot')
  return res.json()
}

export async function fetchOpenClawStatus(): Promise<OpenClawStatus> {
  const start = Date.now()
  try {
    const res = await fetch(`${BRIDGE_URL}/api/health`, { signal: AbortSignal.timeout(5000) })
    return { connected: res.ok, latency: Date.now() - start, version: res.headers.get('x-version') || null }
  } catch (e) {
    return { connected: false, latency: Date.now() - start, version: null, error: (e as Error).message }
  }
}
