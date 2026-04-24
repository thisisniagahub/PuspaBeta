import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const config = await db.agentConfig.findUnique({ where: { id } })

    if (!config) {
      return Response.json(
        { success: false, error: 'Konfigurasi ejen tidak dijumpai' },
        { status: 404 }
      )
    }

    return Response.json({
      success: true,
      data: {
        ...config,
        channels: JSON.parse(config.channels),
        skills: JSON.parse(config.skills),
      },
    })
  } catch (error) {
    console.error('Get agent config error:', error)
    return Response.json(
      { success: false, error: 'Ralat memuat konfigurasi ejen' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const existing = await db.agentConfig.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { success: false, error: 'Konfigurasi ejen tidak dijumpai' },
        { status: 404 }
      )
    }

    // If name is changing, check uniqueness
    if (name && name !== existing.name) {
      const nameExists = await db.agentConfig.findUnique({ where: { name } })
      if (nameExists) {
        return Response.json(
          { success: false, error: 'Nama ejen sudah wujud' },
          { status: 409 }
        )
      }
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (displayName !== undefined) updateData.displayName = displayName
    if (role !== undefined) updateData.role = role
    if (description !== undefined) updateData.description = description
    if (model !== undefined) updateData.model = model
    if (channels !== undefined) updateData.channels = JSON.stringify(channels)
    if (skills !== undefined) updateData.skills = JSON.stringify(skills)
    if (systemPrompt !== undefined) updateData.systemPrompt = systemPrompt
    if (memoryEnabled !== undefined) updateData.memoryEnabled = memoryEnabled
    if (maxTokens !== undefined) updateData.maxTokens = maxTokens
    if (temperature !== undefined) updateData.temperature = temperature

    const config = await db.agentConfig.update({
      where: { id },
      data: updateData,
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
    console.error('Update agent config error:', error)
    return Response.json(
      { success: false, error: 'Ralat mengemaskini konfigurasi ejen' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.agentConfig.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { success: false, error: 'Konfigurasi ejen tidak dijumpai' },
        { status: 404 }
      )
    }

    await db.agentConfig.delete({ where: { id } })

    return Response.json({
      success: true,
      message: 'Konfigurasi ejen berjaya dipadam',
    })
  } catch (error) {
    console.error('Delete agent config error:', error)
    return Response.json(
      { success: false, error: 'Ralat memadam konfigurasi ejen' },
      { status: 500 }
    )
  }
}
