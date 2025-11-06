# Fix Database Connection Error

## Error yang Terjadi

```
Authentication failed against database server, 
the provided database credentials for `postgres` are not valid.
```

## Penyebab

Script berjalan di **server production** (`/root/PEMIRA-HMTEKIA/`) tapi:
1. Database URL mengarah ke `localhost:5432`
2. Kredensial database tidak valid atau tidak bisa diakses dari server

## Solusi

### 1. Cek Lokasi Eksekusi

Script berjalan di server, bukan di local. Path: `/root/PEMIRA-HMTEKIA/`

### 2. Update DATABASE_URL di Server

Edit file `.env` di **server** dengan kredensial database yang benar:

```bash
# SSH ke server
ssh user@your-server

# Masuk ke direktori project
cd /root/PEMIRA-HMTEKIA

# Edit .env
nano .env
```

### 3. Format DATABASE_URL yang Benar

```env
# Format umum:
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME"

# Contoh untuk database lokal di server:
DATABASE_URL="postgresql://postgres:PASSWORD_ANDA@localhost:5432/PEMIRA-HMTEKIA"

# Contoh untuk database eksternal (Neon, Supabase, dll):
DATABASE_URL="postgresql://user:pass@host.region.provider.com:5432/dbname?sslmode=require"
```

### 4. Kemungkinan Skenario

#### Skenario A: Database PostgreSQL di Server yang Sama

```env
DATABASE_URL="postgresql://postgres:PASSWORD_BENAR@localhost:5432/PEMIRA-HMTEKIA"
```

**Cek:**
```bash
# Pastikan PostgreSQL berjalan
sudo systemctl status postgresql

# Test koneksi
psql -U postgres -h localhost -d PEMIRA-HMTEKIA
```

#### Skenario B: Database di Cloud (Neon, Supabase, Railway, dll)

```env
# Neon
DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"

# Supabase
DATABASE_URL="postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres"

# Railway
DATABASE_URL="postgresql://postgres:pass@containers-us-west-xxx.railway.app:5432/railway"
```

#### Skenario C: Database di Server Lain

```env
DATABASE_URL="postgresql://postgres:PASSWORD@IP_SERVER_DB:5432/PEMIRA-HMTEKIA"
```

### 5. Langkah-langkah Fix

**Di Server:**

```bash
# 1. Masuk ke direktori project
cd /root/PEMIRA-HMTEKIA

# 2. Backup .env lama
cp .env .env.backup

# 3. Edit .env dengan kredensial yang benar
nano .env

# 4. Update DATABASE_URL dengan kredensial yang valid
# Simpan: Ctrl+O, Enter, Ctrl+X

# 5. Test koneksi database
npm run db:push

# 6. Generate Prisma Client
npm run db:generate

# 7. Coba jalankan script lagi
npm run push:mahasiswa
```

### 6. Verifikasi Kredensial Database

```bash
# Test koneksi manual
psql -U postgres -h HOST -p PORT -d DATABASE_NAME

# Atau menggunakan connection string
psql "postgresql://user:pass@host:port/dbname"
```

### 7. Troubleshooting Lanjutan

#### Error: Connection refused

**Penyebab:** PostgreSQL tidak berjalan atau tidak bisa diakses

**Solusi:**
```bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Cek status
sudo systemctl status postgresql
```

#### Error: Password authentication failed

**Penyebab:** Password salah

**Solusi:**
1. Reset password PostgreSQL:
```bash
sudo -u postgres psql
ALTER USER postgres PASSWORD 'PASSWORD_BARU';
\q
```

2. Update `.env` dengan password baru

#### Error: Database does not exist

**Penyebab:** Database belum dibuat

**Solusi:**
```bash
# Buat database
sudo -u postgres psql
CREATE DATABASE "PEMIRA-HMTEKIA";
\q

# Atau
createdb -U postgres PEMIRA-HMTEKIA
```

#### Error: Connection timeout

**Penyebab:** Firewall atau network issue

**Solusi:**
```bash
# Cek firewall
sudo ufw status
sudo ufw allow 5432/tcp

# Cek PostgreSQL config
sudo nano /etc/postgresql/*/main/postgresql.conf
# Pastikan: listen_addresses = '*' atau 'localhost'

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 8. Setelah Fix

```bash
# 1. Push schema ke database
npm run db:push

# 2. Generate Prisma Client
npm run db:generate

# 3. Test dengan stats
npm run db:stats

# 4. Push data mahasiswa
npm run push:mahasiswa
```

### 9. Alternatif: Jalankan di Local

Jika database hanya bisa diakses dari local:

```bash
# Di komputer local (bukan server)
cd "c:\Users\Edu Juanda Pratama\Downloads\HMTEKIA 2025\PEMIRA-HMTEKIA 2025"

# Pastikan .env sudah benar
# DATABASE_URL="postgresql://postgres:EDUJUANDA12345@localhost:5432/PEMIRA-HMTEKIA"

# Jalankan script
npm run push:mahasiswa
```

### 10. Best Practice

1. **Jangan commit file .env ke Git**
   - Sudah ada di `.gitignore`
   - Setiap environment punya `.env` sendiri

2. **Gunakan environment variables di production**
   ```bash
   # Di server, set via environment
   export DATABASE_URL="postgresql://..."
   ```

3. **Gunakan connection pooling untuk production**
   ```env
   DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=5"
   ```

## Quick Fix Checklist

- [ ] Pastikan lokasi eksekusi (local atau server)
- [ ] Cek DATABASE_URL di file `.env` yang benar
- [ ] Verifikasi kredensial database (username, password, host, port)
- [ ] Test koneksi database dengan `psql` atau `npm run db:push`
- [ ] Pastikan database sudah dibuat
- [ ] Pastikan PostgreSQL berjalan
- [ ] Generate Prisma Client: `npm run db:generate`
- [ ] Jalankan script: `npm run push:mahasiswa`

## Kontak Support

Jika masih error, kirim informasi berikut:
1. Output dari: `npm run db:push`
2. Output dari: `psql --version`
3. Lokasi eksekusi (local/server)
4. Provider database (local PostgreSQL/Neon/Supabase/dll)
