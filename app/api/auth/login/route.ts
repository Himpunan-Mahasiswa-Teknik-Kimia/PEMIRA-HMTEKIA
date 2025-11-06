import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { email, password, nim, name } = await request.json()
    
    // Login dengan NIM + Nama (untuk semua user termasuk admin)
    if (nim && name) {
      console.log('Login attempt with NIM:', nim)
      
      const nimTrim = String(nim).trim()
      const nimDigits = nimTrim.replace(/\D/g, '')
      const nameTrim = String(name).trim()

      // Find user by NIM
      const user = await prisma.user.findUnique({
        where: { nim: nimDigits },
        select: {
          id: true,
          name: true,
          nim: true,
          prodi: true,
          role: true,
          hasVoted: true,
          hasVotedKetuaBPH: true,
          hasVotedSenator: true
        }
      })

      if (!user) {
        return NextResponse.json(
          { error: 'NIM tidak ditemukan' },
          { status: 401 }
        )
      }

      // Validasi nama (case insensitive)
      if (user.name.toLowerCase() !== nameTrim.toLowerCase()) {
        return NextResponse.json(
          { error: 'Data tidak valid' },
          { status: 401 }
        )
      }

      console.log('Login successful for user:', user.nim, 'Role:', user.role)
      
      // Log login event
      try {
        const actionType = user.role === 'VOTER' ? 'STUDENT_LOGIN_SUCCESS' : 'ADMIN_LOGIN_SUCCESS'
        await prisma.adminLog.create({
          data: {
            adminId: user.id,
            action: actionType,
            target: user.nim,
            details: { role: user.role },
            ipAddress: request.headers.get('x-forwarded-for') || request.ip || ''
          }
        })
      } catch (e) {
        console.warn('Failed to log login event:', e)
      }

      // Create response with user data
      const response = NextResponse.json({
        user: user,
        message: 'Login berhasil'
      })

      // Create JWT session token
      const jwtSecret = process.env.JWT_SECRET || 'itera-election-secret-key-2025'
      const sessionToken = jwt.sign(
        { 
          userId: user.id, 
          role: user.role,
          iat: Math.floor(Date.now() / 1000)
        },
        jwtSecret,
        { expiresIn: '7d' }
      )

      // Set secure session cookie
      // Note: secure should be false if not using HTTPS
      response.cookies.set('user-session', sessionToken, {
        httpOnly: true,
        secure: false, // Set to true only if using HTTPS
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      })

      return response;
    }
    

    return NextResponse.json(
      { error: 'Data login tidak valid' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    );
  }
}