import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      name: 'PUSPA API',
      version: '2.1.0',
      description: 'Sistem Pengurusan Pertubuhan Urus Peduli Asnaf',
      endpoints: '/api/v1',
    },
  })
}
