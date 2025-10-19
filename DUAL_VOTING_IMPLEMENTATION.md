# Implementasi Dual Voting System - PEMIRA HMTEKIA

## Ringkasan Perubahan

Sistem voting telah diubah dari **single voting (Presiden Mahasiswa)** menjadi **dual voting** untuk:
1. **Ketua Himpunan**
2. **Sekretaris Jenderal (Sekjen)**

Setiap user harus melakukan 2 kali voting (satu untuk setiap posisi).

## Perubahan yang Sudah Dilakukan

### 1. **Database Schema (`prisma/schema.prisma`)**
- ✅ Menambahkan enum `Position` dengan nilai `KETUA_HIMPUNAN` dan `SEKJEN`
- ✅ Menambahkan field `position: Position` pada model `Candidate`
- ✅ Menambahkan field `position: Position` pada model `Vote`
- ✅ Mengubah unique constraint pada `Vote` dari `@unique userId` menjadi `@@unique([userId, position])`
  - Ini memungkinkan user untuk vote 2 kali (satu per posisi)

### 2. **Seed Data (`prisma/seed.js`)**
- ✅ Mengimpor `Position` dari Prisma Client
- ✅ Mengupdate function `upsertCandidate` untuk include parameter `position`
- ✅ Mengganti data kandidat:
  - 2 kandidat untuk **Ketua Himpunan**
  - 2 kandidat untuk **Sekjen**

### 3. **API Endpoint (`app/api/vote/route.ts`)**
- ✅ Mengupdate POST endpoint untuk menerima `position` parameter
- ✅ Validasi bahwa candidate position sesuai dengan vote position
- ✅ Check apakah user sudah vote untuk posisi tertentu
- ✅ Hanya mark `hasVoted = true` jika user sudah vote untuk KEDUA posisi
- ✅ Return `completedVoting` flag untuk indicate apakah voting sudah selesai

### 4. **Candidate Management Component (`components/candidate-management.tsx`)**
- ✅ Menambahkan field `position` pada interface Candidate
- ✅ Menambahkan dropdown select untuk position pada form
- ✅ Menambahkan kolom "Posisi" pada tabel kandidat
- ✅ Mengupdate description: "Kelola data kandidat Ketua Himpunan dan Sekjen"

### 5. **Voting Page UI (`app/vote/page.tsx`)**
- ⚠️ **PARTIALLY COMPLETED** - Sudah diupdate state management tapi perlu rewrit complete logic

## ⚠️ LANGKAH YANG HARUS DILAKUKAN

### Step 1: Reset Database dan Jalankan Migration

```bash
# Di terminal, jalankan:
cd "c:\Users\Edu Juanda Pratama\Documents\HMTEKIA\PEMIRA-HMTEKIA"

# Reset database (PERHATIAN: Ini akan menghapus semua data!)
npx prisma migrate reset --force

# Atau jika tidak ingin reset, buat migration baru:
npx prisma migrate dev --name add_position_to_candidates_and_votes

# Generate Prisma Client
npx prisma generate

# Jalankan seed untuk populate data kandidat baru
npx prisma db seed
```

### Step 2: Restart Development Server

```bash
# Stop server yang sedang running (Ctrl+C)
# Kemudian start lagi:
npm run dev
```

### Step 3: Test di Super Admin Dashboard

1. Buka `http://localhost:3000/super-admin`
2. Login dengan super admin credentials
3. Go to menu **Kandidat**
4. Verify ada 4 kandidat:
   - 2 untuk Ketua Himpunan
   - 2 untuk Sekjen
5. Test tambah kandidat baru dengan memilih position

## Struktur Voting Flow yang Baru

### Untuk User (Voter):

1. **Step 1: Vote Ketua Himpunan**
   - User melihat kandidat Ketua Himpunan
   - Pilih salah satu
   - Submit vote pertama
   
2. **Step 2: Vote Sekjen**
   - Setelah vote pertama berhasil, tampilkan kandidat Sekjen
   - Pilih salah satu
   - Submit vote kedua
   
3. **Complete**
   - Setelah kedua vote selesai, `hasVoted` = true
   - Redirect ke success page

### API Behavior:

```javascript
// Vote pertama (Ketua Himpunan)
POST /api/vote
{
  "candidateId": "xxx",
  "position": "KETUA_HIMPUNAN"
}
// Response: { success: true, completedVoting: false }

// Vote kedua (Sekjen)
POST /api/vote
{
  "candidateId": "yyy",
  "position": "SEKJEN"
}
// Response: { success: true, completedVoting: true }
// hasVoted akan di-set menjadi true
```

## File yang Sudah Dimodifikasi

1. ✅ `prisma/schema.prisma`
2. ✅ `prisma/seed.js`
3. ✅ `app/api/vote/route.ts`
4. ✅ `components/candidate-management.tsx`
5. ⚠️ `app/vote/page.tsx` (needs complete rewrite of voting logic)

## Next Steps untuk Lengkapi Implementation

### Voting Page (`app/vote/page.tsx`) - Perlu Diupdate:

File ini sudah partially updated tapi perlu complete rewrite untuk handle dual voting flow. Berikut yang perlu dilakukan:

1. **Split candidates by position** saat load
2. **Implement step-by-step voting UI**:
   - Step 1: Tampilkan hanya kandidat Ketua Himpunan
   - Step 2: Setelah vote pertama sukses, tampilkan kandidat Sekjen
   - Step 3: After both votes, redirect to success
3. **Update vote submission logic** untuk include position parameter
4. **Handle partial voting state** (user sudah vote untuk satu posisi tapi belum untuk posisi lainnya)

### Monitoring & Reports

Statistics dan reports juga perlu diupdate untuk show separate data for each position.

## Testing Checklist

- [ ] Database migration berhasil
- [ ] Seed data menambahkan 4 kandidat (2 Ketua + 2 Sekjen)
- [ ] Super admin bisa add/edit kandidat dengan memilih position
- [ ] Tabel kandidat menampilkan position badge
- [ ] User bisa vote untuk Ketua Himpunan
- [ ] User bisa vote untuk Sekjen
- [ ] hasVoted hanya true setelah kedua vote selesai
- [ ] User tidak bisa vote 2x untuk posisi yang sama
- [ ] Redirect ke success page setelah kedua vote selesai

## Troubleshooting

### TypeScript Errors tentang 'position'
Jika masih ada TypeScript errors setelah migration, run:
```bash
npx prisma generate
```
Ini akan regenerate Prisma Client dengan type definitions yang updated.

### Database Schema Drift
Jika ada message tentang drift, gunakan:
```bash
npx prisma migrate reset --force
npx prisma db seed
```

## Kontak

Jika ada pertanyaan atau issues, silahkan tanyakan.
