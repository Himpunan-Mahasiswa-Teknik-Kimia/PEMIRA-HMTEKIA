// app/api/vote/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/vote called')

    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { candidateId, position } = await request.json()

    if (!candidateId || !position) {
      return NextResponse.json(
        { error: 'Candidate ID and position are required' },
        { status: 400 }
      )
    }

    // Validate position
    if (!['KETUA_HIMPUNAN', 'SEKJEN'].includes(position)) {
      return NextResponse.json(
        { error: 'Invalid position' },
        { status: 400 }
      )
    }

    console.log('Voting for candidate:', candidateId, 'position:', position)

    // Verify candidate exists, is active, and matches the position
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId }
    })

    if (!candidate || !candidate.isActive) {
      return NextResponse.json(
        { error: 'Candidate not found or not active' },
        { status: 404 }
      )
    }

    if (candidate.position !== position) {
      return NextResponse.json(
        { error: 'Candidate position mismatch' },
        { status: 400 }
      )
    }

    // Check if user already voted for this position
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_position: {
          userId: user.id,
          position: position
        }
      }
    })

    if (existingVote) {
      return NextResponse.json(
        { error: `Anda sudah voting untuk posisi ${position === 'KETUA_HIMPUNAN' ? 'Ketua Himpunan' : 'Sekjen'}` },
        { status: 400 }
      )
    }

    // Check if user has a validated voting session
    const votingSession = await prisma.votingSession.findFirst({
      where: {
        userId: user.id,
        isValidated: true,
        isUsed: false,
        expiresAt: { gt: new Date() }
      }
    })

    if (!votingSession) {
      return NextResponse.json(
        { error: 'No valid voting session found. Please get your QR code validated first.' },
        { status: 400 }
      )
    }

    console.log('Valid voting session found:', votingSession.id)

    // Create vote in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the vote
      const vote = await tx.vote.create({
        data: {
          userId: user.id,
          candidateId: candidateId,
          position: position
        }
      })

      // Check if user has voted for both positions
      const userVotes = await tx.vote.findMany({
        where: { userId: user.id }
      })

      // If user has voted for both positions, mark session as used and user as hasVoted
      if (userVotes.length >= 2) {
        await tx.user.update({
          where: { id: user.id },
          data: { hasVoted: true }
        })

        await tx.votingSession.update({
          where: { id: votingSession.id },
          data: { isUsed: true }
        })
      }

      return vote
    })

    console.log('Vote recorded successfully:', result.id)

    // Check if user has completed both votes
    const totalVotes = await prisma.vote.count({
      where: { userId: user.id }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Vote recorded successfully',
      vote: {
        id: result.id,
        candidateId: result.candidateId,
        position: result.position
      },
      completedVoting: totalVotes >= 2
    })
  } catch (error) {
    console.error('Vote error:', error)
    
    // Handle Prisma unique constraint violation (double voting attempt)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'You have already voted for this position' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const voteStats = await prisma.candidate.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { votes: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    const totalVotes = await prisma.vote.count()

    const stats = voteStats.map(candidate => ({
      candidateId: candidate.id,
      candidateName: candidate.name,
      voteCount: candidate._count.votes,
      percentage: totalVotes > 0 ? ((candidate._count.votes / totalVotes) * 100).toFixed(2) : 0
    }))

    return NextResponse.json({ 
      stats,
      totalVotes 
    })
  } catch (error) {
    console.error('Get vote stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}