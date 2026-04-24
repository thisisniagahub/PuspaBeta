import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const category = searchParams.get('category')

    if (!userId) {
      return Response.json(
        { success: false, error: 'ID pengguna diperlukan' },
        { status: 400 }
      )
    }

    const where: Record<string, unknown> = { userId }
    if (category) where.category = category

    const memories = await db.agentMemory.findMany({
      where,
      orderBy: { lastAccessed: 'desc' },
      take: 50,
    })

    // Update access count
    if (memories.length > 0) {
      await Promise.all(
        memories.map((m) =>
          db.agentMemory.update({
            where: { id: m.id },
            data: {
              accessCount: { increment: 1 },
              lastAccessed: new Date(),
            },
          })
        )
      )
    }

    return Response.json({
      success: true,
      data: memories,
      meta: { userId, total: memories.length },
    })
  } catch (error) {
    console.error('Get agent memory error:', error)
    return Response.json(
      { success: false, error: 'Ralat memuat ingatan ejen' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, category, content, source, confidence } = body

    if (!userId || !category || !content) {
      return Response.json(
        { success: false, error: 'ID pengguna, kategori dan kandungan diperlukan' },
        { status: 400 }
      )
    }

    const validCategories = ['personal', 'case', 'programme', 'donation', 'preference']
    if (!validCategories.includes(category)) {
      return Response.json(
        { success: false, error: `Kategori tidak sah: ${category}` },
        { status: 400 }
      )
    }

    const memory = await db.agentMemory.create({
      data: {
        userId,
        category,
        content,
        source: source || 'user',
        confidence: confidence !== undefined ? confidence : 1.0,
      },
    })

    return Response.json({ success: true, data: memory })
  } catch (error) {
    console.error('Save agent memory error:', error)
    return Response.json(
      { success: false, error: 'Ralat menyimpan ingatan ejen' },
      { status: 500 }
    )
  }
}
