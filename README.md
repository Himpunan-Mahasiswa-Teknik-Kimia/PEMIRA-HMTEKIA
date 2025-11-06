# PEMIRA HIMATEKIA 2025

Sistem Pemilihan Umum Online untuk HIMATEKIA (Himpunan Mahasiswa Teknik Kimia) ITERA 2025.

## 🎨 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui
- **Authentication**: JWT
- **QR Code**: qrcode.react

## 🎨 Color Scheme

- **Primary**: `#4d178f` (Purple)
- **Background Dark**: `#070904` (Black)
- **Background Light**: `#fefefe` (White)

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Create a `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/PEMIRA-ITERA"
JWT_SECRET="your-secret-key-here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Setup Database
```bash
# Push schema to database
npm run db:push

# Generate Prisma Client
npm run db:generate
```

### 4. Seed Database
```bash
# Import all users from CSV
npm run seed:users

# Create admin accounts
npm run seed:admins

# Or run both at once
npm run seed:all
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📊 Database Scripts

### Seeding
- `npm run seed:users` - Import users from CSV file
- `npm run seed:admins` - Create admin accounts
- `npm run seed:all` - Run both seeding scripts

### Management
- `npm run db:stats` - View database statistics
- `npm run db:cleanup` - Clean up duplicate votes
- `npm run db:studio` - Open Prisma Studio

### Prisma
- `npm run db:push` - Push schema changes to database
- `npm run db:generate` - Generate Prisma Client

## 👥 User Roles

### 1. VOTER (Pemilih)
- Login dengan NIM dan Nama
- Generate QR Code untuk voting
- Validasi QR Code di admin
- Vote untuk kandidat

### 2. ADMIN
- Validasi QR Code pemilih
- Lihat statistik voting
- Manage voting sessions

### 3. SUPER_ADMIN
- Full access ke semua fitur
- Manage candidates
- Manage users
- View detailed analytics

### 4. MONITORING
- View real-time voting statistics
- Monitor voting progress
- Read-only access

## 🔑 Default Admin Credentials

Login menggunakan NIM dan Nama:

| Role | NIM | Nama |
|------|-----|------|
| Super Admin | `SUPERADMIN001` | `SUPER ADMIN` |
| Admin 1 | `ADMIN001` | `ADMIN 1` |
| Admin 2 | `ADMIN002` | `ADMIN 2` |
| Monitoring | `MONITORING001` | `MONITORING 1` |

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── candidates/   # Candidate management
│   │   └── votes/        # Voting endpoints
│   ├── admin/            # Admin dashboard
│   ├── super-admin/      # Super admin panel
│   ├── monitoring/       # Monitoring dashboard
│   ├── login/            # Login page
│   ├── generate-code/    # QR Code generation
│   └── vote/             # Voting page
├── components/            # React components
│   └── ui/               # UI components (shadcn)
├── lib/                   # Utilities
│   ├── prisma.ts         # Prisma client
│   └── icons.ts          # Icon exports
├── prisma/               # Database
│   └── schema.prisma     # Database schema
├── public/               # Static files
│   └── DATA ALL ANGGOTA HIMATEKIA FIKS.csv
└── scripts/              # Utility scripts
    ├── seed-users-from-csv.js
    ├── seed-admin-users.js
    ├── check-database-stats.js
    └── cleanup-duplicate-votes.js
```

## 🗳️ Voting Flow

1. **Pemilih Login**
   - Input NIM dan Nama
   - Sistem validasi data

2. **Generate QR Code**
   - Pemilih generate QR Code unik
   - QR Code berisi redeem code

3. **Validasi Admin**
   - Admin scan QR Code
   - Admin validasi identitas pemilih
   - QR Code diaktifkan untuk voting

4. **Voting (2 Kandidat)**
   - **Pilih Ketua BPH**: Pemilih memilih 1 kandidat Ketua BPH
   - **Pilih Senator**: Pemilih memilih 1 kandidat Senator
   - Setiap vote disimpan terpisah
   - Vote bersifat anonymous

5. **Konfirmasi**
   - Pemilih melihat konfirmasi sukses untuk setiap vote
   - Status `hasVotedKetuaBPH` dan `hasVotedSenator` diupdate
   - Session ditandai selesai setelah kedua vote complete

## 📊 Database Schema

### User
- id, nim (unique), name, prodi
- role: VOTER | ADMIN | SUPER_ADMIN | MONITORING
- hasVoted, hasVotedKetuaBPH, hasVotedSenator: boolean

### Candidate
- id, name, nim, prodi
- **position**: KETUA_BPH | SENATOR
- visi, misi, photo
- isActive: boolean
- Unique constraint: [nim, position]

### Vote
- id, userId, candidateId
- **position**: KETUA_BPH | SENATOR
- Unique constraint: [userId, position]
- One vote per user per position (max 2 votes total)

### VotingSession
- id, userId, qrCode, redeemCode
- isValidated, isUsed
- validatedBy, validatedAt

## 🔒 Security Features

- JWT-based authentication
- HTTP-only cookies
- One vote per user per position (enforced by unique constraint)
- Each user can vote for 1 Ketua BPH and 1 Senator
- QR Code validation by admin
- Session expiration
- Role-based access control

## 🎯 Kandidat PEMIRA 2025

### Calon Ketua BPH
1. **Raffi Ramadhany & Ahmad Naufal Syafiq** (Promotor)
2. **Irfan Ananda Putra & Aidi Tahdidil Fikri** (Promotor)

### Calon Senator
1. **Cahyo Kusuma WP & I Putu Arya Ditha** (Promotor)
2. **Rizqiya Ayyasy Ayodia & Laili Junia** (Promotor)

*Lihat detail visi & misi di [KANDIDAT-PEMIRA-2025.md](./KANDIDAT-PEMIRA-2025.md)*

## 📝 Notes

- Data pemilih diimport dari CSV (570 anggota HIMATEKIA)
- **Dual Voting System**: Setiap user vote untuk 2 posisi (Ketua BPH & Senator)
- QR Code harus divalidasi admin sebelum bisa digunakan
- Vote bersifat anonymous (tidak ada link langsung user-candidate di UI)
- Sistem mendukung real-time monitoring
- Session ditandai selesai setelah kedua vote complete

## 🛠️ Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Open Prisma Studio
npm run db:studio

# Check database stats
npm run db:stats
```

## 📄 License

Private - HIMATEKIA ITERA 2025
