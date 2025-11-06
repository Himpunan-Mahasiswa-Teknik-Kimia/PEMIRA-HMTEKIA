const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupDuplicateVotes() {
  try {
    console.log('🔍 Checking for duplicate votes...');
    
    // Find all votes grouped by userId
    const votes = await prisma.vote.findMany({
      orderBy: {
        createdAt: 'asc' // Keep the oldest vote
      }
    });
    
    // Group votes by userId
    const votesByUser = {};
    votes.forEach(vote => {
      if (!votesByUser[vote.userId]) {
        votesByUser[vote.userId] = [];
      }
      votesByUser[vote.userId].push(vote);
    });
    
    // Find duplicates
    const duplicates = [];
    Object.entries(votesByUser).forEach(([userId, userVotes]) => {
      if (userVotes.length > 1) {
        // Keep the first vote, mark others for deletion
        duplicates.push(...userVotes.slice(1).map(v => v.id));
        console.log(`⚠️  User ${userId} has ${userVotes.length} votes. Keeping oldest, removing ${userVotes.length - 1} duplicate(s).`);
      }
    });
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicate votes found!');
      return;
    }
    
    console.log(`\n🗑️  Deleting ${duplicates.length} duplicate vote(s)...`);
    
    // Delete duplicates
    const result = await prisma.vote.deleteMany({
      where: {
        id: {
          in: duplicates
        }
      }
    });
    
    console.log(`✅ Successfully deleted ${result.count} duplicate vote(s)!`);
    console.log('\n✨ You can now run: npx prisma db push');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicateVotes();
