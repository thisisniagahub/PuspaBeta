import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

// Category weights for asnaf scoring
const CATEGORY_WEIGHTS: Record<string, number> = {
  fakir: 15,
  miskin: 12,
  'ibnu-sabil': 12,
  riqab: 10,
  gharim: 8,
  gharimin: 8,
  mualaf: 7,
  amil: 5,
}

function calculatePriority(score: number): string {
  if (score >= 70) return 'P1'
  if (score >= 50) return 'P2'
  if (score >= 30) return 'P3'
  if (score >= 15) return 'P4'
  return 'P5'
}

function calculateScore(data: {
  monthlyIncome: number
  dependents: number
  hasShelter: boolean
  hasChronicIllness: boolean
  isEmergency: boolean
  category: string
}): { score: number; breakdown: string[] } {
  let score = 0
  const breakdown: string[] = []

  // Income scoring
  if (data.monthlyIncome === 0) {
    score += 40
    breakdown.push('Tiada pendapatan: +40')
  } else if (data.monthlyIncome < 500) {
    score += 30
    breakdown.push('Pendapatan < RM500: +30')
  } else if (data.monthlyIncome < 1000) {
    score += 20
    breakdown.push('Pendapatan < RM1000: +20')
  }

  // Dependents scoring
  if (data.dependents >= 5) {
    score += 20
    breakdown.push('Tanggungan >= 5: +20')
  } else if (data.dependents >= 3) {
    score += 10
    breakdown.push('Tanggungan >= 3: +10')
  }

  // Shelter scoring
  if (!data.hasShelter) {
    score += 20
    breakdown.push('Tiada tempat tinggal: +20')
  }

  // Chronic illness scoring
  if (data.hasChronicIllness) {
    score += 15
    breakdown.push('Penyakit kronik: +15')
  }

  // Emergency scoring
  if (data.isEmergency) {
    score += 10
    breakdown.push('Kecemasan: +10')
  }

  // Category weight
  const catWeight = CATEGORY_WEIGHTS[data.category] || 5
  score += catWeight
  breakdown.push(`Kategori ${data.category}: +${catWeight}`)

  return { score, breakdown }
}

function suggestProgramme(priority: string, category: string): string {
  if (priority === 'P1' || priority === 'P2') {
    return `Bantuan kecemasan ${category} - keutamaan tinggi`
  }
  if (category === 'fakir' || category === 'miskin') {
    return 'Program bantuan asas makanan & keperluan'
  }
  if (category === 'ibnu-sibil') {
    return 'Program bantuan perjalanan & perhubungan'
  }
  if (category === 'gharim' || category === 'gharimin') {
    return 'Program penyelesaian hutang & bantuan kewangan'
  }
  return 'Program bantuan umum asnaf'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      caseId,
      monthlyIncome,
      dependents,
      hasShelter,
      hasChronicIllness,
      isEmergency,
      category,
    } = body

    if (!caseId) {
      return Response.json(
        { success: false, error: 'ID kes diperlukan' },
        { status: 400 }
      )
    }

    // Check if case exists
    const existingCase = await db.case.findUnique({ where: { id: caseId } })
    if (!existingCase) {
      return Response.json(
        { success: false, error: 'Kes tidak dijumpai' },
        { status: 404 }
      )
    }

    // Calculate score
    const { score, breakdown } = calculateScore({
      monthlyIncome: Number(monthlyIncome) || 0,
      dependents: Number(dependents) || 0,
      hasShelter: Boolean(hasShelter),
      hasChronicIllness: Boolean(hasChronicIllness),
      isEmergency: Boolean(isEmergency),
      category: category || 'miskin',
    })

    const priority = calculatePriority(score)
    const suggestedProgramme = suggestProgramme(priority, category || 'miskin')

    // Check for existing triage result
    const existing = await db.triageResult.findUnique({ where: { caseId } })

    let triageResult
    if (existing) {
      triageResult = await db.triageResult.update({
        where: { caseId },
        data: {
          priority,
          score,
          reason: breakdown.join('; '),
          suggestedProgramme,
          triagedBy: 'ai-agent',
          triagedAt: new Date(),
        },
      })
    } else {
      triageResult = await db.triageResult.create({
        data: {
          caseId,
          priority,
          score,
          reason: breakdown.join('; '),
          suggestedProgramme,
          triagedBy: 'ai-agent',
        },
      })
    }

    // Also update the case priority
    await db.case.update({
      where: { id: caseId },
      data: {
        priority:
          priority === 'P1' || priority === 'P2'
            ? 'urgent'
            : priority === 'P3'
              ? 'high'
              : 'normal',
      },
    })

    return Response.json({
      success: true,
      data: triageResult,
      meta: { score, priority, breakdown, suggestedProgramme },
    })
  } catch (error) {
    console.error('Auto-triage error:', error)
    return Response.json(
      { success: false, error: 'Ralat semasa proses triage' },
      { status: 500 }
    )
  }
}
