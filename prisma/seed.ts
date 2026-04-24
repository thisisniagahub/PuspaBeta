import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Create default admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@puspa.org' },
    update: {},
    create: {
      email: 'admin@puspa.org',
      password: 'default',
      name: 'Admin PUSPA',
      role: 'admin',
      phone: '03-8888 9999',
      isActive: true,
    },
  })

  const opsUser = await prisma.user.upsert({
    where: { email: 'ops@puspa.org' },
    update: {},
    create: {
      email: 'ops@puspa.org',
      password: 'default',
      name: 'Staf Operasi',
      role: 'ops',
      phone: '03-8888 9998',
      isActive: true,
    },
  })

  // 2. Create branches
  const branchKL = await prisma.branch.upsert({ where: { code: 'KL' }, update: {}, create: { name: 'Cawangan Kuala Lumpur', code: 'KL', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan', phone: '03-8888 9999', email: 'kl@puspa.org', headName: 'Ustaz Ahmad' } })
  const branchSEL = await prisma.branch.upsert({ where: { code: 'SEL' }, update: {}, create: { name: 'Cawangan Selangor', code: 'SEL', city: 'Shah Alam', state: 'Selangor', phone: '03-8888 9998', email: 'sel@puspa.org', headName: 'Ustazah Siti' } })

  // 3. Create organization profile
  await prisma.organizationProfile.upsert({
    where: { id: 'org-profile-1' },
    update: {},
    create: {
      id: 'org-profile-1',
      legalName: 'Pertubuhan Urus Peduli Asnaf KL & Selangor',
      tradeName: 'PUSPA',
      registrationType: 'pertubuhan',
      registrationNumber: 'PPM-006-14-14032020',
      phone: '03-8888 9999',
      email: 'info@puspa.org',
      website: 'https://puspa.org.my',
      bankName: 'Maybank',
      bankAccount: '5621 2345 6789',
      isTaxExempt: true,
      lhdnApprovalRef: 'LHDN/01/2024/TP-123',
      missionStatement: 'Membantu golongan asnaf dengan bantuan berterusan dan berkesan',
      visionStatement: 'Menjadi pertubuhan terulung dalam pengurusan asnaf di Malaysia',
    },
  })

  // 4. Create members
  const memberData = [
    { memberNumber: 'PUSPA-0001', name: 'Ahmad bin Abdullah', ic: '850315015123', phone: '013-7892341', email: 'ahmad@email.com', address: 'No. 12, Jalan Hulu Klang 4', city: 'Hulu Klang', state: 'Selangor', postalCode: '53100', householdSize: 5, monthlyIncome: 1800, maritalStatus: 'married', occupation: 'Pemandu Teksi', bankAccount: '123456789012', bankName: 'Maybank', status: 'active', notes: 'Keluarga memerlukan bantuan pendidikan anak-anak' },
    { memberNumber: 'PUSPA-0002', name: 'Siti binti Hassan', ic: '901231145234', phone: '019-3456782', email: 'siti@email.com', address: 'No. 8, Jalan Gombak 7/2', city: 'Gombak', state: 'Selangor', postalCode: '53100', householdSize: 4, monthlyIncome: 1200, maritalStatus: 'widowed', occupation: 'Penjual Kuih', bankAccount: '234567890123', bankName: 'Bank Islam', status: 'active', notes: 'Janda dengan 3 orang anak' },
    { memberNumber: 'PUSPA-0003', name: 'Muhammad Amin bin Ismail', ic: '780422015456', phone: '012-9876543', email: 'amin@email.com', address: 'No. 25, Jalan Ampang Hilir', city: 'Ampang', state: 'Selangor', postalCode: '55000', householdSize: 7, monthlyIncome: 2200, maritalStatus: 'married', occupation: 'Buruh Binaan', bankAccount: '345678901234', bankName: 'CIMB', status: 'active', notes: 'Pendapatan tidak mencukupi untuk keluarga besar' },
    { memberNumber: 'PUSPA-0004', name: 'Nur Aisyah binti Muhammad', ic: '950817025789', phone: '017-2345678', email: 'aisyah@email.com', address: 'Blok C, Pangsapuri Sri Gombak', city: 'Gombak', state: 'Selangor', postalCode: '53100', householdSize: 2, monthlyIncome: 900, maritalStatus: 'single', occupation: 'Pekerja Kedai', bankAccount: '456789012345', bankName: 'Bank Rakyat', status: 'active' },
    { memberNumber: 'PUSPA-0005', name: 'Ismail bin Osman', ic: '700510015123', phone: '011-5678901', email: '', address: 'No. 45, Kampung Melayu Hulu Klang', city: 'Hulu Klang', state: 'Selangor', postalCode: '53100', householdSize: 3, monthlyIncome: 1500, maritalStatus: 'divorced', occupation: 'Penjaga Keselamatan', bankName: 'RHB Bank', status: 'inactive' },
    { memberNumber: 'PUSPA-0006', name: 'Fatimah binti Zahari', ic: '820725035345', phone: '016-8901234', email: 'fatimah@email.com', address: 'No. 3, Jalan Ampang Utama', city: 'Ampang', state: 'Selangor', postalCode: '55000', householdSize: 6, monthlyIncome: 2000, maritalStatus: 'married', occupation: 'Surirumah', bankAccount: '678901234567', bankName: 'Maybank', status: 'active', notes: 'Suami mengalami masalah kesihatan kronik' },
    { memberNumber: 'PUSPA-0007', name: 'Abdul Rahman bin Haji Yusof', ic: '650101015567', phone: '013-4567890', email: 'arahman@email.com', address: 'No. 18, Jalan Setapak 5', city: 'Setapak', state: 'Kuala Lumpur', postalCode: '53200', householdSize: 2, monthlyIncome: 800, maritalStatus: 'widowed', occupation: 'Pencen', bankAccount: '789012345678', bankName: 'Public Bank', status: 'active', notes: 'Warga emas tinggal seorang diri' },
    { memberNumber: 'PUSPA-0008', name: 'Rohani binti Ali', ic: '920605025234', phone: '014-3456789', email: 'rohani@email.com', address: 'No. 33, Jalan Keramat AU3', city: 'Keramat', state: 'Kuala Lumpur', postalCode: '54200', householdSize: 3, monthlyIncome: 1100, maritalStatus: 'single', occupation: 'Penjaga Kanak-kanak', bankAccount: '901234567890', bankName: 'Bank Islam', status: 'active', notes: 'Ibu tunggal dengan seorang anak' },
  ]

  for (const m of memberData) {
    await prisma.member.upsert({
      where: { memberNumber: m.memberNumber },
      update: {},
      create: m,
    })
  }

  // 5. Create programmes
  const programmes = [
    { name: 'Bantuan Makanan Bulanan', description: 'Pengedaran bungkusan makanan kepada keluarga asnaf setiap bulan', category: 'food_aid', status: 'active', targetBeneficiaries: 100, actualBeneficiaries: 87, budget: 50000, totalSpent: 43500, location: 'Pusat PUSPA KL' },
    { name: 'Program Pendidikan Anak Asnaf', description: 'Bantuan yuran sekolah dan alat tulis untuk anak-anak asnaf', category: 'education', status: 'active', targetBeneficiaries: 50, actualBeneficiaries: 42, budget: 30000, totalSpent: 25200, location: 'Sekolah-sekolah sekitar' },
    { name: 'Kemahiran Kerjaya Wanita', description: 'Kursus jahitan, memasak, dan kraf tangan untuk wanita asnaf', category: 'skills_training', status: 'active', targetBeneficiaries: 30, actualBeneficiaries: 25, budget: 20000, totalSpent: 15000, location: 'Pusat Latihan PUSPA' },
    { name: 'Bantuan Perubatan Asnaf', description: 'Bantuan kos perubatan dan ubat-ubatan', category: 'healthcare', status: 'active', targetBeneficiaries: 40, actualBeneficiaries: 35, budget: 40000, totalSpent: 28000, location: 'Klinik Kesihatan' },
    { name: 'Sedekah Jumaat Mingguan', description: 'Pengedaran sedekah setiap Jumaat di masjid-masjid', category: 'financial_assistance', status: 'active', targetBeneficiaries: 200, actualBeneficiaries: 180, budget: 80000, totalSpent: 72000, location: 'Masjid-masjid KL & Selangor' },
    { name: 'Program Bantuan Kecemasan', description: 'Bantuan segera untuk kes kecemasan', category: 'emergency_relief', status: 'active', targetBeneficiaries: 20, actualBeneficiaries: 18, budget: 25000, totalSpent: 22000 },
    { name: 'Dakwah Komuniti', description: 'Program dakwah dan ceramah di komuniti asnaf', category: 'dawah', status: 'planned', targetBeneficiaries: 100, budget: 10000, location: 'Surau-surau kawasan' },
    { name: 'Komuniti Penjagaan Warga Emas', description: 'Lawatan dan bantuan kepada warga emas asnaf', category: 'community', status: 'completed', targetBeneficiaries: 30, actualBeneficiaries: 28, budget: 15000, totalSpent: 14000 },
  ]

  for (const p of programmes) {
    await prisma.programme.create({ data: p })
  }

  // 6. Create donations
  const donationData = [
    { donationNumber: 'DN-0001', donorName: 'Tan Sri Mohd Ali', donorIC: '600101015678', amount: 10000, status: 'confirmed', method: 'bank_transfer', fundType: 'zakat', zakatCategory: 'harta', zakatAuthority: 'LZNK', donatedAt: new Date('2024-01-15') },
    { donationNumber: 'DN-0002', donorName: 'Puan Sri Aminah', donorIC: '650203014567', amount: 5000, status: 'confirmed', method: 'online', fundType: 'sadaqah', donatedAt: new Date('2024-01-22') },
    { donationNumber: 'DN-0003', donorName: 'Encik Hassan (Anonymous)', amount: 2500, status: 'confirmed', method: 'cash', fundType: 'infaq', isAnonymous: true, donatedAt: new Date('2024-02-01') },
    { donationNumber: 'DN-0004', donorName: 'Syarikat ABC Sdn Bhd', amount: 15000, status: 'confirmed', method: 'cheque', fundType: 'waqf', isTaxDeductible: true, donatedAt: new Date('2024-02-14') },
    { donationNumber: 'DN-0005', donorName: 'Dato\' Ismail', amount: 3000, status: 'confirmed', method: 'ewallet', fundType: 'zakat', zakatCategory: 'pendapatan', donatedAt: new Date('2024-03-01') },
    { donationNumber: 'DN-0006', donorName: 'Hamba Allah', amount: 500, status: 'confirmed', method: 'cash', fundType: 'sadaqah', isAnonymous: true, donatedAt: new Date('2024-03-10') },
    { donationNumber: 'DN-0007', donorName: 'Dr. Kamal', amount: 8000, status: 'pending', method: 'bank_transfer', fundType: 'infaq', donatedAt: new Date('2024-04-05') },
    { donationNumber: 'DN-0008', donorName: 'Puan Faridah', amount: 1500, status: 'confirmed', method: 'online', fundType: 'donation_general', donatedAt: new Date('2024-04-15') },
    { donationNumber: 'DN-0009', donorName: 'Keluarga Rahman', amount: 2000, status: 'confirmed', method: 'bank_transfer', fundType: 'zakat', zakatCategory: 'fitrah', donatedAt: new Date('2024-05-01') },
    { donationNumber: 'DN-0010', donorName: 'Encik Zulkifli', amount: 7500, status: 'confirmed', method: 'bank_transfer', fundType: 'waqf', donatedAt: new Date('2024-05-20') },
  ]

  for (const d of donationData) {
    await prisma.donation.upsert({
      where: { donationNumber: d.donationNumber },
      update: {},
      create: d,
    })
  }

  // 7. Create donors
  const donorData = [
    { donorNumber: 'DNR-0001', name: 'Tan Sri Mohd Ali', ic: '600101015678', phone: '012-3456789', email: 'ali@corporate.com', segment: 'major', preferredContact: 'phone', totalDonated: 50000, donationCount: 5, firstDonationAt: new Date('2023-01-15'), lastDonationAt: new Date('2024-01-15') },
    { donorNumber: 'DNR-0002', name: 'Puan Sri Aminah', ic: '650203014567', phone: '013-4567890', email: 'aminah@email.com', segment: 'regular', preferredContact: 'email', totalDonated: 15000, donationCount: 3, firstDonationAt: new Date('2023-06-22'), lastDonationAt: new Date('2024-01-22') },
    { donorNumber: 'DNR-0003', name: 'Syarikat ABC Sdn Bhd', phone: '03-8888 1111', email: 'donation@abc.com.my', segment: 'major', preferredContact: 'email', totalDonated: 45000, donationCount: 3, firstDonationAt: new Date('2023-03-01'), lastDonationAt: new Date('2024-02-14') },
    { donorNumber: 'DNR-0004', name: 'Dr. Kamal', phone: '019-2223333', email: 'kamal@clinic.com', segment: 'occasional', preferredContact: 'whatsapp', totalDonated: 8000, donationCount: 1, firstDonationAt: new Date('2024-04-05'), lastDonationAt: new Date('2024-04-05') },
    { donorNumber: 'DNR-0005', name: 'Puan Faridah', phone: '017-4445555', email: 'faridah@email.com', segment: 'occasional', totalDonated: 1500, donationCount: 1, firstDonationAt: new Date('2024-04-15'), lastDonationAt: new Date('2024-04-15') },
  ]

  for (const d of donorData) {
    await prisma.donor.upsert({
      where: { donorNumber: d.donorNumber },
      update: {},
      create: d,
    })
  }

  // 8. Create cases
  const member1 = await prisma.member.findFirst({ where: { memberNumber: 'PUSPA-0001' } })
  const member2 = await prisma.member.findFirst({ where: { memberNumber: 'PUSPA-0002' } })
  const member3 = await prisma.member.findFirst({ where: { memberNumber: 'PUSPA-0003' } })

  if (member1) {
    await prisma.case.create({ data: { caseNumber: 'CS-0001', title: 'Bantuan Pendidikan Anak', description: 'Permohonan bantuan yuran sekolah untuk 3 orang anak', status: 'approved', priority: 'normal', category: 'zakat', amount: 3000, memberId: member1.id, creatorId: admin.id } })
  }
  if (member2) {
    await prisma.case.create({ data: { caseNumber: 'CS-0002', title: 'Bantuan Sara Hidup', description: 'Janda 3 anak memerlukan bantuan sara hidup bulanan', status: 'verifying', priority: 'high', category: 'sedekah', amount: 1500, memberId: member2.id, creatorId: admin.id } })
  }
  if (member3) {
    await prisma.case.create({ data: { caseNumber: 'CS-0003', title: 'Bantuan Perubatan Isteri', description: 'Isteri memerlukan rawatan perubatan berterusan', status: 'submitted', priority: 'urgent', category: 'zakat', amount: 5000, memberId: member3.id, creatorId: opsUser.id } })
  }

  // 9. Create volunteers
  const volunteerData = [
    { volunteerNumber: 'VOL-0001', name: 'Ustazah Nurul Huda', ic: '880101016789', phone: '012-1112222', email: 'nurul@masjid.org', occupation: 'Guru Agama', skills: '["teaching","counseling"]', availability: 'weekend', totalHours: 120, status: 'active' },
    { volunteerNumber: 'VOL-0002', name: 'Encik Farhan', ic: '950202013456', phone: '013-2223333', email: 'farhan@email.com', occupation: 'Jurutera', skills: '["logistics","driving"]', availability: 'weekend', totalHours: 48, status: 'active' },
    { volunteerNumber: 'VOL-0003', name: 'Puan Zainab', ic: '750303012345', phone: '016-3334444', email: 'zainab@email.com', occupation: 'Pensyarah', skills: '["teaching","mentoring"]', availability: 'anytime', totalHours: 200, status: 'active' },
    { volunteerNumber: 'VOL-0004', name: 'Dr. Amira', ic: '900404014567', phone: '019-4445555', email: 'amira@hospital.com', occupation: 'Doktor', skills: '["medical","counseling"]', availability: 'weekday', totalHours: 36, status: 'active' },
  ]

  for (const v of volunteerData) {
    await prisma.volunteer.upsert({
      where: { volunteerNumber: v.volunteerNumber },
      update: {},
      create: v,
    })
  }

  // 10. Create compliance checklist
  const checklistItems = [
    { category: 'registration', item: 'Pendaftaran ROS', description: 'Sijil pendaftaran pertubuhan sah', isCompleted: true, order: 1 },
    { category: 'registration', item: 'Nombor Pendaftaran', description: 'PPM-006-14-14032020', isCompleted: true, order: 2 },
    { category: 'governance', item: 'Perlembagaan Pertubuhan', description: 'Perlembagaan telah diluluskan oleh ahli', isCompleted: true, order: 3 },
    { category: 'governance', item: 'Jawatankuasa Pengurusan', description: 'Senarai AJK lengkap dengan peranan', isCompleted: true, order: 4 },
    { category: 'governance', item: 'Mesyuarat Agung Tahunan', description: 'Minit mesyuarat AGM terkini', isCompleted: false, order: 5 },
    { category: 'financial', item: 'Penyata Kewangan Audit', description: 'Penyata kewangan diaudit oleh juruaudit berdaftar', isCompleted: true, order: 6 },
    { category: 'financial', item: 'Akaun Bank Berdaftar', description: 'Akaun bank atas nama pertubuhan', isCompleted: true, order: 7 },
    { category: 'financial', item: 'Pelepasan Cukai LHDN', description: 'Kelulusan pelepasan cukai daripada LHDN', isCompleted: true, order: 8 },
    { category: 'transparency', item: 'Laporan Tahunan Awam', description: 'Laporan tahunan diterbitkan secara awam', isCompleted: false, order: 9 },
    { category: 'transparency', item: 'Pengauditan Dalaman', description: 'Proses audit dalaman berkala', isCompleted: false, order: 10 },
    { category: 'programme', item: 'Laporan Impak Program', description: 'Laporan impak setiap program yang dijalankan', isCompleted: false, order: 11 },
    { category: 'programme', item: 'Mekanisme Aduan', description: 'Saluran aduan penerima bantuan', isCompleted: true, order: 12 },
  ]

  for (const item of checklistItems) {
    await prisma.complianceChecklist.create({ data: item })
  }

  // 11. Create board members
  const boardMembers = [
    { name: 'Dato\' Haji Ahmad Shah', title: 'Dato\'', role: 'chairman', phone: '012-9990001', email: 'ahmad.shah@puspa.org', isCurrent: true },
    { name: 'Ustazah Siti Aminah', title: 'Ustazah', role: 'deputy_chairman', phone: '013-9990002', email: 'siti.aminah@puspa.org', isCurrent: true },
    { name: 'Encik Mohd Razak', title: '', role: 'treasurer', phone: '016-9990003', email: 'razak@puspa.org', isCurrent: true },
    { name: 'Ustaz Ismail', title: 'Ustaz', role: 'secretary', phone: '019-9990004', email: 'ismail@puspa.org', isCurrent: true },
    { name: 'Puan Halimah', title: '', role: 'committee', phone: '011-9990005', email: 'halimah@puspa.org', isCurrent: true },
  ]

  for (const bm of boardMembers) {
    await prisma.boardMember.create({ data: bm })
  }

  // 12. Create partners
  const partners = [
    { name: 'Lembaga Zakat Negeri Kedah (LZNK)', type: 'government', relationship: 'Pemberi zakat', contactPerson: 'Ustaz Kamal', contactPhone: '04-730 2222', verifiedStatus: 'publicly_verified' },
    { name: 'Masjid Al-Azhar KL', type: 'masjid', relationship: 'Tempat program', contactPerson: 'Bilal Hussin', contactPhone: '03-8882 1111', verifiedStatus: 'partner_confirmed' },
    { name: 'Syarikat ABC Sdn Bhd', type: 'corporate', relationship: 'Penaja utama', contactPerson: 'Puan Sarah', contactEmail: 'csr@abc.com.my', verifiedStatus: 'publicly_verified' },
  ]

  for (const p of partners) {
    await prisma.partner.create({ data: p })
  }

  // 13. Create some activities
  const activities = [
    { title: 'Pengedaran Bungkusan Makanan Januari', type: 'event', status: 'completed', date: new Date('2024-01-20'), location: 'Pusat PUSPA KL' },
    { title: 'Ceramah Motivasi Anak Asnaf', type: 'event', status: 'completed', date: new Date('2024-02-10'), location: 'Masjid Al-Azhar' },
    { title: 'Sediakan laporan Q1 2024', type: 'task', status: 'in_progress', notes: 'Perlu siap sebelum 15 April' },
    { title: 'Lawatan rumah ahli baru', type: 'fieldwork', status: 'planned', date: new Date('2024-04-20'), location: 'Gombak' },
    { title: 'Mesyuarat AJK Bulanan', type: 'meeting', status: 'planned', date: new Date('2024-04-28'), location: 'Pejabat PUSPA' },
  ]

  for (const a of activities) {
    await prisma.activity.create({ data: a })
  }

  // 14. Create disbursements
  if (member1) {
    await prisma.disbursement.create({ data: { disbursementNumber: 'DB-0001', amount: 500, purpose: 'Bantuan makanan bulanan', status: 'completed', recipientName: 'Ahmad bin Abdullah', recipientBank: 'Maybank', recipientAcc: '123456789012', memberId: member1.id, processedDate: new Date('2024-01-25') } })
  }
  if (member2) {
    await prisma.disbursement.create({ data: { disbursementNumber: 'DB-0002', amount: 300, purpose: 'Bantuan sara hidup', status: 'approved', recipientName: 'Siti binti Hassan', recipientBank: 'Bank Islam', recipientAcc: '234567890123', memberId: member2.id } })
  }

  // 15. Create documents
  await prisma.document.createMany({
    data: [
      { title: 'Sijil Pendaftaran ROS', category: 'registration', fileName: 'ros-certificate.pdf', fileSize: 204800, mimeType: 'application/pdf', status: 'active', tags: '["ros","pendaftaran"]' },
      { title: 'Perlembagaan PUSPA', category: 'governance', fileName: 'constitution-2024.pdf', fileSize: 512000, mimeType: 'application/pdf', status: 'active', tags: '["perlembagaan","governance"]' },
      { title: 'Penyata Kewangan 2023', category: 'financial', fileName: 'financial-statement-2023.pdf', fileSize: 1024000, mimeType: 'application/pdf', status: 'active', tags: '["kewangan","audit"]' },
      { title: 'Laporan Impak Q1 2024', category: 'programme', fileName: 'impact-q1-2024.pdf', fileSize: 307200, mimeType: 'application/pdf', status: 'active', tags: '["impak","laporan"]' },
    ],
  })

  // 16. Create audit log
  await prisma.auditLog.create({ data: { action: 'seed', entity: 'System', details: 'Database seeded with initial data', userId: admin.id } })

  console.log('✅ Database seeded successfully!')
  console.log(`   - ${await prisma.user.count()} users`)
  console.log(`   - ${await prisma.member.count()} members`)
  console.log(`   - ${await prisma.programme.count()} programmes`)
  console.log(`   - ${await prisma.donation.count()} donations`)
  console.log(`   - ${await prisma.donor.count()} donors`)
  console.log(`   - ${await prisma.volunteer.count()} volunteers`)
  console.log(`   - ${await prisma.case.count()} cases`)
  console.log(`   - ${await prisma.complianceChecklist.count()} compliance items`)
  console.log(`   - ${await prisma.boardMember.count()} board members`)
  console.log(`   - ${await prisma.partner.count()} partners`)
  console.log(`   - ${await prisma.activity.count()} activities`)
  console.log(`   - ${await prisma.disbursement.count()} disbursements`)
  console.log(`   - ${await prisma.document.count()} documents`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
