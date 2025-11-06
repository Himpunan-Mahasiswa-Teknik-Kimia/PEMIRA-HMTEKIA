// app/api/candidates/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest, requireAdmin } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/candidates called')

    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    console.log('Loading candidates for user:', user.id)

    // Get active candidates
    const candidates = await prisma.candidate.findMany({
      where: { 
        isActive: true 
      },
      select: {
        id: true,
        name: true,
        nim: true,
        prodi: true,
        position: true,
        visi: true,
        misi: true,
        photo: true,
        isActive: true
      },
      orderBy: { 
        createdAt: 'asc' 
      }
    })

    console.log('Found candidates:', candidates.length)

    return NextResponse.json({
      candidates
    })
  } catch (error) {
    console.error('Get candidates error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { name, nim, prodi, position, visi, misi, photo } = await request.json()

    if (!name || !nim || !prodi || !position || !visi || !misi) {
      return NextResponse.json(
        { error: 'All fields including position are required' },
        { status: 400 }
      )
    }

    if (position !== 'KETUA_BPH' && position !== 'SENATOR') {
      return NextResponse.json(
        { error: 'Position must be either KETUA_BPH or SENATOR' },
        { status: 400 }
      )
    }

    const candidate = await prisma.candidate.create({
      data: {
        name,
        nim,
        prodi,
        position,
        visi,
        misi,
        photo: photo || null
      }
    })

    return NextResponse.json({ 
      candidate,
      message: 'Candidate created successfully'
    })
  } catch (error) {
    console.error('Create candidate error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}