# Fix: Voting Status Bug (hasVoted Not Updating)

## Problem
Setelah user voting untuk Ketua Himpunan DAN Sekjen, status `hasVoted` di database tidak ter-update menjadi `true`. Akibatnya di Super Admin page, status user masih menunjukkan "⚠️ Belum Vote" padahal sudah voting.

## Root Cause Analysis

### Bug Ditemukan ❌
Di file `app/api/vote/route.ts`, ada bug dalam logika counting votes:

```javascript
// KODE LAMA (BUGGY)
const result = await prisma.$transaction(async (tx) => {
  // Create vote
  const vote = await tx.vote.create({ ... })
  
  // Query votes DALAM transaksi
  const userVotes = await tx.vote.findMany({
    where: { userId: user.id }
  })
  
  // Bug: userVotes.length mungkin TIDAK include vote yang baru dibuat di atas
  if (userVotes.length >= 2) {
    // Update hasVoted
  }
})
```

**Masalahnya:**
- Query `findMany` di dalam transaksi yang sama mungkin tidak langsung mengembalikan vote yang baru saja di-`create`
- Prisma transaction isolation bisa menyebabkan read tidak konsisten
- Akibatnya `userVotes.length` selalu kurang dari yang seharusnya
- `hasVoted` tidak pernah di-update walaupun user sudah vote 2x

### Solusi Implemented ✅

**Strategi baru:**
1. **Count votes SEBELUM transaksi** dimulai
2. **Calculate total votes** = existing count + 1 (vote baru)
3. **Update hasVoted** berdasarkan perhitungan, bukan query dalam transaksi

```javascript
// KODE BARU (FIXED)
// Count SEBELUM transaksi
const existingVotesCount = await prisma.vote.count({
  where: { userId: user.id }
})

const result = await prisma.$transaction(async (tx) => {
  // Create vote
  const vote = await tx.vote.create({ ... })
  
  // Calculate total (tidak perlu query lagi)
  const totalVotesAfter = existingVotesCount + 1
  
  // Update hasVoted jika sudah 2 votes
  if (totalVotesAfter >= 2) {
    await tx.user.update({
      where: { id: user.id },
      data: { hasVoted: true }
    })
  }
  
  return { vote, totalVotesAfter }
})
```

## Changes Made

### 1. Fixed Vote Counting Logic ✅
**File:** `app/api/vote/route.ts`

- Added `existingVotesCount` check BEFORE transaction
- Changed logic to calculate `totalVotesAfter = existingVotesCount + 1`
- Update `hasVoted` based on calculation, not query result
- Enhanced logging untuk debugging

### 2. Created Debug Endpoint 🔍
**File:** `app/api/debug/user-votes/route.ts`

Endpoint untuk check status voting user secara detail:

```bash
GET /api/debug/user-votes?email=voter1@pemira.local
```

Response:
```json
{
  "user": {
    "id": "...",
    "email": "voter1@pemira.local",
    "hasVoted": true,
    ...
  },
  "votes": [
    { "position": "KETUA_HIMPUNAN", "candidate": "..." },
    { "position": "SEKJEN", "candidate": "..." }
  ],
  "totalVotes": 2,
  "summary": {
    "hasVotedFlag": true,
    "actualVoteCount": 2,
    "shouldBeMarkedAsVoted": true,
    "mismatch": false
  }
}
```

### 3. Created Fix Endpoint 🔧
**File:** `app/api/admin/fix-voting-status/route.ts`

Endpoint untuk memperbaiki data user yang sudah vote tapi `hasVoted` masih `false`:

```bash
POST /api/admin/fix-voting-status
```

Response:
```json
{
  "message": "Successfully updated voting status for 2 users",
  "fixed": 2,
  "total": 5,
  "fixedUsers": [
    { "name": "Voter Satu", "email": "voter1@pemira.local", "voteCount": 2 },
    { "name": "Voter Dua", "email": "voter2@pemira.local", "voteCount": 2 }
  ]
}
```

## How to Apply the Fix

### Step 1: Restart Development Server
Restart Next.js development server agar perubahan kode ter-apply:

```bash
# Stop server (Ctrl+C)
npm run dev
```

### Step 2: Fix Existing Data (Jika Perlu)

Jika ada user yang sudah vote sebelumnya tapi `hasVoted` masih `false`, jalankan fix endpoint:

**Via Browser/Postman:**
```
POST http://localhost:3000/api/admin/fix-voting-status
```

**Via cURL:**
```bash
curl -X POST http://localhost:3000/api/admin/fix-voting-status \
  -H "Cookie: auth_token=YOUR_SUPER_ADMIN_TOKEN"
```

### Step 3: Verify Fix

**Check individual user:**
```
GET http://localhost:3000/api/debug/user-votes?email=voter1@pemira.local
```

**Check di Super Admin UI:**
1. Buka `http://localhost:3000/super-admin`
2. Go to "Users" tab
3. Lihat status voting (akan auto-refresh setiap 10 detik)
4. ✅ Status seharusnya "✅ Sudah Vote" untuk user yang sudah vote 2x

## Testing the Fix

### Scenario: New Voter
1. Login sebagai voter baru
2. Generate QR code
3. Admin validate QR code
4. Vote untuk **Ketua Himpunan**
   - Log: `ℹ️ User has voted for 1 position(s), waiting for both positions`
   - `hasVoted` masih `false` ✅
5. Vote untuk **Sekjen**
   - Log: `✅ User has completed voting for both positions, updating hasVoted status`
   - `hasVoted` di-update ke `true` ✅
6. Check di Super Admin → Users tab
   - Dalam 10 detik, status berubah ke "✅ Sudah Vote" ✅

### Scenario: Fix Old Data
1. Login as Super Admin
2. Run fix endpoint: `POST /api/admin/fix-voting-status`
3. Check response untuk list user yang di-fix
4. Verify di Users tab - status updated ✅

## Detailed Logging

Server sekarang menampilkan detailed logs untuk debugging:

```
📊 User has 0 existing vote(s) before this vote
✅ Vote created: { voteId: 'xxx', userId: 'yyy', position: 'KETUA_HIMPUNAN' }
📊 Total votes after this vote: 1
ℹ️ User has voted for 1 position(s), waiting for both positions

[User votes lagi untuk SEKJEN]

📊 User has 1 existing vote(s) before this vote
✅ Vote created: { voteId: 'xxx', userId: 'yyy', position: 'SEKJEN' }
📊 Total votes after this vote: 2
✅ User has completed voting for both positions, updating hasVoted status
✅ User hasVoted status updated to true
```

## Files Modified

1. **`app/api/vote/route.ts`** - Fixed vote counting logic
2. **`app/api/debug/user-votes/route.ts`** - New debug endpoint
3. **`app/api/admin/fix-voting-status/route.ts`** - New fix endpoint
4. **`components/user-management.tsx`** - Added auto-refresh (from previous fix)

## Technical Details

### Why the Bug Happened

**Prisma Transaction Isolation:**
- Prisma menggunakan default transaction isolation level dari PostgreSQL
- Read operations dalam transaction mungkin tidak langsung melihat changes dari write operations sebelumnya
- `findMany` query dalam transaction yang sama dengan `create` bisa return stale data

**Solution Approach:**
- Avoid querying within transaction for data just created
- Count before transaction and calculate total
- More reliable and predictable behavior

## Status

✅ **FIXED** - Voting status sekarang ter-update dengan benar setelah user vote untuk kedua posisi.

## Troubleshooting

**Problem:** Status masih "Belum Vote" setelah fix
**Solution:** 
1. Run fix endpoint: `POST /api/admin/fix-voting-status`
2. Wait 10 seconds untuk auto-refresh
3. Manual refresh browser

**Problem:** User tidak bisa vote
**Solution:**
1. Check debug endpoint untuk detail
2. Verify voting session validated
3. Check server logs untuk error messages

**Problem:** Duplicate votes
**Solution:** 
- Database constraint `@@unique([userId, position])` mencegah duplicate votes
- User tidak bisa vote 2x untuk position yang sama
