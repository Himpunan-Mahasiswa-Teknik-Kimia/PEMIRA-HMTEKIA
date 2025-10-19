// app/api/voting-status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get user's voting session
    const votingSession = await prisma.votingSession.findFirst({
      where: {
        userId: user.id,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get user's votes (both Ketua Himpunan and Sekjen)
    const votes = await prisma.vote.findMany({
      where: { userId: user.id },
      include: {
        candidate: {
          select: {
            name: true,
            nim: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    const canVote = votingSession?.isValidated &&
      !votingSession.isUsed &&
      !user.hasVoted &&
      new Date() < votingSession.expiresAt

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        nim: user.nim,
        hasVoted: user.hasVoted
      },
      votingSession: votingSession ? {
        id: votingSession.id,
        isValidated: votingSession.isValidated,
        isUsed: votingSession.isUsed,
        expiresAt: votingSession.expiresAt
      } : null,
      votes: votes.map(vote => ({
        id: vote.id,
        position: vote.position,
        candidateName: vote.candidate.name,
        candidateNim: vote.candidate.nim,
        createdAt: vote.createdAt
      })),
      canVote
    })
  } catch (error) {
    console.error('Get voting status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}