import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const intentSchema = z.object({
  text: z.string().min(1, 'Teks diperlukan'),
})

const INTENT_MAP: Record<string, string> = {
  'senarai': 'inventory_lookup',
  'stok': 'inventory_lookup',
  'inventory': 'inventory_lookup',
  'laporan': 'report_list',
  'report': 'report_list',
  'kes': 'case_query',
  'case': 'case_query',
  'penderma': 'donor_summary',
  'donor': 'donor_summary',
  'sukarelawan': 'volunteer_list',
  'volunteer': 'volunteer_list',
  'peringatan': 'reminder_create',
  'reminder': 'reminder_create',
  'sambung': 'work_resume',
  'resume': 'work_resume',
  'papan pemuka': 'dashboard_generate',
  'dashboard': 'dashboard_generate',
  'mesej': 'message_reply',
  'message': 'message_reply',
}

const DOMAIN_MAP: Record<string, string> = {
  'inventory_lookup': 'inventory',
  'report_list': 'reports',
  'case_query': 'cases',
  'donor_summary': 'donors',
  'volunteer_list': 'volunteers',
  'reminder_create': 'reminders',
  'work_resume': 'continuity',
  'dashboard_generate': 'dashboard',
  'message_reply': 'messaging',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = intentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues.map(e => e.message).join(', ') }, { status: 400 })
    }

    const { text } = parsed.data
    const lowerText = text.toLowerCase()

    let intent = 'general'
    for (const [keyword, mappedIntent] of Object.entries(INTENT_MAP)) {
      if (lowerText.includes(keyword)) {
        intent = mappedIntent
        break
      }
    }

    const domain = DOMAIN_MAP[intent] || 'general'

    return NextResponse.json({
      success: true,
      data: { intent, domain, confidence: intent === 'general' ? 0.3 : 0.85, originalText: text },
    })
  } catch (error) {
    console.error('Ops intent error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mengklasifikasikan niat' }, { status: 500 })
  }
}
