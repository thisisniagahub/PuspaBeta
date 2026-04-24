import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [recentMembers, recentDonations, recentCases, recentProgrammes] = await Promise.all([
      db.member.findMany({ where: { isDeleted: false }, orderBy: { createdAt: 'desc' }, take: 3, select: { id: true, name: true, createdAt: true } }),
      db.donation.findMany({ where: { isDeleted: false }, orderBy: { createdAt: 'desc' }, take: 3, select: { id: true, donorName: true, amount: true, fundType: true, createdAt: true } }),
      db.case.findMany({ where: { isDeleted: false }, orderBy: { createdAt: 'desc' }, take: 3, select: { id: true, title: true, status: true, createdAt: true } }),
      db.programme.findMany({ where: { isDeleted: false }, orderBy: { createdAt: 'desc' }, take: 3, select: { id: true, name: true, status: true, createdAt: true } }),
    ])

    const activities = [
      ...recentMembers.map(m => ({ id: m.id, type: 'member' as const, title: `Ahli baharu: ${m.name}`, description: 'Pendaftaran ahli asnaf baru', timestamp: m.createdAt.toISOString() })),
      ...recentDonations.map(d => ({ id: d.id, type: 'donation' as const, title: `Donasi RM ${d.amount.toLocaleString()}`, description: `Daripada ${d.donorName} (${d.fundType})`, timestamp: d.createdAt.toISOString() })),
      ...recentCases.map(c => ({ id: c.id, type: 'case' as const, title: `Kes: ${c.title}`, description: `Status: ${c.status}`, timestamp: c.createdAt.toISOString() })),
      ...recentProgrammes.map(p => ({ id: p.id, type: 'programme' as const, title: `Program: ${p.name}`, description: `Status: ${p.status}`, timestamp: p.createdAt.toISOString() })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)

    return NextResponse.json({ success: true, data: activities })
  } catch (error) {
    console.error('Activities error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuatkan aktiviti terkini' }, { status: 500 })
  }
}
