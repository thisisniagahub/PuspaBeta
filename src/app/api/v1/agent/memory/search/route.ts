import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, keyword } = body

    if (!userId || !keyword) {
      return Response.json(
        { success: false, error: 'ID pengguna dan kata kunci diperlukan' },
        { status: 400 }
      )
    }

    // Search by keyword in content field
    const memories = await db.agentMemory.findMany({
      where: {
        userId,
        content: { contains: keyword },
      },
      orderBy: { lastAccessed: 'desc' },
      take: 20,
    })

    // Update access count for found memories
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

    return Response.json({
      success: true,
      data: memories,
      meta: { userId, keyword, total: memories.length },
    })
  } catch (error) {
    console.error('Search agent memory error:', error)
    return Response.json(
      { success: false, error: 'Ralat mencari ingatan ejen' },
      { status: 500 }
    )
  }
}
