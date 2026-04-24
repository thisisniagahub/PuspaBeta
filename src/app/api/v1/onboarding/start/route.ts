import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

const ONBOARDING_STEPS = [
  { key: 'greeting', question: 'Salam! Apakah nama penuh anda?' },
  { key: 'ic_number', question: 'Sila masukkan nombor IC anda (tanpa dash):' },
  { key: 'phone', question: 'Apakah nombor telefon anda?' },
  {
    key: 'category',
    question:
      'Pilih kategori asnaf anda:\n1. Fakir\n2. Miskin\n3. Ibnu Sabil\n4. Riqab\n5. Gharim\n6. Gharimin\n7. Mualaf\n8. Amil\n\nSila taip nombor atau nama kategori:',
  },
  { key: 'monthly_income', question: 'Apakah pendapatan bulanan anda (RM)?' },
  { key: 'dependents', question: 'Berapa orang tanggungan anda?' },
  { key: 'shelter', question: 'Adakah anda mempunyai tempat tinggal? (ya/tidak)' },
  { key: 'confirm', question: 'Sila sahkan maklumat anda.' },
]

async function generateSessionNumber(): Promise<string> {
  const lastSession = await db.onboardingSession.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { sessionNumber: true },
  })

  let nextNum = 1
  if (lastSession?.sessionNumber) {
    const match = lastSession.sessionNumber.match(/OB-(\d+)/)
    if (match) nextNum = parseInt(match[1]) + 1
  }

  return `OB-${String(nextNum).padStart(4, '0')}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { channel, name, phone, icNumber } = body

    if (!channel) {
      return Response.json(
        { success: false, error: 'Saluran diperlukan' },
        { status: 400 }
      )
    }

    const validChannels = ['web', 'whatsapp', 'telegram']
    if (!validChannels.includes(channel)) {
      return Response.json(
        { success: false, error: `Saluran tidak sah: ${channel}` },
        { status: 400 }
      )
    }

    const sessionNumber = await generateSessionNumber()

    const sessionData: Record<string, unknown> = {}
    if (name) sessionData.name = name
    if (phone) sessionData.phone = phone
    if (icNumber) sessionData.icNumber = icNumber

    // Determine starting step based on pre-filled data
    let startStep = 0
    if (name && phone && icNumber) startStep = 3
    else if (name && phone) startStep = 2
    else if (name) startStep = 1

    const session = await db.onboardingSession.create({
      data: {
        sessionNumber,
        channel,
        currentStep: startStep,
        totalSteps: ONBOARDING_STEPS.length,
        data: JSON.stringify(sessionData),
        name: name || null,
        phone: phone || null,
        icNumber: icNumber || null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    })

    const firstQuestion = ONBOARDING_STEPS[startStep]

    return Response.json({
      success: true,
      data: {
        session: {
          ...session,
          data: JSON.parse(session.data),
        },
        currentStep: startStep,
        question: firstQuestion.question,
        stepKey: firstQuestion.key,
        totalSteps: ONBOARDING_STEPS.length,
      },
    })
  } catch (error) {
    console.error('Onboarding start error:', error)
    return Response.json(
      { success: false, error: 'Ralat memulakan sesi onboarding' },
      { status: 500 }
    )
  }
}
