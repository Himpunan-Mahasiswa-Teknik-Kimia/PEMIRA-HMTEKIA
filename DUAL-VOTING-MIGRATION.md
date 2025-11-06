# Dual Voting System Migration Guide

## Overview
Sistem PEMIRA HIMATEKIA 2025 telah diupgrade untuk mendukung **pemilihan 2 kandidat**:
1. **Ketua BPH** (Badan Pengurus Harian)
2. **Senator** HIMATEKIA

## What Changed

### Database Schema
- **User Model**: Added `hasVotedKetuaBPH` and `hasVotedSenator` fields
- **Candidate Model**: Added `position` field (KETUA_BPH | SENATOR)
- **Vote Model**: Added `position` field and changed unique constraint to `[userId, position]`

### Voting Flow
- Users can now vote for 2 different positions
- Each vote is tracked separately
- Voting session is marked as complete only after both votes are submitted
- Users can vote for Ketua BPH and Senator in any order

### UI Changes
- New tabbed interface for voting
- Separate tabs for Ketua BPH and Senator candidates
- Visual indicators showing which positions have been voted for
- Users can see their voting progress

## Migration Steps

### 1. Backup Data (Already Done)
```bash
npm run db:migrate-dual
```
This script:
- Clears existing candidates and votes
- Resets user voting status
- Prepares database for new schema

### 2. Push New Schema (Already Done)
```bash
npx prisma db push
npx prisma generate
```

### 3. Seed Sample Candidates
```bash
npm run seed:candidates
```
Creates 4 sample candidates:
- 2 Ketua BPH candidates
- 2 Senator candidates

## New NPM Scripts

```bash
# Seed sample candidates
npm run seed:candidates

# Migrate to dual voting (clears existing data)
npm run db:migrate-dual

# Seed everything (users + admins + candidates)
npm run seed:all
```

## API Changes

### POST /api/vote
**Before:**
```json
{
  "candidateId": "candidate-id"
}
```

**After:**
```json
{
  "candidateId": "candidate-id",
  "position": "KETUA_BPH" | "SENATOR"
}
```

### POST /api/candidates
**Before:**
```json
{
  "name": "...",
  "nim": "...",
  "prodi": "...",
  "visi": "...",
  "misi": "..."
}
```

**After:**
```json
{
  "name": "...",
  "nim": "...",
  "prodi": "...",
  "position": "KETUA_BPH" | "SENATOR",
  "visi": "...",
  "misi": "..."
}
```

## User Experience

### Voting Process
1. User logs in with NIM and Name
2. User generates QR Code
3. Admin validates QR Code
4. User accesses voting page with 2 tabs:
   - **Ketua BPH Tab**: Select 1 candidate for Ketua BPH
   - **Senator Tab**: Select 1 candidate for Senator
5. User can vote for both positions in any order
6. After completing both votes, user is redirected to success page

### Voting Status Tracking
- `hasVotedKetuaBPH`: true after voting for Ketua BPH
- `hasVotedSenator`: true after voting for Senator
- `hasVoted`: true only after both votes are complete
- Voting session marked as used after both votes complete

## Database Constraints

### Candidate
- Unique constraint: `[nim, position]`
- Same person can be candidate for both positions (different records)

### Vote
- Unique constraint: `[userId, position]`
- Prevents double voting per position
- Each user can have max 2 votes (1 per position)

## Testing

### Test Scenarios
1. **Login and Generate QR Code**
   - Login with test user
   - Generate QR code
   - Verify QR code created

2. **Admin Validation**
   - Admin scans QR code
   - Admin validates user identity
   - Verify session is validated

3. **Vote for Ketua BPH**
   - Select Ketua BPH candidate
   - Submit vote
   - Verify `hasVotedKetuaBPH` = true
   - Verify still can access Senator tab

4. **Vote for Senator**
   - Select Senator candidate
   - Submit vote
   - Verify `hasVotedSenator` = true
   - Verify `hasVoted` = true
   - Verify redirected to success page

5. **Prevent Double Voting**
   - Try to vote again
   - Verify blocked with appropriate message

## Rollback Plan

If you need to rollback to single voting:

1. Restore `app/vote/page-old.tsx` to `app/vote/page.tsx`
2. Revert Prisma schema changes
3. Run `npx prisma db push --force-reset`
4. Re-seed data with `npm run seed:all`

## Notes

- All previous votes and candidates were cleared during migration
- TypeScript errors in IDE will resolve after reloading the TypeScript server
- Sample candidates are provided for testing
- Real candidates should be added via admin panel or API

## Support

For issues or questions about the dual voting system:
1. Check database stats: `npm run db:stats`
2. Review Prisma schema: `prisma/schema.prisma`
3. Check API logs in terminal
4. Verify Prisma Client is regenerated: `npx prisma generate`
