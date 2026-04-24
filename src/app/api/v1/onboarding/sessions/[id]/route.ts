import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await db.onboardingSession.findUnique({
      where: { id },
    })

    if (!session) {
      return Response.json(
        { success: false, error: 'Sesi onboarding tidak dijumpai' },
        { status: 404 }
      )
    }

    return Response.json({
      success: true,
      data: {
        ...session,
        data: JSON.parse(session.data),
      },
    })
  } catch (error) {
    console.error('Get onboarding session error:', error)
    return Response.json(
      { success: false, error: 'Ralat memuat sesi onboarding' },
      { status: 500 }
    )
  }
}
