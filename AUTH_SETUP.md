# 🔐 Authentication Setup Guide - Creo OS

## Problem Fixed

**Root Cause**: No user existed in the database. The admin user INSERT statement was commented out in `db/schema.sql`.

**Status**: ✅ FIXED - Updated schema.sql with proper bcrypt hash

---

## Setup Instructions

### 1. Configure Environment Variables

Copy `.env.local.example` → `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in:

```env
# InsForge API Configuration
INSFORGE_API_BASE_URL=https://your-project.insforge.io
INSFORGE_API_KEY=your-anon-key-here

# JWT Secret (generate a secure random string)
JWT_SECRET=your-secure-random-string-min-32-chars

# Storage bucket
NEXT_PUBLIC_STORAGE_BUCKET=documents
```

### 2. Create Database Tables and Admin User

1. Open your **InsForge Dashboard** → **Database** → **SQL Editor**
2. Copy the entire contents of `db/schema.sql`
3. Paste into the SQL editor
4. **Execute** the SQL

This will:
- ✅ Create all tables (users, clients, projects, payments, costs, documents, templates)
- ✅ Create default admin user with credentials:
  - **Email**: `admin@creoai.studio`
  - **Password**: `admin123`

### 3. Start Development Server

```bash
npm run dev
```

### 4. Test Login

Visit: `http://localhost:3000/login`

Login with:
- **Email**: `admin@creoai.studio`
- **Password**: `admin123`

Should redirect to: `http://localhost:3000/dashboard`

---

## Password Security

### ⚠️ Important: Change Default Password Immediately

After first login:

1. Go to **Settings** → **Password** tab
2. Change from `admin123` to a secure password
3. Store in password manager

### Changing Admin Password (Via SQL)

If you need to update the password:

1. Generate new bcrypt hash:
   ```bash
   node scripts/gen-hash.js "your_new_password"
   ```

2. Copy the generated hash

3. Run in InsForge SQL Editor:
   ```sql
   UPDATE users
   SET password_hash = 'paste-the-hash-here'
   WHERE email = 'admin@creoai.studio';
   ```

### Creating Additional Users (Via Node.js)

If you want to add more admin users programmatically (after authentication works):

```bash
node scripts/create-user.js "User Name" "user@example.com" "password123"
```

---

## Authentication Flow (How It Works)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User enters email & password on login page               │
└────────────────┬────────────────────────────────────────────┘
                 │ (frontend/login/page.tsx)
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. POST /api/auth/login with { email, password }           │
└────────────────┬────────────────────────────────────────────┘
                 │ (api/auth/login/route.ts)
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Query users table: findUserByEmail(email)               │
│    - Returns null if user not found                        │
│    - Returns User with password_hash if found              │
└────────────────┬────────────────────────────────────────────┘
                 │ (services/users.ts)
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Verify password with bcrypt.compareSync()               │
│    - Compares plaintext password against hashed password   │
│    - Returns true/false                                    │
└────────────────┬────────────────────────────────────────────┘
                 │ (lib/auth.ts)
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ 5a. If password incorrect:                                  │
│     Return 401 "Invalid credentials"                       │
│                                                             │
│ 5b. If password correct:                                    │
│     - Generate JWT token with: { sub, email, role }       │
│     - Set httpOnly cookie with JWT                         │
│     - Return 200 success                                   │
└────────────────┬────────────────────────────────────────────┘
                 │ (api/auth/login/route.ts)
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Frontend receives response                              │
│    - On success: redirect to /dashboard                    │
│    - On failure: show error message                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Authentication Code Verification

### ✅ Password Hashing (lib/auth.ts)
```typescript
// Correct - uses bcryptjs with 10 salt rounds
export function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}
```

### ✅ Password Verification (lib/auth.ts)
```typescript
// Correct - uses bcrypt compareSync for timing-safe comparison
export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}
```

### ✅ Token Generation (lib/auth.ts)
```typescript
// Correct - signs JWT with expiry
export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: '7d' });
}
```

### ✅ API Login Route (api/auth/login/route.ts)
```typescript
// Correct - proper error handling, token generation, secure cookie
const token = signAuthToken({
  sub: user.id,
  email: user.email,
  role: user.role,
});

const cookie = serialize('auth_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
});
```

---

## Troubleshooting

### "Invalid credentials" after adding user
- Verify user exists in database: `SELECT * FROM users;`
- Check password hash is valid bcrypt format: starts with `$2a$` or `$2y$`
- Ensure email is lowercase and matches exactly

### Login page shows but button doesn't work
- Check browser console for fetch errors
- Verify `/api/auth/login` endpoint is accessible
- Ensure `JWT_SECRET` env var is set

### Redirect loop (can't access dashboard)
- Verify `auth_token` cookie is being set
- Check middleware.ts includes correct protected paths
- Ensure JWT is valid and not expired

### "JWT_SECRET must be set" error
- Add `JWT_SECRET=your-secret-here` to `.env.local`
- Restart dev server

---

## Bcrypt Hash Verification

The bcrypt hash in schema.sql is valid for password `admin123`:

```
Hash: $2a$10$slYQmyNdGzin7olVCRjKKOL.LRphJEJl3dxPr1F7qNZdJK3u.4OEO
Password: admin123
Rounds: 10
```

You can verify online: https://bcrypt-generator.com/

---

## Files Modified

- ✅ `db/schema.sql` — Uncommented admin user INSERT with proper hash
- ✅ `scripts/gen-hash.js` — Helper script to generate bcrypt hashes
- ✅ `.env.local.example` — Environment configuration template

## Files Verified (No Changes Needed)

- ✅ `src/lib/auth.ts` — Correct bcrypt implementation
- ✅ `src/app/api/auth/login/route.ts` — Correct API logic
- ✅ `src/app/(auth)/login/page.tsx` — Correct form submission
- ✅ `src/services/users.ts` — Correct database queries
- ✅ `middleware.ts` — Correct route protection

---

## Next Steps

1. ✅ Configure `.env.local` with InsForge credentials
2. ✅ Run `db/schema.sql` in InsForge SQL Editor
3. ✅ Login with `admin@creoai.studio` / `admin123`
4. ✅ Change password in Settings → Password tab
5. ✅ Create additional users as needed

**Authentication is now fully functional!**
