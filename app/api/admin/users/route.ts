import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, requireSuperAdmin } from '@/lib/session'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Only super admin can create new users
    const authResult = await requireSuperAdmin(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { email, nim, name, prodi, gender, phone, role, password } = await request.json()

    // Validate required fields
    if (!email || !nim || !name || !prodi || !gender || !role || !password) {
      return NextResponse.json(
        { error: 'Semua field harus diisi kecuali nomor telepon' },
        { status: 400 }
      )
    }

    // Validate role
    if (!['VOTER', 'ADMIN', 'SUPER_ADMIN', 'MONITORING'].includes(role)) {
      return NextResponse.json(
        { error: 'Role tidak valid' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      )
    }

    // Check if email or NIM already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { nim }
        ]
      }
    })

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: 'Email sudah terdaftar' },
          { status: 400 }
        )
      }
      if (existingUser.nim === nim) {
        return NextResponse.json(
          { error: 'NIM sudah terdaftar' },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        nim,
        name,
        prodi,
        gender,
        phone: phone || null,
        role,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        nim: true,
        name: true,
        prodi: true,
        gender: true,
        phone: true,
        role: true,
        hasVoted: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({ 
      message: 'User berhasil dibuat',
      user: newUser 
    }, { status: 201 })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}