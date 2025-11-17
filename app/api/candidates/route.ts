// app/api/candidates/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest, requireAdmin } from '@/lib/session'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

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

    const contentType = request.headers.get('content-type') || ''

    let name: string
    let nim: string
    let prodi: string
    let position: string
    let visi: string
    let misi: string
    let photo: string | null = null
    let uploadedPhotoPath: string | null = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      name = String(formData.get('name') || '')
      nim = String(formData.get('nim') || '')
      prodi = String(formData.get('prodi') || '')
      position = String(formData.get('position') || '')
      visi = String(formData.get('visi') || '')
      misi = String(formData.get('misi') || '')
      const photoField = formData.get('photo')
      photo = photoField ? String(photoField) : null

      const file = formData.get('photoFile') as File | null
      if (file && typeof file === 'object') {
        const buffer = Buffer.from(await file.arrayBuffer())
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'candidates')
        await mkdir(uploadsDir, { recursive: true })
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
        const fileName = `${Date.now()}_${safeName}`
        const filePath = path.join(uploadsDir, fileName)
        await writeFile(filePath, buffer)
        uploadedPhotoPath = `/uploads/candidates/${fileName}`
      }
    } else {
      const body = await request.json()
      ;({ name, nim, prodi, position, visi, misi, photo } = body)
    }

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
        photo: uploadedPhotoPath || photo || null,
      },
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