import { db } from '@/lib/db'

export async function GET() {
  try {
    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1)

    // Gather data for the last 6 months
    const [
      totalCases,
      totalDonations,
      totalDisbursements,
      monthlyCases,
      monthlyDonations,
      monthlyDisbursements,
    ] = await Promise.all([
      db.case.count({
        where: { createdAt: { gte: sixMonthsAgo }, isDeleted: false },
      }),
      db.donation.findMany({
        where: {
          createdAt: { gte: sixMonthsAgo },
          isDeleted: false,
          status: 'confirmed',
        },
        select: { amount: true, createdAt: true },
      }),
      db.disbursement.findMany({
        where: {
          createdAt: { gte: sixMonthsAgo },
          isDeleted: false,
          status: 'completed',
        },
        select: { amount: true, createdAt: true },
      }),
      db.case.groupBy({
        by: ['createdAt'],
        where: { createdAt: { gte: sixMonthsAgo }, isDeleted: false },
        _count: true,
      }),
      // Additional aggregation
      db.donation.aggregate({
        _sum: { amount: true },
        _count: true,
        where: {
          createdAt: { gte: sixMonthsAgo },
          isDeleted: false,
          status: 'confirmed',
        },
      }),
      db.disbursement.aggregate({
        _sum: { amount: true },
        _count: true,
        where: {
          createdAt: { gte: sixMonthsAgo },
          isDeleted: false,
          status: 'completed',
        },
      }),
    ])

    // Calculate monthly averages
    const months = 6
    const avgNewCases = Math.round(totalCases / months)
    const avgDonated = monthlyDonations._sum.amount || 0
    const avgDisbursed = monthlyDisbursements._sum.amount || 0

    // Calculate trend (simple: compare last 3 months vs first 3 months)
    const midPoint = new Date(now.getFullYear(), now.getMonth() - 3, 1)
    const recentCases = await db.case.count({
      where: { createdAt: { gte: midPoint }, isDeleted: false },
    })
    const olderCases = totalCases - recentCases

    let trend: string
    if (recentCases > olderCases * 1.1) trend = 'increasing'
    else if (recentCases < olderCases * 0.9) trend = 'decreasing'
    else trend = 'stable'

    // Predict next month
    const predictedNewCases = Math.round(avgNewCases * (trend === 'increasing' ? 1.1 : trend === 'decreasing' ? 0.9 : 1))
    const avgFundRequired = avgDisbursed
    const avgFundAvailable = avgDonated / months
    const predictedFundRequired = Math.round(avgFundRequired * (trend === 'increasing' ? 1.15 : trend === 'decreasing' ? 0.85 : 1))
    const predictedFundAvailable = Math.round(avgFundAvailable)
    const fundShortfall = Math.max(0, predictedFundRequired - predictedFundAvailable)

    // Calculate confidence based on data volume
    const confidence = Math.min(0.95, 0.5 + (totalCases / 100) * 0.1 + (monthlyDonations._count / 50) * 0.1)

    const nextMonth = `${now.getFullYear()}-${String(now.getMonth() + 2).padStart(2, '0')}`

    // Save prediction
    const prediction = await db.predictionData.create({
      data: {
        modelType: 'demand_forecast',
        period: nextMonth,
        inputSnapshot: JSON.stringify({
          totalCases,
          avgNewCases,
          avgDonated,
          avgDisbursed,
          monthsAnalyzed: months,
        }),
        prediction: JSON.stringify({
          predictedNewCases,
          predictedFundRequired,
          predictedFundAvailable,
          fundShortfall,
          trend,
        }),
        confidence,
      },
    })

    return Response.json({
      success: true,
      data: {
        period: nextMonth,
        metrics: {
          avgNewCases,
          avgDisbursed: Math.round(avgDisbursed),
          avgDonated: Math.round(avgDonated / months),
          trend,
        },
        prediction: {
          predictedNewCases,
          predictedFundRequired,
          predictedFundAvailable,
          fundShortfall,
        },
        confidence: Math.round(confidence * 100) / 100,
        dataPoints: { totalCases, totalDonations: monthlyDonations._count, totalDisbursements: monthlyDisbursements._count },
        savedPredictionId: prediction.id,
      },
    })
  } catch (error) {
    console.error('Predictive forecast error:', error)
    return Response.json(
      { success: false, error: 'Ralat menjana ramalan permintaan' },
      { status: 500 }
    )
  }
}
