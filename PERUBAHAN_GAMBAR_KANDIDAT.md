# Ringkasan Perubahan: Penggunaan Gambar Kandidat Lokal

## Perubahan yang Dilakukan

### 1. Update Component `candidate-management.tsx`

#### a. Penambahan Field Position
- Menambahkan field `position` pada interface `Candidate`
- Menambahkan field `position` pada form data dengan tipe `'KETUA_BPH' | 'SENATOR'`
- Menambahkan dropdown Select untuk memilih posisi kandidat (Ketua BPH atau Senator)
- Menambahkan validasi untuk field position
- Menambahkan kolom "Posisi" pada tabel kandidat

#### b. Update Field Photo
- Mengubah placeholder input foto dari URL eksternal menjadi path lokal
- Menambahkan hint text yang menunjukkan path gambar yang tersedia:
  - `/No.1 Ketua BPH.jpg`
  - `/No.2 Ketua BPH.jpg`
  - `/No.1 Senator.jpg`
  - `/No.2  Senator.jpg`
- Mengubah validasi foto untuk menerima:
  - Path lokal (dimulai dengan `/`)
  - URL eksternal (format URL lengkap)

### 2. Gambar yang Tersedia

Gambar-gambar berikut sudah tersedia di folder `public`:

| File | Deskripsi | Ukuran |
|------|-----------|--------|
| `No.1 Ketua BPH.jpg` | Foto kandidat nomor 1 Ketua BPH | 74.3 KB |
| `No.2 Ketua BPH.jpg` | Foto kandidat nomor 2 Ketua BPH | 20.3 KB |
| `No.1 Senator.jpg` | Foto kandidat nomor 1 Senator | 25.6 KB |
| `No.2  Senator.jpg` | Foto kandidat nomor 2 Senator (perhatikan 2 spasi) | 31.5 KB |

### 3. Cara Menggunakan

#### Menambah Kandidat Baru:
1. Login sebagai Super Admin
2. Buka halaman Super Admin Dashboard
3. Pilih tab "Kandidat"
4. Klik tombol "Tambah Kandidat"
5. Isi form dengan data kandidat:
   - **Nama Lengkap**: Nama kandidat
   - **NIM**: Nomor Induk Mahasiswa
   - **Program Studi**: Nama program studi
   - **Posisi**: Pilih "Ketua BPH" atau "Senator"
   - **URL Foto**: Masukkan path gambar sesuai posisi dan nomor urut
     - Contoh untuk Ketua BPH No. 1: `/No.1 Ketua BPH.jpg`
     - Contoh untuk Senator No. 2: `/No.2  Senator.jpg`
   - **Visi**: Visi kandidat
   - **Misi**: Misi kandidat
6. Klik "Tambah"

#### Mengedit Kandidat:
1. Pada tabel kandidat, klik tombol Edit (ikon pensil)
2. Update field yang diperlukan, termasuk URL Foto jika perlu
3. Klik "Update"

### 4. Validasi Form

Form sekarang memvalidasi:
- ✅ Nama wajib diisi
- ✅ NIM wajib diisi dan harus berupa angka
- ✅ Program Studi wajib diisi
- ✅ **Posisi wajib dipilih** (baru)
- ✅ Visi wajib diisi
- ✅ Misi wajib diisi
- ✅ **Foto harus berupa path lokal (dimulai dengan /) atau URL valid** (diperbarui)

### 5. Tampilan Gambar

Gambar kandidat akan ditampilkan di:
1. **Halaman Voting** (`/vote`):
   - Thumbnail bulat (80x80px) pada card kandidat
   - Gambar lebih besar (128x128px) pada dialog detail visi & misi

2. **Super Admin Dashboard**:
   - Thumbnail bulat (40x40px) pada tabel kandidat
   - Jika gambar gagal dimuat, akan menampilkan inisial nama kandidat

### 6. File yang Diubah

```
components/candidate-management.tsx
```

### 7. Catatan Penting

⚠️ **Perhatian:**
- Pastikan nama file gambar sesuai persis dengan yang ada di folder `public`
- Path harus dimulai dengan `/` untuk gambar lokal
- Perhatikan spasi dalam nama file (terutama `No.2  Senator.jpg` yang memiliki 2 spasi)
- Gambar akan di-serve langsung dari folder `public` oleh Next.js

### 8. Testing

Untuk memastikan perubahan berfungsi dengan baik:

1. ✅ Buka Super Admin Dashboard
2. ✅ Coba tambah kandidat baru dengan gambar lokal
3. ✅ Verifikasi gambar muncul di tabel kandidat
4. ✅ Buka halaman voting dan pastikan gambar muncul di card kandidat
5. ✅ Klik "Lihat Visi & Misi" dan pastikan gambar muncul di dialog

### 9. Troubleshooting

**Gambar tidak muncul?**
- Periksa console browser untuk error
- Pastikan path gambar benar (case-sensitive)
- Pastikan file gambar ada di folder `public`
- Coba refresh browser (Ctrl+F5)

**Error saat menyimpan kandidat?**
- Pastikan semua field wajib sudah diisi
- Pastikan posisi sudah dipilih
- Pastikan path foto dimulai dengan `/` atau berupa URL valid

**Posisi tidak muncul di dropdown?**
- Refresh halaman
- Clear cache browser
- Periksa console untuk error JavaScript
