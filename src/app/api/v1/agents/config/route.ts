import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const isActive = searchParams.get('isActive')

    const where: Record<string, unknown> = {}
    if (role) where.role = role
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    const configs = await db.agentConfig.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return Response.json({
      success: true,
      data: configs.map((c) => ({
        ...c,
        channels: JSON.parse(c.channels),
        skills: JSON.parse(c.skills),
      })),
    })
  } catch (error) {
    console.error('List agent configs error:', error)
    return Response.json(
      { success: false, error: 'Ralat memuat konfigurasi ejen' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      displayName,
      role,
      description,
      model,
      channels,
      skills,
      systemPrompt,
      memoryEnabled,
      maxTokens,
      temperature,
    } = body

    if (!name || !displayName || !role) {
      return Response.json(
        { success: false, error: 'Nama, nama paparan dan peranan diperlukan' },
        { status: 400 }
      )
    }

    // Check uniqueness
    const existing = await db.agentConfig.findUnique({ where: { name } })
    if (existing) {
      return Response.json(
        { success: false, error: 'Nama ejen sudah wujud' },
        { status: 409 }
      )
    }

    const validRoles = ['kewangan', 'operasi', 'compliance', 'asnaf']
    if (!validRoles.includes(role)) {
      return Response.json(
        { success: false, error: `Peranan tidak sah: ${role}. Sah: ${validRoles.join(', ')}` },
        { status: 400 }
      )
    }

    const config = await db.agentConfig.create({
      data: {
        name,
        displayName,
        role,
        description: description || null,
        model: model || 'glm-4',
        channels: JSON.stringify(channels || []),
        skills: JSON.stringify(skills || []),
        systemPrompt: systemPrompt || null,
        memoryEnabled: memoryEnabled !== undefined ? memoryEnabled : true,
        maxTokens: maxTokens || 4096,
        temperature: temperature !== undefined ? temperature : 0.7,
      },
    })

    return Response.json({
      success: true,
      data: {
        ...config,
        channels: JSON.parse(config.channels),
        skills: JSON.parse(config.skills),
      },
    })
  } catch (error) {
    console.error('Create agent config error:', error)
    return Response.json(
      { success: false, error: 'Ralat mencipta konfigurasi ejen' },
      { status: 500 }
    )
  }
}
