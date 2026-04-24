import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()
    if (!message) return NextResponse.json({ success: false, error: 'Mesej diperlukan' }, { status: 400 })

    // Use z-ai-web-dev-sdk for LLM chat
    const { ZAI } = await import('z-ai-web-dev-sdk')
    const zai = new ZAI()
    const response = await zai.llm.chat({
      messages: [
        { role: 'system', content: 'Anda adalah pembantu AI untuk PUSPA — Sistem Pengurusan Pertubuhan Urus Peduli Asnaf. Jawab dalam Bahasa Melayu.' },
        { role: 'user', content: message },
      ],
    })

    return NextResponse.json({ success: true, data: { response: response.content } })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memproses permintaan AI' }, { status: 500 })
  }
}
