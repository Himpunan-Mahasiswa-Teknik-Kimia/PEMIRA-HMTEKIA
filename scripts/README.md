# Scripts Documentation

## Database Seeding Scripts

### 1. Import Users from CSV
**File:** `seed-users-from-csv.js`

Import semua data anggota HIMATEKIA dari file CSV ke database.

```bash
node scripts/seed-users-from-csv.js
```

**Source Data:** `public/DATA ALL ANGGOTA HIMATEKIA FIKS.csv`

**What it does:**
- Membaca file CSV yang berisi data anggota HIMATEKIA
- Membuat user baru untuk setiap anggota dengan role `VOTER`
- Skip user yang sudah ada (berdasarkan NIM)
- Menampilkan summary hasil import

**Data yang diimport:**
- NIM
- Nama (dikonversi ke uppercase)
- Program Studi
- Role: VOTER (default)
- hasVoted: false (default)

---

### 2. Create Admin Users
**File:** `seed-admin-users.js`

Membuat akun admin untuk mengelola sistem pemilihan.

```bash
node scripts/seed-admin-users.js
```

**Admin accounts created:**
- **SUPER_ADMIN**: `SUPERADMIN001` - Full access
- **ADMIN 1**: `ADMIN001` - Admin access
- **ADMIN 2**: `ADMIN002` - Admin access
- **MONITORING**: `MONITORING001` - Monitoring access

---

### 3. Cleanup Duplicate Votes
**File:** `cleanup-duplicate-votes.js`

Membersihkan vote duplikat dari database (jika ada user yang vote lebih dari 1x).

```bash
node scripts/cleanup-duplicate-votes.js
```

**What it does:**
- Mencari user yang memiliki lebih dari 1 vote
- Mempertahankan vote pertama (oldest)
- Menghapus vote duplikat
- Menampilkan summary cleanup

---

## Usage Flow

### Initial Setup
1. Setup database dan run migrations:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

2. Import data anggota dari CSV:
   ```bash
   node scripts/seed-users-from-csv.js
   ```

3. Create admin accounts:
   ```bash
   node scripts/seed-admin-users.js
   ```

### Maintenance
- Jika ada vote duplikat:
  ```bash
  node scripts/cleanup-duplicate-votes.js
  ```

---

## Login Credentials

### For Students (Voters)
- **NIM**: NIM mahasiswa (dari CSV)
- **Nama**: Nama lengkap mahasiswa (dari CSV)

### For Admins
- **SUPER ADMIN**
  - NIM: `SUPERADMIN001`
  - Nama: `SUPER ADMIN`

- **ADMIN 1**
  - NIM: `ADMIN001`
  - Nama: `ADMIN 1`

- **ADMIN 2**
  - NIM: `ADMIN002`
  - Nama: `ADMIN 2`

- **MONITORING**
  - NIM: `MONITORING001`
  - Nama: `MONITORING 1`

---

## Notes

- Semua script menggunakan Prisma Client untuk database operations
- Script akan skip data yang sudah ada (idempotent)
- Error handling sudah diimplementasikan untuk setiap operasi
- Summary ditampilkan di akhir setiap proses
