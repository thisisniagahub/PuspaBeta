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

const CATEGORY_MAP: Record<string, string> = {
  '1': 'fakir',
  '2': 'miskin',
  '3': 'ibnu-sabil',
  '4': 'riqab',
  '5': 'gharim',
  '6': 'gharimin',
  '7': 'mualaf',
  '8': 'amil',
  fakir: 'fakir',
  miskin: 'miskin',
  'ibnu-sabil': 'ibnu-sibil',
  'ibnu sabil': 'ibnu-sibil',
  riqab: 'riqab',
  gharim: 'gharim',
  gharimin: 'gharimin',
  mualaf: 'mualaf',
  amil: 'amil',
}

function validateStep(stepKey: string, message: string): { valid: boolean; value: unknown; error?: string } {
  switch (stepKey) {
    case 'greeting': {
      const name = message.trim()
      if (name.length < 2) return { valid: false, value: null, error: 'Nama terlalu pendek (min 2 aksara)' }
      return { valid: true, value: name }
    }
    case 'ic_number': {
      const ic = message.replace(/[-\s]/g, '')
      if (!/^\d{12}$/.test(ic)) return { valid: false, value: null, error: 'Nombor IC tidak sah (12 digit tanpa dash)' }
      return { valid: true, value: ic }
    }
    case 'phone': {
      const phone = message.replace(/[-\s]/g, '')
      if (!/^(\+?6?01\d{7,9})$/.test(phone) && !/^\d{10,11}$/.test(phone)) {
        return { valid: false, value: null, error: 'Nombor telefon tidak sah' }
      }
      return { valid: true, value: phone }
    }
    case 'category': {
      const cat = message.trim().toLowerCase()
      const mapped = CATEGORY_MAP[cat]
      if (!mapped) return { valid: false, value: null, error: 'Kategori tidak sah. Sila pilih 1-8 atau taip nama kategori.' }
      return { valid: true, value: mapped }
    }
    case 'monthly_income': {
      const income = parseFloat(message.replace(/[^\d.]/g, ''))
      if (isNaN(income) || income < 0) return { valid: false, value: null, error: 'Pendapatan tidak sah. Sila masukkan angka.' }
      return { valid: true, value: income }
    }
    case 'dependents': {
      const dep = parseInt(message.replace(/[^\d]/g, ''))
      if (isNaN(dep) || dep < 0) return { valid: false, value: null, error: 'Bilangan tanggungan tidak sah' }
      return { valid: true, value: dep }
    }
    case 'shelter': {
      const lower = message.trim().toLowerCase()
      if (['ya', 'yes', 'y', 'ada'].includes(lower)) return { valid: true, value: true }
      if (['tidak', 'no', 'n', 'tak', 'tiada'].includes(lower)) return { valid: true, value: false }
      return { valid: false, value: null, error: 'Sila jawab ya atau tidak' }
    }
    case 'confirm': {
      const lower = message.trim().toLowerCase()
      if (['ya', 'yes', 'y', 'sah', 'sahkan', 'confirm'].includes(lower)) return { valid: true, value: true }
      if (['tidak', 'no', 'n', 'batal'].includes(lower)) return { valid: true, value: false }
      return { valid: false, value: null, error: 'Sila jawab ya atau tidak' }
    }
    default:
      return { valid: false, value: null, error: 'Langkah tidak dikenali' }
  }
}

async function generateMemberNumber(): Promise<string> {
  const lastMember = await db.member.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { memberNumber: true },
  })

  let nextNum = 1
  if (lastMember?.memberNumber) {
    const match = lastMember.memberNumber.match(/PUSPA-(\d+)/)
    if (match) nextNum = parseInt(match[1]) + 1
  }

  return `PUSPA-${String(nextNum).padStart(4, '0')}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, message } = body

    if (!sessionId || !message) {
      return Response.json(
        { success: false, error: 'ID sesi dan mesej diperlukan' },
        { status: 400 }
      )
    }

    const session = await db.onboardingSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      return Response.json(
        { success: false, error: 'Sesi onboarding tidak dijumpai' },
        { status: 404 }
      )
    }

    if (session.status !== 'active') {
      return Response.json(
        { success: false, error: `Sesi sudah ${session.status}` },
        { status: 400 }
      )
    }

    // Check expiry
    if (session.expiresAt && new Date() > session.expiresAt) {
      await db.onboardingSession.update({
        where: { id: sessionId },
        data: { status: 'expired' },
      })
      return Response.json(
        { success: false, error: 'Sesi sudah tamat tempoh' },
        { status: 400 }
      )
    }

    const currentStep = session.currentStep
    const stepConfig = ONBOARDING_STEPS[currentStep]

    if (!stepConfig) {
      return Response.json(
        { success: false, error: 'Semua langkah sudah selesai' },
        { status: 400 }
      )
    }

    // Validate input
    const validation = validateStep(stepConfig.key, message)
    if (!validation.valid) {
      return Response.json({
        success: false,
        error: validation.error,
        currentStep,
        question: stepConfig.question,
        stepKey: stepConfig.key,
      })
    }

    // Update session data
    const sessionData = JSON.parse(session.data || '{}')
    sessionData[stepConfig.key] = validation.value

    const nextStep = currentStep + 1
    const isComplete = nextStep >= ONBOARDING_STEPS.length

    // Special handling for confirm step
    if (stepConfig.key === 'confirm' && validation.value === false) {
      // User rejected - restart from beginning
      await db.onboardingSession.update({
        where: { id: sessionId },
        data: {
          currentStep: 0,
          data: JSON.stringify({}),
        },
      })
      return Response.json({
        success: true,
        data: {
          currentStep: 0,
          question: ONBOARDING_STEPS[0].question,
          stepKey: ONBOARDING_STEPS[0].key,
          restarted: true,
        },
      })
    }

    if (isComplete || (stepConfig.key === 'confirm' && validation.value === true)) {
      // Onboarding complete - create Member
      const memberNumber = await generateMemberNumber()

      const member = await db.member.create({
        data: {
          memberNumber,
          name: String(sessionData.greeting || session.name || 'Tidak diketahui'),
          ic: String(sessionData.ic_number || session.icNumber || '000000000000'),
          phone: String(sessionData.phone || session.phone || '0000000000'),
          email: null,
          address: 'Akan diisi',
          monthlyIncome: Number(sessionData.monthly_income || 0),
          householdSize: Number(sessionData.dependents || 1) + 1,
          status: 'active',
          notes: `Kategori asnaf: ${sessionData.category || 'miskin'}. Tempat tinggal: ${sessionData.shelter ? 'Ada' : 'Tiada'}. Daftar melalui onboarding ${session.channel}.`,
        },
      })

      await db.onboardingSession.update({
        where: { id: sessionId },
        data: {
          currentStep: nextStep,
          data: JSON.stringify(sessionData),
          status: 'completed',
          memberId: member.id,
          completedAt: new Date(),
        },
      })

      return Response.json({
        success: true,
        data: {
          completed: true,
          member: {
            id: member.id,
            memberNumber: member.memberNumber,
            name: member.name,
          },
          message: `Pendaftaran berjaya! No. ahli anda: ${member.memberNumber}. Kami akan menghubungi anda tidak lama lagi.`,
        },
      })
    }

    // Move to next step
    const updatedSession = await db.onboardingSession.update({
      where: { id: sessionId },
      data: {
        currentStep: nextStep,
        data: JSON.stringify(sessionData),
        name: String(sessionData.greeting || session.name || session.name),
        phone: String(sessionData.phone || session.phone || session.phone),
        icNumber: String(sessionData.ic_number || session.icNumber || session.icNumber),
      },
    })

    const nextStepConfig = ONBOARDING_STEPS[nextStep]

    // Build confirmation message for the last step
    let question = nextStepConfig.question
    if (nextStepConfig.key === 'confirm') {
      question = `Sila sahkan maklumat anda:\n\nNama: ${sessionData.greeting || '-'}\nNo. IC: ${sessionData.ic_number || '-'}\nTelefon: ${sessionData.phone || '-'}\nKategori: ${sessionData.category || '-'}\nPendapatan: RM${sessionData.monthly_income || 0}\nTanggungan: ${sessionData.dependents || 0}\nTempat tinggal: ${sessionData.shelter ? 'Ada' : 'Tiada'}\n\nTaip "ya" untuk sahkan atau "tidak" untuk mula semula.`
    }

    return Response.json({
      success: true,
      data: {
        session: {
          ...updatedSession,
          data: JSON.parse(updatedSession.data),
        },
        currentStep: nextStep,
        question,
        stepKey: nextStepConfig.key,
        totalSteps: ONBOARDING_STEPS.length,
      },
    })
  } catch (error) {
    console.error('Onboarding process error:', error)
    return Response.json(
      { success: false, error: 'Ralat memproses langkah onboarding' },
      { status: 500 }
    )
  }
}
