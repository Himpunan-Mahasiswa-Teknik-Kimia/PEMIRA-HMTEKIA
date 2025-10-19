// Debug endpoint to check user voting status
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        nim: true,
        hasVoted: true,
        role: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get user's votes
    const votes = await prisma.vote.findMany({
      where: { userId: user.id },
      include: {
        candidate: {
          select: {
            name: true,
            position: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    // Get voting sessions
    const sessions = await prisma.votingSession.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        nim: user.nim,
        hasVoted: user.hasVoted,
        role: user.role
      },
      votes: votes.map(v => ({
        id: v.id,
        position: v.position,
        candidate: v.candidate.name,
        createdAt: v.createdAt
      })),
      totalVotes: votes.length,
      sessions: sessions.map(s => ({
        id: s.id,
        isValidated: s.isValidated,
        isUsed: s.isUsed,
        expiresAt: s.expiresAt,
        createdAt: s.createdAt
      })),
      summary: {
        hasVotedFlag: user.hasVoted,
        actualVoteCount: votes.length,
        shouldBeMarkedAsVoted: votes.length >= 2,
        mismatch: (votes.length >= 2) !== user.hasVoted
      }
    })
  } catch (error) {
    console.error('Debug user votes error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
