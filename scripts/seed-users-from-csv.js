const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function seedUsersFromCSV() {
  try {
    console.log('📂 Reading CSV file...');
    
    const csvPath = path.join(__dirname, '../public/DATA ALL ANGGOTA HIMATEKIA FIKS.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Parse CSV
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    console.log('📋 Headers:', headers);
    console.log(`📊 Total rows: ${lines.length - 1}`);
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    // Process each line (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Parse CSV line (handle commas in names)
      const values = line.split(',');
      
      // CSV format: ,No.,Nama Anggota,NIM,Prodi,Angkatan,Jenis Kelamin,Status
      const no = values[1]?.trim();
      const nama = values[2]?.trim();
      const nim = values[3]?.trim();
      const prodi = values[4]?.trim();
      const angkatan = values[5]?.trim();
      const jenisKelamin = values[6]?.trim();
      const status = values[7]?.trim();
      
      if (!nim || !nama || !prodi) {
        console.log(`⚠️  Row ${i}: Skipping - missing required data`);
        skipCount++;
        continue;
      }
      
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { nim: nim }
        });
        
        if (existingUser) {
          console.log(`⏭️  Row ${i}: User ${nim} already exists, skipping...`);
          skipCount++;
          continue;
        }
        
        // Create user
        await prisma.user.create({
          data: {
            nim: nim,
            name: nama.toUpperCase(),
            prodi: prodi,
            role: 'VOTER',
            hasVoted: false
          }
        });
        
        successCount++;
        console.log(`✅ Row ${i}: Created user ${nim} - ${nama}`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Row ${i}: Error creating user ${nim}:`, error.message);
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`✅ Successfully created: ${successCount} users`);
    console.log(`⏭️  Skipped: ${skipCount} users`);
    console.log(`❌ Errors: ${errorCount} users`);
    console.log(`📈 Total processed: ${successCount + skipCount + errorCount} users`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsersFromCSV();
