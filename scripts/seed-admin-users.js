const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedAdminUsers() {
  try {
    console.log('👤 Creating admin users...\n');
    
    const adminUsers = [
      {
        nim: '00000000001',
        name: 'SUPER ADMIN',
        prodi: 'ADMINISTRATOR',
        role: 'SUPER_ADMIN'
      },
      {
        nim: '00000000002',
        name: 'ADMIN 1',
        prodi: 'ADMINISTRATOR',
        role: 'ADMIN'
      },
      {
        nim: '00000000003',
        name: 'ADMIN 2',
        prodi: 'ADMINISTRATOR',
        role: 'ADMIN'
      },
      {
        nim: '00000000004',
        name: 'MONITORING 1',
        prodi: 'ADMINISTRATOR',
        role: 'MONITORING'
      }
    ];
    
    let successCount = 0;
    let skipCount = 0;
    
    for (const admin of adminUsers) {
      try {
        const existing = await prisma.user.findUnique({
          where: { nim: admin.nim }
        });
        
        if (existing) {
          console.log(`⏭️  ${admin.role}: ${admin.nim} already exists`);
          skipCount++;
          continue;
        }
        
        await prisma.user.create({
          data: {
            nim: admin.nim,
            name: admin.name,
            prodi: admin.prodi,
            role: admin.role,
            hasVoted: false
          }
        });
        
        console.log(`✅ Created ${admin.role}: ${admin.nim} - ${admin.name}`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Error creating ${admin.nim}:`, error.message);
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`✅ Successfully created: ${successCount} admin users`);
    console.log(`⏭️  Skipped: ${skipCount} admin users`);
    
    console.log('\n🔑 Admin Credentials:');
    console.log('━'.repeat(50));
    adminUsers.forEach(admin => {
      console.log(`${admin.role.padEnd(15)} | NIM: ${admin.nim.padEnd(15)} | Name: ${admin.name}`);
    });
    console.log('━'.repeat(50));
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdminUsers();
