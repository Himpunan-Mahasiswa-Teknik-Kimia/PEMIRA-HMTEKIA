// app/api/candidates/[id]/route.ts - Enhanced with debugging
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

// UPDATE candidate with enhanced debugging
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and admin role
    const user = await requireAdmin(request)

    const body = await request.json()
    console.log('🔍 PUT Request body:', body)

    const { name, nim, prodi, position, visi, misi, photo, isActive } = body

    // Enhanced validation with specific field checking
    const missingFields = []
    
    if (!name || name.trim() === '') missingFields.push('name')
    if (!nim || nim.trim() === '') missingFields.push('nim')
    if (!prodi || prodi.trim() === '') missingFields.push('prodi')
    if (!position || position.trim() === '') missingFields.push('position')
    if (!visi || visi.trim() === '') missingFields.push('visi')
    if (!misi || misi.trim() === '') missingFields.push('misi')

    if (missingFields.length > 0) {
      console.log('❌ Missing fields:', missingFields)
      return NextResponse.json(
        { 
          error: `Missing required fields: ${missingFields.join(', ')}`,
          missingFields,
          receivedData: { name, nim, prodi, position, visi, misi }
        },
        { status: 400 }
      )
    }

    // Check if candidate exists
    const existingCandidate = await prisma.candidate.findUnique({
      where: { id: params.id }
    })

    if (!existingCandidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      )
    }

    console.log('✅ Updating candidate:', params.id)

    // Update candidate
    const updatedCandidate = await prisma.candidate.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        nim: nim.trim(),
        prodi: prodi.trim(),
        position: position,
        visi: visi.trim(),
        misi: misi.trim(),
        photo: photo || null,
        isActive: isActive !== undefined ? isActive : existingCandidate.isActive
      },
      include: {
        _count: {
          select: { votes: true }
        }
      }
    })

    const candidateWithVoteCount = {
      id: updatedCandidate.id,
      name: updatedCandidate.name,
      nim: updatedCandidate.nim,
      prodi: updatedCandidate.prodi,
      position: updatedCandidate.position,
      visi: updatedCandidate.visi,
      misi: updatedCandidate.misi,
      photo: updatedCandidate.photo,
      isActive: updatedCandidate.isActive,
      voteCount: updatedCandidate._count.votes,
      createdAt: updatedCandidate.createdAt
    }

    console.log('✅ Candidate updated successfully')
    return NextResponse.json({ 
      candidate: candidateWithVoteCount,
      message: 'Candidate updated successfully' 
    })

  } catch (error) {
    console.error('💥 Update candidate error:', error)
    
    // Handle specific authentication errors
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json(
          { error: 'Not authenticated' }, 
          { status: 401 }
        )
      }
      if (error.message === 'Admin access required') {
        return NextResponse.json(
          { error: 'Unauthorized' }, 
          { status: 403 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// CREATE candidate with enhanced debugging  
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin(request)

    const body = await request.json()
    console.log('🔍 POST Request body:', body)

    const { name, nim, prodi, position, visi, misi, photo } = body

    // Enhanced validation with specific field checking
    const missingFields = []
    
    if (!name || name.trim() === '') missingFields.push('name')
    if (!nim || nim.trim() === '') missingFields.push('nim') 
    if (!prodi || prodi.trim() === '') missingFields.push('prodi')
    if (!position || position.trim() === '') missingFields.push('position')
    if (!visi || visi.trim() === '') missingFields.push('visi')
    if (!misi || misi.trim() === '') missingFields.push('misi')

    if (missingFields.length > 0) {
      console.log('❌ Missing fields:', missingFields)
      return NextResponse.json(
        { 
          error: `Missing required fields: ${missingFields.join(', ')}`,
          missingFields,
          receivedData: { name, nim, prodi, position, visi, misi }
        },
        { status: 400 }
      )
    }

    console.log('✅ Creating new candidate')

    const candidate = await prisma.candidate.create({
      data: {
        name: name.trim(),
        nim: nim.trim(), 
        prodi: prodi.trim(),
        position: position,
        visi: visi.trim(),
        misi: misi.trim(),
        photo: photo || null
      }
    })

    console.log('✅ Candidate created successfully:', candidate.id)
    return NextResponse.json({ candidate })

  } catch (error) {
    console.error('💥 Create candidate error:', error)
    
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json(
          { error: 'Not authenticated' }, 
          { status: 401 }
        )
      }
      if (error.message === 'Admin access required') {
        return NextResponse.json(
          { error: 'Unauthorized' }, 
          { status: 403 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE candidate
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin(request)

    // Check if candidate exists
    const existingCandidate = await prisma.candidate.findUnique({
      where: { id: params.id }
    })

    if (!existingCandidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      )
    }

    console.log('✅ Deleting candidate:', params.id)

    // Delete the candidate
    await prisma.candidate.delete({
      where: { id: params.id }
    })

    console.log('✅ Candidate deleted successfully')
    return NextResponse.json({ 
      message: 'Candidate deleted successfully' 
    })

  } catch (error) {
    console.error('💥 Delete candidate error:', error)
    
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json(
          { error: 'Not authenticated' }, 
          { status: 401 }
        )
      }
      if (error.message === 'Admin access required') {
        return NextResponse.json(
          { error: 'Unauthorized' }, 
          { status: 403 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}