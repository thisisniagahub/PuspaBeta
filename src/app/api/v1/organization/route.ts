import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const orgSchema = z.object({
  legalName: z.string().optional(),
  tradeName: z.string().optional(),
  registrationType: z.string().optional(),
  registrationNumber: z.string().optional(),
  foundedDate: z.string().optional(),
  registeredAddress: z.string().optional(),
  operatingAddress: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  bankVerified: z.boolean().optional(),
  lhdnApprovalRef: z.string().optional(),
  lhdnApprovalExpiry: z.string().optional(),
  isTaxExempt: z.boolean().optional(),
  rosCertificateUrl: z.string().optional(),
  constitutionUrl: z.string().optional(),
  logoUrl: z.string().optional(),
  missionStatement: z.string().optional(),
  visionStatement: z.string().optional(),
})

export async function GET() {
  try {
    let org = await db.organizationProfile.findFirst()
    if (!org) {
      org = await db.organizationProfile.create({
        data: { legalName: 'Pertubuhan Urus Peduli Asnaf' },
      })
    }
    return NextResponse.json({ success: true, data: org })
  } catch (error) {
    console.error('Organization GET error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan profil pertubuhan' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = orgSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues.map(e => e.message).join(', ') }, { status: 400 })
    }

    const data = parsed.data
    if (data.foundedDate) data.foundedDate = new Date(data.foundedDate) as unknown as string
    if (data.lhdnApprovalExpiry) data.lhdnApprovalExpiry = new Date(data.lhdnApprovalExpiry) as unknown as string

    let org = await db.organizationProfile.findFirst()
    if (!org) {
      org = await db.organizationProfile.create({ data: data as Parameters<typeof db.organizationProfile.create>[0]['data'] })
    } else {
      org = await db.organizationProfile.update({ where: { id: org.id }, data })
    }

    return NextResponse.json({ success: true, data: org })
  } catch (error) {
    console.error('Organization PUT error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mengemaskini profil pertubuhan' }, { status: 500 })
  }
}
