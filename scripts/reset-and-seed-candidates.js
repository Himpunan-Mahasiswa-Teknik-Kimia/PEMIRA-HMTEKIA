const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetAndSeedCandidates() {
  try {
    console.log('🔄 Resetting candidates...\n');
    
    // Delete all existing candidates
    const deleteResult = await prisma.candidate.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.count} existing candidates\n`);
    
    console.log('👤 Creating PEMIRA HIMATEKIA 2025 candidates...\n');
    
    const candidates = [
      // Ketua BPH Candidates
      {
        name: 'RAFFI RAMADHANY & AHMAD NAUFAL SYAFIQ',
        nim: 'KETUA01',
        prodi: 'Teknik Kimia',
        position: 'KETUA_BPH',
        visi: 'Menjadikan HIMATEKIA-ITERA sebagai organisasi yang aktif, inovatif, dan profesional dalam menampung aspirasi untuk mewujudkan lingkungan yang komunikatif, kolaboratif, dan inspiratif, serta mengamalkan Tri Dharma Perguruan Tinggi.',
        misi: '1. Mengoptimalkan peran HIMATEKIA-ITERA sebagai wadah aspirasi, inovasi, dan profesionalisme anggota melalui pelaksanaan program kerja yang adaptif terhadap dinamika organisasi serta mendorong pengembangan ide-ide kreatif dan solutif.\n\n2. Mewujudkan lingkungan organisasi yang kolaboratif dan inspiratif melalui kegiatan yang menumbuhkan semangat kebersamaan, tanggung jawab, serta kepedulian antaranggota himpunan.\n\n3. Mengimplementasikan nilai-nilai Tri Dharma Perguruan Tinggi melalui program kerja yang berfokus pada pendidikan, penelitian, dan pengabdian kepada masyarakat guna memberikan dampak positif bagi anggota HIMATEKIA-ITERA maupun masyarakat luas.',
        photo: null,
        isActive: true
      },
      {
        name: 'IRFAN ANANDA PUTRA & AIDI TAHDIDIL FIKRI',
        nim: 'KETUA02',
        prodi: 'Teknik Kimia',
        position: 'KETUA_BPH',
        visi: 'Menjadikan Himpunan Mahasiswa Teknik Kimia sebagai wadah pengembangan diri yang inovatif, kolaboratif guna mengembangkan potensi sumber daya mahasiswa Teknik Kimia yang berdaya saing tinggi serta berprestasi dan berkarakter.',
        misi: '1. Mengoptimalkan fungsi HIMATEKIA sebagai wadah pengembangan akademik dan non akademik mahasiswa.\n\n2. Membangun citra positif himpunan melalui komunikasi eksternal yang profesional dan berintegritas dengan menjalin hubungan yang baik dan berkelanjutan.\n\n3. Mendorong pengembangan potensi mahasiswa Teknik Kimia melalui bidang minat dan bakat guna menciptakan lingkungan yang inspiratif dan ekspresif.',
        photo: null,
        isActive: true
      },
      // Senator Candidates
      {
        name: 'CAHYO KUSUMA WP & I PUTU ARYA DITHA',
        nim: 'SENATOR01',
        prodi: 'Teknik Kimia',
        position: 'SENATOR',
        visi: 'Mewujudkan Senator HIMATEKIA-ITERA yang mampu menampung dan proaktif mengadvokasi aspirasi anggota dan menjamin integritas keputusan di tingkat himpunan dan kampus, berlandaskan kejujuran dan akuntabilitas.',
        misi: '1. Menjadi wadah yang memberikan aspirasi mengenai dinamika permasalahan dikampus serta memantau kinerja KM-ITERA, dan sikap HIMATEKIA-ITERA yang sesuai dengan berlandaskan aspirasi masa dan integritas.\n\n2. Menciptakan sistem komunikasi dan gerakan mahasiswa dalam memberikan pendapat tentang masalah yang sedang terjadi dilingkungan kampus dengan efektif.',
        photo: null,
        isActive: true
      },
      {
        name: 'RIZQIYA AYYASY AYODIA & LAILI JUNIA',
        nim: 'SENATOR02',
        prodi: 'Teknik Kimia',
        position: 'SENATOR',
        visi: 'Menjadikan Senator sebagai representasi lembaga legislatif mahasiswa yang mampu mewadahi dan menyalurkan aspirasi massa HIMATEKIA-ITERA secara kritis, inovatif, dan representatif demi terwujudnya arah gerak organisasi yang progresif dan berintegritas.',
        misi: '1. Menyediakan ruang terbuka bagi seluruh massa HIMATEKIA-ITERA untuk menyampaikan aspirasi, ide, dan kritik secara bebas dan bertanggung jawab.\n\n2. Menjalankan mekanisme pengelolaan aspirasi yang jelas, terstruktur, dan terbuka agar setiap suara mahasiswa tersampaikan dengan tepat kepada pihak terkait.\n\n3. Menginisiasi serta mendukung gerakan mahasiswa dalam merespons isu-isu sosial, akademik, maupun eksternal yang berpengaruh terhadap HIMATEKIA-ITERA dengan cara yang relevan, solutif, dan bermakna.',
        photo: null,
        isActive: true
      }
    ];
    
    let successCount = 0;
    
    for (const candidateData of candidates) {
      try {
        await prisma.candidate.create({
          data: candidateData
        });
        
        console.log(`✅ Created ${candidateData.position}: ${candidateData.name}`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Error creating ${candidateData.name}:`, error.message);
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`✅ Successfully created: ${successCount} candidates`);
    
    console.log('\n📝 PEMIRA HIMATEKIA 2025 Candidates:');
    console.log('━'.repeat(80));
    
    console.log('\n🎯 CALON KETUA BPH:');
    console.log('1. Raffi Ramadhany & Ahmad Naufal Syafiq (Promotor)');
    console.log('2. Irfan Ananda Putra & Aidi Tahdidil Fikri (Promotor)');
    
    console.log('\n🎯 CALON SENATOR:');
    console.log('1. Cahyo Kusuma WP & I Putu Arya Ditha (Promotor)');
    console.log('2. Rizqiya Ayyasy Ayodia & Laili Junia (Promotor)');
    
    console.log('\n━'.repeat(80));
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAndSeedCandidates();
