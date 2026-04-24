import { db } from '@/lib/db'

// Asnaf categories with urgency weights
const ASNAF_CATEGORIES = [
  { key: 'fakir', label: 'Fakir', weight: 1.0, description: 'Tiada harta & pendapatan' },
  { key: 'miskin', label: 'Miskin', weight: 0.9, description: 'Pendapatan tidak cukup keperluan asas' },
  { key: 'ibnu-sabil', label: 'Ibnu Sabil', weight: 0.7, description: 'Musafir terputus jalan' },
  { key: 'riqab', label: 'Riqab', weight: 0.6, description: 'Hamba yang ingin memerdekakan diri' },
  { key: 'gharim', label: 'Gharim', weight: 0.8, description: 'Terlilit hutang' },
  { key: 'gharimin', label: 'Gharimin', weight: 0.8, description: 'Terlilit hutang untuk kebaikan' },
  { key: 'mualaf', label: 'Mualaf', weight: 0.5, description: 'Saudara baru Islam' },
  { key: 'amil', label: 'Amil', weight: 0.3, description: 'Pengurus zakat' },
]

export async function GET() {
  try {
    // Count members by category (from notes field since category isn't a direct field)
    const members = await db.member.findMany({
      where: { isDeleted: false, status: 'active' },
      select: { notes: true, monthlyIncome: true, householdSize: true },
    })

    // Categorize members based on notes
    const categoryCounts: Record<string, number> = {}
    for (const cat of ASNAF_CATEGORIES) {
      categoryCounts[cat.key] = members.filter(
        (m) => m.notes?.toLowerCase().includes(cat.key) || m.notes?.toLowerCase().includes(cat.label.toLowerCase())
      ).length
    }

    // Ensure minimum values for calculation
    const totalMembers = members.length || 1
    for (const cat of ASNAF_CATEGORIES) {
      categoryCounts[cat.key] = Math.max(categoryCounts[cat.key], 1)
    }

    // Calculate demand (proportion of members)
    const totalDemand = Object.values(categoryCounts).reduce((sum, c) => sum + c, 0)

    // Calculate weighted allocation
    const totalWeight = ASNAF_CATEGORIES.reduce(
      (sum, cat) => sum + cat.weight * categoryCounts[cat.key],
      0
    )

    // Get available fund
    const totalFunds = await db.donation.aggregate({
      _sum: { amount: true },
      where: { status: 'confirmed', isDeleted: false },
    })
    const availableFund = totalFunds._sum.amount || 50000

    // Calculate distribution per category
    const distribution = ASNAF_CATEGORIES.map((cat) => {
      const demand = categoryCounts[cat.key] / totalDemand
      const urgency = cat.weight
      const weightedScore = demand * urgency
      const allocation = (weightedScore / totalWeight) * availableFund

      return {
        category: cat.key,
        label: cat.label,
        description: cat.description,
        demand: Math.round(demand * 100) / 100,
        urgency,
        weightedScore: Math.round(weightedScore * 1000) / 1000,
        recommendedAllocation: Math.round(allocation * 100) / 100,
        memberCount: categoryCounts[cat.key],
      }
    }).sort((a, b) => b.weightedScore - a.weightedScore)

    // Save prediction
    await db.predictionData.create({
      data: {
        modelType: 'distribution_optimizer',
        period: new Date().toISOString().slice(0, 7),
        inputSnapshot: JSON.stringify({ totalMembers, availableFund, categoryCounts }),
        prediction: JSON.stringify(distribution),
        confidence: 0.75,
      },
    })

    return Response.json({
      success: true,
      data: {
        availableFund: Math.round(availableFund * 100) / 100,
        totalMembers,
        distribution,
      },
    })
  } catch (error) {
    console.error('Predictive distribution error:', error)
    return Response.json(
      { success: false, error: 'Ralat mengira pengagihan optimum' },
      { status: 500 }
    )
  }
}
