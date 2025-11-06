const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseStats() {
  try {
    console.log('📊 Database Statistics\n');
    console.log('═'.repeat(60));
    
    // Count users by role
    const totalUsers = await prisma.user.count();
    const voters = await prisma.user.count({ where: { role: 'VOTER' } });
    const admins = await prisma.user.count({ where: { role: 'ADMIN' } });
    const superAdmins = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });
    const monitoring = await prisma.user.count({ where: { role: 'MONITORING' } });
    
    // Count votes
    const totalVotes = await prisma.vote.count();
    const usersWhoVoted = await prisma.user.count({ where: { hasVoted: true } });
    
    // Count candidates
    const totalCandidates = await prisma.candidate.count();
    const activeCandidates = await prisma.candidate.count({ where: { isActive: true } });
    
    // Count voting sessions
    const totalSessions = await prisma.votingSession.count();
    const validatedSessions = await prisma.votingSession.count({ where: { isValidated: true } });
    const usedSessions = await prisma.votingSession.count({ where: { isUsed: true } });
    
    console.log('\n👥 USERS');
    console.log('─'.repeat(60));
    console.log(`Total Users:           ${totalUsers.toString().padStart(6)}`);
    console.log(`├─ Voters:             ${voters.toString().padStart(6)}`);
    console.log(`├─ Admins:             ${admins.toString().padStart(6)}`);
    console.log(`├─ Super Admins:       ${superAdmins.toString().padStart(6)}`);
    console.log(`└─ Monitoring:         ${monitoring.toString().padStart(6)}`);
    
    console.log('\n🗳️  VOTING');
    console.log('─'.repeat(60));
    console.log(`Total Votes:           ${totalVotes.toString().padStart(6)}`);
    console.log(`Users Who Voted:       ${usersWhoVoted.toString().padStart(6)}`);
    console.log(`Voting Participation:  ${totalUsers > 0 ? ((usersWhoVoted / totalUsers) * 100).toFixed(2) : 0}%`);
    
    console.log('\n👤 CANDIDATES');
    console.log('─'.repeat(60));
    console.log(`Total Candidates:      ${totalCandidates.toString().padStart(6)}`);
    console.log(`Active Candidates:     ${activeCandidates.toString().padStart(6)}`);
    
    console.log('\n🎫 VOTING SESSIONS');
    console.log('─'.repeat(60));
    console.log(`Total Sessions:        ${totalSessions.toString().padStart(6)}`);
    console.log(`Validated Sessions:    ${validatedSessions.toString().padStart(6)}`);
    console.log(`Used Sessions:         ${usedSessions.toString().padStart(6)}`);
    
    console.log('\n═'.repeat(60));
    
    // Show sample users by prodi
    console.log('\n📚 USERS BY PROGRAM STUDI (Top 10)');
    console.log('─'.repeat(60));
    
    const usersByProdi = await prisma.user.groupBy({
      by: ['prodi'],
      _count: {
        prodi: true
      },
      orderBy: {
        _count: {
          prodi: 'desc'
        }
      },
      take: 10
    });
    
    usersByProdi.forEach((item, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${item.prodi.padEnd(40)} ${item._count.prodi.toString().padStart(4)} users`);
    });
    
    console.log('\n═'.repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseStats();
