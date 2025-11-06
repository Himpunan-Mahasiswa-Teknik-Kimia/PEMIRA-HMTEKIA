# Panduan Penggunaan Gambar Kandidat

## Gambar yang Tersedia di Folder Public

Berikut adalah gambar kandidat yang sudah tersedia di folder `public`:

1. **Ketua BPH:**
   - `/No.1 Ketua BPH.jpg` - Kandidat Nomor 1 Ketua BPH
   - `/No.2 Ketua BPH.jpg` - Kandidat Nomor 2 Ketua BPH

2. **Senator:**
   - `/No.1 Senator.jpg` - Kandidat Nomor 1 Senator
   - `/No.2  Senator.jpg` - Kandidat Nomor 2 Senator (perhatikan ada 2 spasi sebelum "Senator")

## Cara Menggunakan Gambar

### 1. Melalui Super Admin Dashboard

1. Login sebagai Super Admin
2. Buka tab "Kandidat"
3. Klik "Tambah Kandidat" atau "Edit" pada kandidat yang sudah ada
4. Di field "URL Foto", masukkan path gambar sesuai dengan posisi dan nomor urut kandidat:
   - Untuk Ketua BPH No. 1: `/No.1 Ketua BPH.jpg`
   - Untuk Ketua BPH No. 2: `/No.2 Ketua BPH.jpg`
   - Untuk Senator No. 1: `/No.1 Senator.jpg`
   - Untuk Senator No. 2: `/No.2  Senator.jpg`

### 2. Format Path Gambar

- **Path lokal:** Harus dimulai dengan `/` (contoh: `/No.1 Ketua BPH.jpg`)
- **URL eksternal:** Harus berupa URL lengkap (contoh: `https://example.com/photo.jpg`)

### 3. Contoh Pengisian Data Kandidat

**Kandidat Ketua BPH No. 1:**
```
Nama: [Nama Kandidat]
NIM: [NIM]
Program Studi: [Prodi]
URL Foto: /No.1 Ketua BPH.jpg
Visi: [Visi kandidat]
Misi: [Misi kandidat]
```

**Kandidat Senator No. 1:**
```
Nama: [Nama Kandidat]
NIM: [NIM]
Program Studi: [Prodi]
URL Foto: /No.1 Senator.jpg
Visi: [Visi kandidat]
Misi: [Misi kandidat]
```

## Catatan Penting

1. **Path harus tepat:** Pastikan path yang dimasukkan sesuai dengan nama file di folder `public`
2. **Case sensitive:** Perhatikan huruf besar/kecil dalam nama file
3. **Spasi:** Perhatikan spasi dalam nama file (terutama untuk "No.2  Senator.jpg" yang memiliki 2 spasi)
4. **Gambar akan otomatis muncul:** Setelah disimpan, gambar akan langsung muncul di halaman voting

## Menambah Gambar Baru

Jika ingin menambahkan gambar kandidat baru:

1. Letakkan file gambar di folder `public`
2. Gunakan nama file yang jelas (contoh: `/No.3 Ketua BPH.jpg`)
3. Masukkan path gambar tersebut di field "URL Foto" saat menambah/edit kandidat

## Troubleshooting

**Gambar tidak muncul?**
- Periksa kembali path yang dimasukkan
- Pastikan file gambar ada di folder `public`
- Pastikan nama file sesuai (termasuk spasi dan huruf besar/kecil)
- Refresh browser jika perlu

**Error saat menyimpan?**
- Pastikan path dimulai dengan `/` untuk gambar lokal
- Atau gunakan URL lengkap untuk gambar eksternal
