'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Users, Heart, DollarSign, Shield, FileText, Bot, Terminal, Cpu } from 'lucide-react'

const sections = [
  { title: 'Pengenalan PUSPA', icon: BookOpen, content: 'PUSPA (Pertubuhan Urus Peduli Asnaf) adalah sistem pengurusan NGO yang komprehensif untuk menguruskan ahli asnaf, donasi, kes bantuan, dan program organisasi. Sistem ini direka khas untuk memenuhi keperluan pertubuhan di Malaysia dengan pematuhan compliance ROS, LHDN, dan BNM.' },
  { title: 'Dashboard', icon: Heart, content: 'Dashboard utama memaparkan ringkasan statistik organisasi termasuk jumlah ahli asnaf, program aktif, jumlah donasi, sukarelawan aktif, dan skor compliance. Anda juga boleh melihat trend sumbangan bulanan, pecahan ahli, dan aktiviti terkini.' },
  { title: 'Pengurusan Ahli', icon: Users, content: 'Urus pendaftaran dan maklumat ahli asnaf termasuk profil peribadi, isi rumah, pendapatan, dan status keahlian. Sokongan carian dan penapis memudahkan pengurusan data yang besar.' },
  { title: 'Kes Bantuan', icon: FileText, content: 'Cipta dan urus kes bantuan dengan aliran kerja dari draf → dihantar → disahkan → diluluskan → dibayar. Setiap kes boleh dikaitkan dengan ahli dan program tertentu.' },
  { title: 'Donasi & Pembayaran', icon: DollarSign, content: 'Rekod sumbangan daripada penderma dengan pengasingan dana mengikut jenis (Zakat, Sadaqah, Wakaf, Infaq, Am). Urus pembayaran/agihan kepada penerima dengan pengesahan berperingkat.' },
  { title: 'Compliance', icon: Shield, content: 'Senarai semak compliance untuk pematuhan undang-undang termasuk pendaftaran ROS, tadbir urus, kewangan, dan ketelusan. Profil organisasi dan ahli lembaga juga diuruskan di sini.' },
  { title: 'Alat AI', icon: Bot, content: 'Pembantu AI boleh menjawab soalan tentang data organisasi, menjana laporan, dan memberi insight. Analisis AI menyediakan cadangan berdasarkan data terkini.' },
  { title: 'Ops Conductor', icon: Terminal, content: 'Pusat operasi AI untuk menguruskan item kerja, automasi, dan arahan operasi. Berinteraksi melalui chat semula jada untuk melaksanakan tugasan operasi.' },
  { title: 'OpenClaw', icon: Cpu, content: 'Sistem AI Ops dalaman yang merangkumi pelayan MCP, sambungan, gateway, ejen AI, enjin model, dan automasi. Hanya tersedia untuk peranan Developer.' },
]

export default function DocsPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <BookOpen className="h-6 w-6 text-brand" />
        <h1 className="text-2xl font-bold">Panduan Penggunaan</h1>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-brand via-primary to-primary/70 p-6 text-white">
        <h2 className="text-xl font-bold">Selamat Datang ke PUSPA v3.0</h2>
        <p className="mt-2 text-sm text-white/80">Sistem pengurusan NGO komprehensif untuk Pertubuhan Urus Peduli Asnaf KL &amp; Selangor.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge className="bg-white/20 text-white">PPM-006-14-14032020</Badge>
          <Badge className="bg-white/20 text-white">v3.0.0</Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {sections.map(s => (
          <Card key={s.title} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <s.icon className="h-5 w-5 text-brand" />
                <CardTitle className="text-base">{s.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent><p className="text-sm text-muted-foreground leading-relaxed">{s.content}</p></CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
        <CardContent className="p-4">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Bantuan &amp; Sokongan</p>
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">Hubungi pentadbir sistem di admin@puspa.org.my untuk bantuan teknikal atau isu berkaitan akaun.</p>
        </CardContent>
      </Card>
    </div>
  )
}
