# HMTEKIA Election - Pemilihan Ketua Himpunan & Sekretaris Jenderal

## Overview
Sistem voting berbasis Next.js untuk pemilihan Ketua Himpunan (Kahim) dan Sekretaris Jenderal (Sekjen) Himpunan Mahasiswa Teknik Kimia ITERA (HMTEKIA). Aplikasi ini menyediakan platform aman untuk mahasiswa melakukan registrasi, mendapatkan QR code untuk validasi, dan memberikan suara.

## Identitas HMTEKIA
- **Organisasi**: Himpunan Mahasiswa Teknik Kimia ITERA (HMTEKIA)
- **Warna Branding**: #4d1793 (ungu), #070904 (hitam), dan putih
- **Sistem Pemilihan**: Dual voting - Ketua Himpunan dan Sekretaris Jenderal

## Project Architecture
- **Framework**: Next.js 14.2.32 with TypeScript
- **UI Library**: Radix UI components with Tailwind CSS v4
- **Authentication**: JWT-based authentication system with httpOnly cookies
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Configured for Replit deployment

## Key Features
- **Dual Voting System**: Mahasiswa voting untuk 2 posisi (Ketua Himpunan & Sekjen)
- **Two-Step Voting Flow**: 
  1. Vote untuk Ketua Himpunan terlebih dahulu
  2. Dilanjutkan vote untuk Sekretaris Jenderal
- **QR Code Generation**: Sistem generate QR code untuk validasi voting
- **Admin Validation**: Panitia dapat memvalidasi mahasiswa menggunakan QR scanner atau redeem code
- **Real-time Tracking**: Tracking hasil voting secara real-time
- **Multiple Admin Roles**: 
  - VOTER: Mahasiswa yang bisa voting
  - ADMIN: Panitia yang bisa validasi
  - SUPER_ADMIN: Admin penuh untuk manajemen sistem
  - MONITORING: Akses monitoring hasil

## Database Schema
### Position Enum
- `KETUA_HIMPUNAN` - Kandidat Ketua Himpunan
- `SEKJEN` - Kandidat Sekretaris Jenderal

### Key Models
- **User**: Data mahasiswa dengan role-based access
- **Candidate**: Data kandidat dengan position (KETUA_HIMPUNAN atau SEKJEN)
- **Vote**: Record voting dengan unique constraint per position per user
- **VotingSession**: Session untuk QR code validation
- **AdminLog**: Logging aktivitas admin

## Voting Workflow
1. **Login/Register**: Mahasiswa login dengan credentials
2. **Generate QR Code**: Sistem generate QR code yang valid selama 5 menit
3. **Validation**: Panitia scan QR code untuk validasi identitas
4. **Vote Step 1**: Pilih kandidat Ketua Himpunan
5. **Vote Step 2**: Pilih kandidat Sekretaris Jenderal
6. **Success**: Voting selesai, user diarahkan ke halaman sukses

## Recent Changes (October 19, 2025)
**HMTEKIA REBRANDING & DUAL VOTING SYSTEM:**
- **Complete Rebranding**: Changed from ITERA Election to HMTEKIA Election
- **New Color Scheme**: Purple (#4d1793), Black (#070904), and White
- **Dual Voting System**: Implemented two-step voting for Kahim & Sekjen
- **Updated UI**: All pages updated with HMTEKIA branding
- **Enhanced Vote Page**: Complete rewrite to support dual voting flow
- **Position-based Voting**: Vote API supports position parameter
- **Database Ready**: Schema already supports dual voting with Position enum

## Development Setup
- **Dev Server**: Port 5000 with 0.0.0.0 hostname for Replit
- **Package Manager**: npm
- **TypeScript**: Enabled with strict type checking
- **Hot Reload**: Fast Refresh enabled

## File Structure
- `/app` - Next.js app router (pages, API routes)
- `/components` - Reusable UI components
- `/lib` - Utilities, Prisma client, types
- `/public` - Static assets
- `/prisma` - Database schema and migrations
- `/scripts` - SQL scripts for database setup

## API Endpoints
### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Voting
- `GET /api/candidates` - Get all active candidates
- `POST /api/vote` - Submit vote (with position parameter)
- `GET /api/vote` - Get voting statistics

### QR Code & Sessions
- `POST /api/qr-code` - Generate QR code
- `GET /api/qr-code` - Get user's voting session
- `POST /api/admin/validate-session` - Validate voting session

### Admin
- `GET /api/admin/stats` - Get admin statistics
- `GET /api/admin/pending-sessions` - Get pending validations
- `GET /api/admin/recent-validations` - Get recent validations

## Current Status
✅ Fully functional HMTEKIA voting system
✅ All dependencies installed
✅ Development server running on port 5000
✅ Dual voting system implemented
✅ HMTEKIA branding complete
✅ Purple color theme applied
✅ All pages updated with new branding

## User Preferences
- Indonesian language interface
- HMTEKIA branding with purple theme
- Dual voting workflow (Kahim & Sekjen)
- Secure voting with QR code validation
- Real-time voting statistics

## Technical Notes
- Uses JWT with httpOnly cookies for security
- Prisma for type-safe database access
- Next.js 14 with App Router
- Tailwind CSS v4 for styling
- Radix UI for accessible components
