const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateToDualVoting() {
  try {
    console.log('🔄 Starting migration to dual voting system...\n');
    
    // Step 1: Backup existing data
    console.log('📦 Backing up existing data...');
    const existingCandidates = await prisma.candidate.findMany();
    const existingVotes = await prisma.vote.findMany();
    
    console.log(`   Found ${existingCandidates.length} candidates`);
    console.log(`   Found ${existingVotes.length} votes\n`);
    
    // Step 2: Clear existing data
    console.log('🗑️  Clearing existing votes and candidates...');
    await prisma.vote.deleteMany({});
    await prisma.candidate.deleteMany({});
    console.log('   ✅ Cleared\n');
    
    // Step 3: Reset hasVoted flags
    console.log('🔄 Resetting user voting status...');
    await prisma.user.updateMany({
      data: {
        hasVoted: false
      }
    });
    console.log('   ✅ Reset complete\n');
    
    console.log('✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: npx prisma db push');
    console.log('   2. Run: npx prisma generate');
    console.log('   3. Add new candidates with position field (KETUA_BPH or SENATOR)');
    console.log('\n⚠️  Note: All previous votes have been cleared for the new system.');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateToDualVoting();
