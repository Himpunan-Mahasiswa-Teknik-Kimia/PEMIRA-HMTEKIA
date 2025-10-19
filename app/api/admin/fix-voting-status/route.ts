// Fix hasVoted status for users who have completed voting
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireSuperAdmin(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    console.log('🔧 Starting voting status fix...')

    // Get all users with their vote counts
    const usersWithVotes = await prisma.user.findMany({
      where: {
        role: 'VOTER' // Only check voters
      },
      include: {
        _count: {
          select: { votes: true }
        }
      }
    })

    console.log(`📊 Found ${usersWithVotes.length} voters`)

    const usersToFix = usersWithVotes.filter(
      user => user._count.votes >= 2 && !user.hasVoted
    )

    console.log(`🔧 Found ${usersToFix.length} users to fix`)

    if (usersToFix.length === 0) {
      return NextResponse.json({
        message: 'No users need fixing. All voting statuses are correct.',
        fixed: 0,
        total: usersWithVotes.length
      })
    }

    // Fix each user
    const fixPromises = usersToFix.map(user =>
      prisma.user.update({
        where: { id: user.id },
        data: { hasVoted: true }
      })
    )

    await Promise.all(fixPromises)

    console.log(`✅ Fixed ${usersToFix.length} users`)

    return NextResponse.json({
      message: `Successfully updated voting status for ${usersToFix.length} users`,
      fixed: usersToFix.length,
      total: usersWithVotes.length,
      fixedUsers: usersToFix.map(u => ({
        name: u.name,
        email: u.email,
        nim: u.nim,
        voteCount: u._count.votes
      }))
    })
  } catch (error) {
    console.error('Fix voting status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
