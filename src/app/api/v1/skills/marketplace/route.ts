import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function GET() {
  try {
    // Return mock marketplace data
    const marketplaceSkills = [
      {
        skillId: 'whatsapp-business',
        name: 'WhatsApp Business',
        version: '2.1.0',
        category: 'communication',
        description: 'Hantar & terima mesej WhatsApp melalui WhatsApp Business API',
        author: 'OpenClaw',
        rating: 4.8,
        downloads: 12400,
        permissions: ['send_messages', 'read_messages', 'manage_templates'],
      },
      {
        skillId: 'telegram-bot',
        name: 'Telegram Bot',
        version: '1.5.0',
        category: 'communication',
        description: 'Integrasi Telegram Bot untuk komunikasi automatik',
        author: 'OpenClaw',
        rating: 4.6,
        downloads: 8900,
        permissions: ['send_messages', 'read_messages', 'manage_groups'],
      },
      {
        skillId: 'email-sender',
        name: 'Email Sender',
        version: '1.3.0',
        category: 'communication',
        description: 'Hantar emel automatik dengan template & penjejakan',
        author: 'OpenClaw',
        rating: 4.5,
        downloads: 15600,
        permissions: ['send_emails', 'read_emails'],
      },
      {
        skillId: 'pdf-generator',
        name: 'PDF Generator',
        version: '1.2.0',
        category: 'productivity',
        description: 'Jana dokumen PDF daripada template & data',
        author: 'OpenClaw',
        rating: 4.7,
        downloads: 11200,
        permissions: ['generate_documents', 'read_data'],
      },
      {
        skillId: 'reminder-engine',
        name: 'Reminder Engine',
        version: '1.4.0',
        category: 'productivity',
        description: 'Jadual & hantar peringatan automatik melalui pelbagai saluran',
        author: 'PUSPA',
        rating: 4.9,
        downloads: 7800,
        permissions: ['schedule_tasks', 'send_notifications'],
      },
      {
        skillId: 'data-analyzer',
        name: 'Data Analyzer',
        version: '1.1.0',
        category: 'data',
        description: 'Analisis data penderma, asnaf & program secara automatik',
        author: 'PUSPA',
        rating: 4.4,
        downloads: 5600,
        permissions: ['read_data', 'generate_reports'],
      },
      {
        skillId: 'budget-tracker',
        name: 'Budget Tracker',
        version: '2.0.0',
        category: 'finance',
        description: 'Jejaki peruntukan & perbelanjaan program dengan graf visual',
        author: 'OpenClaw',
        rating: 4.6,
        downloads: 9400,
        permissions: ['read_financial_data', 'generate_reports'],
      },
      {
        skillId: 'zakat-calculator',
        name: 'Kalkulator Zakat',
        version: '1.6.0',
        category: 'finance',
        description: 'Kira zakat fitrah, harta, pendapatan & perniagaan mengikut syariah',
        author: 'PUSPA',
        rating: 4.8,
        downloads: 18200,
        permissions: ['read_financial_data'],
      },
      {
        skillId: 'identity-verifier',
        name: 'Identity Verifier',
        version: '1.0.0',
        category: 'security',
        description: 'Pengesahan identiti melalui IC & pengenalan wajah',
        author: 'OpenClaw',
        rating: 4.3,
        downloads: 3200,
        permissions: ['read_personal_data', 'verify_identity'],
      },
      {
        skillId: 'compliance-checker',
        name: 'Compliance Checker',
        version: '1.2.0',
        category: 'security',
        description: 'Semak pematuhan ROS, LHDN, PDPA & syariah secara automatik',
        author: 'PUSPA',
        rating: 4.5,
        downloads: 4100,
        permissions: ['read_data', 'check_compliance'],
      },
      {
        skillId: 'survey-builder',
        name: 'Survey Builder',
        version: '1.0.0',
        category: 'productivity',
        description: 'Bina & edarkan tinjauan kepada penerima manfaat',
        author: 'OpenClaw',
        rating: 4.2,
        downloads: 2800,
        permissions: ['send_messages', 'read_responses'],
      },
      {
        skillId: 'map-visualizer',
        name: 'Map Visualizer',
        version: '1.1.0',
        category: 'data',
        description: 'Visualisasi taburan penerima manfaat & program di peta',
        author: 'OpenClaw',
        rating: 4.4,
        downloads: 3700,
        permissions: ['read_data', 'access_location'],
      },
    ]

    // Group by category
    const categories: Record<string, typeof marketplaceSkills> = {}
    for (const skill of marketplaceSkills) {
      if (!categories[skill.category]) categories[skill.category] = []
      categories[skill.category].push(skill)
    }

    // Get installed skill IDs to mark
    const installedSkills = await db.installedSkill.findMany({
      select: { skillId: true },
    })
    const installedIds = new Set(installedSkills.map((s) => s.skillId))

    return Response.json({
      success: true,
      data: {
        skills: marketplaceSkills.map((s) => ({
          ...s,
          isInstalled: installedIds.has(s.skillId),
        })),
        categories: Object.keys(categories).map((cat) => ({
          key: cat,
          label: cat.charAt(0).toUpperCase() + cat.slice(1),
          count: categories[cat].length,
        })),
        total: marketplaceSkills.length,
      },
    })
  } catch (error) {
    console.error('Marketplace error:', error)
    return Response.json(
      { success: false, error: 'Ralat memuat pasaraya kemahiran' },
      { status: 500 }
    )
  }
}
