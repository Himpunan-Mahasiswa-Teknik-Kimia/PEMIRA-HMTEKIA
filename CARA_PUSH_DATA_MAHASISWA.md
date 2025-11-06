# Cara Push Data Mahasiswa ke Database

## Script yang Tersedia

Script untuk push data mahasiswa dari file CSV ke database sudah tersedia dan siap digunakan.

## File CSV

Data mahasiswa berada di:
```
public/DATA ALL ANGGOTA HIMATEKIA FIKS.csv
```

Format CSV:
```
,No.,Nama Anggota,NIM,Prodi,Angkatan,Jenis Kelamin,Status
,1,Yosia Abdi Cahyono,118280005,Teknik Kimia,2018,Laki-laki,Anggota Tetap
```

## Cara Menjalankan

### Opsi 1: Menggunakan npm run (Recommended)

```bash
npm run push:mahasiswa
```

### Opsi 2: Menggunakan script seed:users

```bash
npm run seed:users
```

### Opsi 3: Menjalankan langsung dengan node

```bash
node scripts/seed-users-from-csv.js
```

## Proses yang Dilakukan Script

1. ✅ Membaca file CSV dari folder `public`
2. ✅ Mem-parse setiap baris data mahasiswa
3. ✅ Mengecek apakah NIM sudah ada di database
4. ✅ Jika belum ada, membuat user baru dengan:
   - **NIM**: Nomor Induk Mahasiswa
   - **Nama**: Nama lengkap (diubah ke UPPERCASE)
   - **Prodi**: Program Studi
   - **Role**: VOTER (default)
   - **hasVoted**: false (default)
   - **hasVotedKetuaBPH**: false (default)
   - **hasVotedSenator**: false (default)
5. ✅ Skip jika NIM sudah ada (tidak duplikat)
6. ✅ Menampilkan summary hasil import

## Output yang Diharapkan

```
📂 Reading CSV file...
📋 Headers: [ '', 'No.', 'Nama Anggota', 'NIM', 'Prodi', 'Angkatan', 'Jenis Kelamin', 'Status' ]
📊 Total rows: 571
✅ Row 1: Created user 118280005 - Yosia Abdi Cahyono
✅ Row 2: Created user 118280012 - Fourka Fitra R.
⏭️  Row 3: User 118280013 already exists, skipping...
...

📊 Summary:
✅ Successfully created: 500 users
⏭️  Skipped: 71 users
❌ Errors: 0 users
📈 Total processed: 571 users
```

## Persyaratan

Sebelum menjalankan script, pastikan:

1. ✅ Database sudah dibuat dan terkoneksi
2. ✅ Prisma schema sudah di-push ke database:
   ```bash
   npm run db:push
   ```
3. ✅ Prisma client sudah di-generate:
   ```bash
   npm run db:generate
   ```
4. ✅ File `.env` sudah dikonfigurasi dengan `DATABASE_URL` yang benar

## Troubleshooting

### Error: Cannot find module '@prisma/client'

**Solusi:**
```bash
npm install
npm run db:generate
```

### Error: Can't reach database server

**Solusi:**
- Periksa koneksi database di file `.env`
- Pastikan database server berjalan
- Periksa `DATABASE_URL` sudah benar

### Error: CSV file not found

**Solusi:**
- Pastikan file `DATA ALL ANGGOTA HIMATEKIA FIKS.csv` ada di folder `public`
- Periksa nama file sesuai (case-sensitive)

### Data tidak masuk / Semua di-skip

**Kemungkinan:**
- Data sudah pernah di-import sebelumnya
- Script akan skip NIM yang sudah ada di database

**Solusi untuk re-import:**
1. Hapus data user lama dari database (hati-hati!)
2. Atau gunakan Prisma Studio untuk manage data:
   ```bash
   npm run db:studio
   ```

## Melihat Hasil Import

### Opsi 1: Menggunakan Prisma Studio

```bash
npm run db:studio
```

Buka browser di `http://localhost:5555` untuk melihat data.

### Opsi 2: Menggunakan script stats

```bash
npm run db:stats
```

### Opsi 3: Query langsung di database

```sql
SELECT COUNT(*) FROM "User" WHERE role = 'VOTER';
SELECT * FROM "User" LIMIT 10;
```

## Script Terkait Lainnya

```bash
# Push semua data (users + admins + candidates)
npm run seed:all

# Push data admin
npm run seed:admins

# Push data kandidat
npm run seed:candidates

# Lihat statistik database
npm run db:stats

# Buka Prisma Studio
npm run db:studio
```

## Catatan Penting

⚠️ **Perhatian:**
- Script ini **tidak akan menghapus** data yang sudah ada
- Script akan **skip** NIM yang sudah terdaftar
- Nama mahasiswa akan otomatis diubah ke **UPPERCASE**
- Pastikan backup database sebelum melakukan import besar-besaran

## Data yang Di-import

Dari file CSV, script akan mengambil:
- ✅ **NIM** (wajib)
- ✅ **Nama** (wajib)
- ✅ **Prodi** (wajib)
- ⏭️ Angkatan (tidak disimpan di database)
- ⏭️ Jenis Kelamin (tidak disimpan di database)
- ⏭️ Status (tidak disimpan di database)

## Contoh Penggunaan

```bash
# 1. Pastikan database siap
npm run db:push
npm run db:generate

# 2. Push data mahasiswa
npm run push:mahasiswa

# 3. Cek hasil
npm run db:stats

# 4. Lihat data di Prisma Studio
npm run db:studio
```

Selesai! Data mahasiswa sudah masuk ke database dan siap untuk voting.
