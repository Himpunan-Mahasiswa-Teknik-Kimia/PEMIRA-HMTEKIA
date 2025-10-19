/* eslint-disable no-console */
const { PrismaClient, Role, Position } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function upsertUser({ email, nim, name, prodi, gender, phone, role, password }) {
  const hashed = await bcrypt.hash(password, 10)
  return prisma.user.upsert({
    where: { email },
    update: {
      name,
      prodi,
      gender,
      phone,
      role,
      password: hashed,
    },
    create: {
      email,
      nim,
      name,
      prodi,
      gender,
      phone,
      role,
      password: hashed,
    },
  })
}

async function upsertCandidate({ nim, name, prodi, position, visi, misi, photo }) {
  return prisma.candidate.upsert({
    where: { nim },
    update: { name, prodi, position, visi, misi, photo, isActive: true },
    create: { nim, name, prodi, position, visi, misi, photo },
  })
}

async function upsertSetting({ key, value, description }) {
  return prisma.settings.upsert({
    where: { key },
    update: { value, description },
    create: { key, value, description },
  })
}

async function main() {
  console.log('Seeding database...')

  // Default passwords for demo/dev. Change in production.
  const DEFAULT_PASSWORD = process.env.SEED_DEFAULT_PASSWORD || 'Password123!'
  if (!process.env.SEED_DEFAULT_PASSWORD) {
    console.warn('Using default demo password. Set SEED_DEFAULT_PASSWORD to override.')
  }

  // Seed Users for each role
  const users = [
    {
      email: 'superadmin@pemira.local',
      nim: '0000000001',
      name: 'Super Admin',
      prodi: 'Teknik Informatika',
      gender: 'M',
      phone: '081200000001',
      role: Role.SUPER_ADMIN,
    },
    {
      email: 'admin@pemira.local',
      nim: '0000000002',
      name: 'Admin',
      prodi: 'Sistem Informasi',
      gender: 'F',
      phone: '081200000002',
      role: Role.ADMIN,
    },
    {
      email: 'monitor@pemira.local',
      nim: '0000000003',
      name: 'Monitoring',
      prodi: 'Teknik Elektro',
      gender: 'M',
      phone: '081200000003',
      role: Role.MONITORING,
    },
    {
      email: 'voter1@pemira.local',
      nim: '2300000001',
      name: 'Voter Satu',
      prodi: 'Teknik Sipil',
      gender: 'F',
      phone: '081200000010',
      role: Role.VOTER,
    },
    {
      email: 'voter2@pemira.local',
      nim: '2300000002',
      name: 'Voter Dua',
      prodi: 'Arsitektur',
      gender: 'M',
      phone: '081200000011',
      role: Role.VOTER,
    },
  ]

  await Promise.all(
    users.map((u) =>
      upsertUser({
        ...u,
        password: DEFAULT_PASSWORD,
      })
    )
  )

  // Seed Candidates - Ketua Himpunan and Sekjen
  const candidates = [
    // Kandidat Ketua Himpunan
    {
      nim: '2400000001',
      name: 'Calon Ketua Himpunan 1',
      prodi: 'Teknik Kimia',
      position: Position.KETUA_HIMPUNAN,
      visi: 'Membangun Himpunan Mahasiswa Teknik Kimia yang solid, inovatif, dan berprestasi.',
      misi: '- Meningkatkan solidaritas antar mahasiswa\n- Mengembangkan program kerja yang bermanfaat\n- Memfasilitasi pengembangan softskill dan hardskill',
      photo: null,
    },
    {
      nim: '2400000002',
      name: 'Calon Ketua Himpunan 2',
      prodi: 'Teknik Kimia',
      position: Position.KETUA_HIMPUNAN,
      visi: 'Himpunan yang inklusif, kreatif, dan memberikan dampak positif bagi mahasiswa.',
      misi: '- Membuka ruang aspirasi mahasiswa\n- Mengadakan kegiatan yang mendukung akademik\n- Membangun kerjasama dengan industri',
      photo: null,
    },
    // Kandidat Sekretaris Jenderal (Sekjen)
    {
      nim: '2400000003',
      name: 'Calon Sekjen 1',
      prodi: 'Teknik Kimia',
      position: Position.SEKJEN,
      visi: 'Sekretariat yang terorganisir, efisien, dan transparan dalam menjalankan administrasi himpunan.',
      misi: '- Meningkatkan sistem administrasi himpunan\n- Dokumentasi kegiatan yang terstruktur\n- Transparansi pengelolaan data organisasi',
      photo: null,
    },
    {
      nim: '2400000004',
      name: 'Calon Sekjen 2',
      prodi: 'Teknik Kimia',
      position: Position.SEKJEN,
      visi: 'Sekretariat yang responsif, akuntabel, dan mendukung kinerja kepengurusan himpunan.',
      misi: '- Digitalisasi arsip dan dokumen himpunan\n- Koordinasi yang baik antar divisi\n- Laporan kegiatan yang tepat waktu',
      photo: null,
    },
  ]

  await Promise.all(candidates.map((c) => upsertCandidate(c)))

  // Seed Settings
  const settings = [
    { key: 'app.title', value: 'PEMIRA ITERA', description: 'Judul aplikasi' },
    { key: 'voting.enabled', value: 'false', description: 'Apakah pemilihan sedang dibuka' },
    { key: 'session.ttl.minutes', value: '30', description: 'Masa berlaku QR/session (menit)' },
  ]
  await Promise.all(settings.map((s) => upsertSetting(s)))

  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
