import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return Response.json(
        { success: false, error: 'ID pengguna diperlukan' },
        { status: 400 }
      )
    }

    const memories = await db.agentMemory.findMany({
      where: { userId },
      orderBy: { lastAccessed: 'desc' },
    })

    // Group by category
    const grouped: Record<string, typeof memories> = {}
    for (const memory of memories) {
      if (!grouped[memory.category]) grouped[memory.category] = []
      grouped[memory.category].push(memory)
    }

    // Generate MEMORY.md context
    const lines: string[] = []
    lines.push(`# MEMORY.md — Pengguna: ${userId}`)
    lines.push(`# Dijana pada: ${new Date().toISOString()}`)
    lines.push(`# Jumlah ingatan: ${memories.length}`)
    lines.push('')

    const categoryLabels: Record<string, string> = {
      personal: '📋 Maklumat Peribadi',
      case: '📁 Kes & Bantuan',
      programme: '🏠 Program',
      donation: '💰 Derma & Sumbangan',
      preference: '⚙️ Keutamaan',
    }

    for (const [category, categoryMemories] of Object.entries(grouped)) {
      const label = categoryLabels[category] || category
      lines.push(`## ${label}`)
      lines.push('')

      for (const memory of categoryMemories) {
        const confidence = memory.confidence < 0.5 ? '⚠️' : memory.confidence < 0.8 ? '🟡' : '🟢'
        lines.push(`- ${confidence} [${memory.source}] ${memory.content}`)
        if (memory.accessCount > 5) {
          lines.push(`  _(diakses ${memory.accessCount} kali)_`)
        }
      }
      lines.push('')
    }

    // Summary stats
    lines.push('---')
    lines.push('')
    lines.push('## Ringkasan')
    lines.push(`- Jumlah ingatan: ${memories.length}`)
    lines.push(`- Kategori: ${Object.keys(grouped).join(', ')}`)
    lines.push(
      `- Keyakinan purata: ${(memories.reduce((sum, m) => sum + m.confidence, 0) / (memories.length || 1)).toFixed(2)}`
    )
    lines.push(
      `- Sumber: ${[...new Set(memories.map((m) => m.source))].join(', ')}`
    )

    const memoryMd = lines.join('\n')

    return Response.json({
      success: true,
      data: {
        userId,
        totalMemories: memories.length,
        categories: Object.keys(grouped),
        memoryMd,
      },
    })
  } catch (error) {
    console.error('Generate memory context error:', error)
    return Response.json(
      { success: false, error: 'Ralat menjana konteks ingatan' },
      { status: 500 }
    )
  }
}
