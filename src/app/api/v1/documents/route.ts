import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const documentSchema = z.object({
  title: z.string().min(1, 'Tajuk diperlukan'),
  description: z.string().optional(),
  category: z.string().min(1, 'Kategori diperlukan'),
  subcategory: z.string().optional(),
  fileName: z.string().min(1, 'Nama fail diperlukan'),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
  fileUrl: z.string().optional(),
  version: z.number().optional(),
  status: z.string().optional(),
  uploadedBy: z.string().optional(),
  expiryDate: z.string().optional(),
  tags: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = { status: { not: 'deleted' } }
    if (category) where.category = category
    if (status) where.status = status
    if (search) where.title = { contains: search }

    const [documents, total] = await Promise.all([
      db.document.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.document.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: { documents, total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Documents GET error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan dokumen' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = documentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues.map(e => e.message).join(', ') }, { status: 400 })
    }

    const data = parsed.data
    const document = await db.document.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        subcategory: data.subcategory,
        fileName: data.fileName,
        fileSize: data.fileSize ?? 0,
        mimeType: data.mimeType,
        fileUrl: data.fileUrl,
        version: data.version ?? 1,
        status: data.status ?? 'active',
        uploadedBy: data.uploadedBy,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        tags: data.tags,
      },
    })

    return NextResponse.json({ success: true, data: document }, { status: 201 })
  } catch (error) {
    console.error('Documents POST error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mencipta dokumen' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updateData } = body
    if (!id) return NextResponse.json({ success: false, error: 'ID diperlukan' }, { status: 400 })

    const existing = await db.document.findFirst({ where: { id, status: { not: 'deleted' } } })
    if (!existing) return NextResponse.json({ success: false, error: 'Dokumen tidak dijumpai' }, { status: 404 })

    if (updateData.expiryDate) updateData.expiryDate = new Date(updateData.expiryDate)

    const document = await db.document.update({ where: { id }, data: updateData })
    return NextResponse.json({ success: true, data: document })
  } catch (error) {
    console.error('Documents PUT error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mengemaskini dokumen' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID diperlukan' }, { status: 400 })

    const existing = await db.document.findFirst({ where: { id, status: { not: 'deleted' } } })
    if (!existing) return NextResponse.json({ success: false, error: 'Dokumen tidak dijumpai' }, { status: 404 })

    const document = await db.document.update({ where: { id }, data: { status: 'deleted' } })
    return NextResponse.json({ success: true, data: document })
  } catch (error) {
    console.error('Documents DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memadam dokumen' }, { status: 500 })
  }
}
