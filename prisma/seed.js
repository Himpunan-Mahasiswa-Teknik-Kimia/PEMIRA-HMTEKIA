const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Seed SUPER ADMIN user
  await prisma.user.upsert({
    where: { nim: '1' },
    update: {
      name: 'SUPER ADMIN',
      prodi: 'Teknik Kimia',
      role: 'SUPER_ADMIN',
    },
    create: {
      nim: '1',
      name: 'SUPER ADMIN',
      prodi: 'Teknik Kimia',
      role: 'SUPER_ADMIN',
    },
  })

  // Seed core candidates (Ketua BPH & Senator + Promotor info tersimpan di visi/misi atau bisa ditambah field baru nanti)
  const candidates = [
    {
      // No.1 Calon Ketua BPH & Promotor
      name: 'Raffi Ramadhany',
      nim: '123280121',
      prodi: 'Teknik Kimia',
      position: 'KETUA_BPH',
      visi:
        'Menjadikan HIMATEKIA-ITERA sebagai organisasi yang aktif, inovatif, dan profesional dalam menampung aspirasi untuk mewujudkan lingkungan yang komunikatif, kolaboratif, dan inspiratif, serta mengamalkan Tri Dharma Perguruan Tinggi.',
      misi:
        '1. Mengoptimalkan peran HIMATEKIA-ITERA sebagai wadah aspirasi, inovasi, dan profesionalisme anggota melalui pelaksanaan program kerja yang adaptif terhadap dinamika organisasi serta mendorong pengembangan ide-ide kreatif dan solutif.\n' +
        '2. Mewujudkan lingkungan organisasi yang kolaboratif dan inspiratif melalui kegiatan yang menumbuhkan semangat kebersamaan, tanggung jawab, serta kepedulian antaranggota himpunan.\n' +
        '3. Mengimplementasikan nilai-nilai Tri Dharma Perguruan Tinggi melalui program kerja yang berfokus pada pendidikan, penelitian, dan pengabdian kepada masyarakat guna memberikan dampak positif bagi anggota HIMATEKIA-ITERA maupun masyarakat luas.',
      photo: '/No.1 Ketua BPH.jpg',
    },
    {
      // No.2 Calon Ketua BPH & Promotor
      name: 'Irfan Ananda Putra',
      nim: '123280047',
      prodi: 'Teknik Kimia',
      position: 'KETUA_BPH',
      visi:
        'Menjadikan Himpunan Mahasiswa Teknik Kimia sebagai wadah pengembangan diri yang inovatif, kolaboratif guna mengembangkan potensi sumber daya mahasiswa Teknik Kimia yang berdaya saing tinggi serta berprestasi dan berkarakter.',
      misi:
        '1. Mengoptimalkan fungsi HIMATEKIA sebagai wadah pengembangan akademik dan non akademik mahasiswa.\n' +
        '2. Membangun citra positif himpunan melalui komunikasi eksternal yang profesional dan berintegritas dengan menjalin hubungan yang baik dan berkelanjutan.\n' +
        '3. Mendorong pengembangan potensi mahasiswa Teknik Kimia melalui bidang minat dan bakat guna menciptakan lingkungan yang inspiratif dan ekspresif.',
      photo: '/No.2 Ketua BPH.jpg',
    },
    {
      // No.1 Calon Senator & Promotor
      name: 'Cahyo Kusuma Wardana Putra',
      nim: '123280010',
      prodi: 'Teknik Kimia',
      position: 'SENATOR',
      visi:
        '1. Mewujudkan Senator HIMATEKIA-ITERA yang mampu menampung dan proaktif mengadvokasi aspirasi anggota dan menjamin integritas keputusan di tingkat himpunan dan kampus, berlandaskan kejujuran dan akuntabilitas.',
      misi:
        '1. Menjadi wadah yang memberikan aspirasi mengenai dinamika permasalahan di kampus serta memantau kinerja KM-ITERA, dan sikap HIMATEKIA-ITERA yang sesuai dengan berlandaskan aspirasi massa dan integritas.\n' +
        '2. Menciptakan sistem komunikasi dan gerakan mahasiswa dalam memberikan pendapat tentang masalah yang sedang terjadi di lingkungan kampus dengan efektif.',
      photo: '/No.1 Senator.jpg',
    },
    {
      // No.2 Calon Senator & Promotor
      name: 'Rizqiya Ayyasy Ayodia',
      nim: '123280111',
      prodi: 'Teknik Kimia',
      position: 'SENATOR',
      visi:
        '1. Menjadikan Senator sebagai representasi lembaga legislatif mahasiswa yang mampu mewadahi dan menyalurkan aspirasi massa HIMATEKIA-ITERA secara kritis, inovatif, dan representatif demi terwujudnya arah gerak organisasi yang progresif dan berintegritas.',
      misi:
        '1. Menyediakan ruang terbuka bagi seluruh massa HIMATEKIA-ITERA untuk menyampaikan aspirasi, ide, dan kritik secara bebas dan bertanggung jawab.\n' +
        '2. Menjalankan mekanisme pengelolaan aspirasi yang jelas, terstruktur, dan terbuka agar setiap suara mahasiswa tersampaikan dengan tepat kepada pihak terkait.\n' +
        '3. Menginisiasi serta mendukung gerakan mahasiswa dalam merespons isu-isu sosial, akademik, maupun eksternal yang berpengaruh terhadap HIMATEKIA-ITERA dengan cara yang relevan, solutif, dan bermakna.',
      photo: '/No.2 Senator.jpg',
    },
  ]

  for (const c of candidates) {
    await prisma.candidate.upsert({
      where: {
        nim_position: {
          nim: c.nim,
          position: c.position,
        },
      },
      update: {
        name: c.name,
        prodi: c.prodi,
        visi: c.visi,
        misi: c.misi,
        photo: c.photo,
        isActive: true,
      },
      create: {
        name: c.name,
        nim: c.nim,
        prodi: c.prodi,
        position: c.position,
        visi: c.visi,
        misi: c.misi,
        photo: c.photo,
        isActive: true,
      },
    })
  }

  console.log('✅ Seed selesai: SUPER ADMIN dan kandidat inti sudah tersimpan.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
