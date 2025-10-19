/* eslint-disable no-console */
const { PrismaClient, Role } = require('@prisma/client')
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

async function upsertCandidate({ nim, name, prodi, visi, misi, photo }) {
  return prisma.candidate.upsert({
    where: { nim },
    update: { name, prodi, visi, misi, photo, isActive: true },
    create: { nim, name, prodi, visi, misi, photo },
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

  // Seed Candidates
  const candidates = [
    {
      nim: '2400000001',
      name: 'Calon Ketua 1',
      prodi: 'Teknik Informatika',
      visi: 'Mewujudkan PEMIRA yang jujur, adil, dan transparan.',
      misi: '- Digitalisasi proses pemilihan\n- Peningkatan partisipasi pemilih\n- Transparansi hasil secara real-time',
      photo: null,
    },
    {
      nim: '2400000002',
      name: 'Calon Ketua 2',
      prodi: 'Teknik Mesin',
      visi: 'PEMIRA partisipatif dengan akuntabilitas tinggi.',
      misi: '- Edukasi pemilih\n- Integritas panitia\n- Pelaporan publik hasil akhir',
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
