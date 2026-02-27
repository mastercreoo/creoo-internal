# ✅ AUTHENTICATION SETUP CHECKLIST

Complete these steps to get authentication working.

---

## Phase 1: Environment Configuration

- [ ] **1.1** Create `.env.local` file (copy from `.env.local.example`)

- [ ] **1.2** Fill in `INSFORGE_API_BASE_URL`
  - Get from: InsForge Dashboard
  - Format: `https://your-project.insforge.io`
  - Example: `INSFORGE_API_BASE_URL=https://myproject.insforge.io`

- [ ] **1.3** Fill in `INSFORGE_API_KEY`
  - Get from: InsForge Dashboard → Settings → API Keys → Anon Key
  - Example: `INSFORGE_API_KEY=eyJhbGc...`

- [ ] **1.4** Fill in `JWT_SECRET`
  - Generate: `openssl rand -hex 32` (Linux/Mac) or use any 32+ char string
  - Example: `JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

- [ ] **1.5** Set `NEXT_PUBLIC_STORAGE_BUCKET=documents`
  - No changes needed if already set

---

## Phase 2: Database Setup

### Step 1: Access InsForge SQL Editor
- [ ] **2.1** Open InsForge Dashboard
- [ ] **2.2** Navigate to: **Database** → **SQL Editor**

### Step 2: Copy Database Schema
- [ ] **2.3** Open `db/schema.sql` in your editor
- [ ] **2.4** Select all content (Ctrl+A)
- [ ] **2.5** Copy to clipboard (Ctrl+C)

### Step 3: Run in InsForge
- [ ] **2.6** Paste entire SQL into InsForge SQL Editor
- [ ] **2.7** Click **Execute** button
- [ ] **2.8** Wait for confirmation (should see: "Query successful")

### Step 4: Verify Tables Created
- [ ] **2.9** In SQL Editor, run:
  ```sql
  SELECT table_name FROM information_schema.tables WHERE table_schema='public';
  ```
  Should see: `users, clients, projects, payments, costs, documents, templates`

### Step 5: Verify Admin User Created
- [ ] **2.10** In SQL Editor, run:
  ```sql
  SELECT * FROM users;
  ```
  Should see 1 row:
  - `email`: `admin@creoai.studio`
  - `password_hash`: starts with `$2a$10$`
  - `role`: `admin`

---

## Phase 3: Application Start

- [ ] **3.1** Open terminal in project root
- [ ] **3.2** Run: `npm install` (if not already done)
- [ ] **3.3** Run: `npm run dev`
- [ ] **3.4** Wait for: "ready - started server on 0.0.0.0:3000"

---

## Phase 4: Test Login

### Test Case 1: Successful Login
- [ ] **4.1** Open browser to `http://localhost:3000/login`
- [ ] **4.2** Enter email: `admin@creoai.studio`
- [ ] **4.3** Enter password: `admin123`
- [ ] **4.4** Click **Sign in** button
- [ ] **4.5** ✅ Should redirect to `/dashboard` (see "Overview" page)
- [ ] **4.6** Verify browser shows no errors in console

### Test Case 2: Wrong Password
- [ ] **4.7** Return to `/login` (logout or clear cookie)
- [ ] **4.8** Enter email: `admin@creoai.studio`
- [ ] **4.9** Enter password: `wrong_password`
- [ ] **4.10** Click **Sign in** button
- [ ] **4.11** ✅ Should see error: "Invalid credentials"
- [ ] **4.12** Should NOT redirect

### Test Case 3: Non-existent Email
- [ ] **4.13** In login form
- [ ] **4.14** Enter email: `notexist@example.com`
- [ ] **4.15** Enter password: `admin123`
- [ ] **4.16** Click **Sign in** button
- [ ] **4.17** ✅ Should see error: "Invalid credentials"

---

## Phase 5: Security - Change Default Password

### Change Password in UI
- [ ] **5.1** While logged in as admin
- [ ] **5.2** Click **Settings** (bottom left of sidebar)
- [ ] **5.3** Click **Password** tab
- [ ] **5.4** Enter current password: `admin123`
- [ ] **5.5** Enter new password: (something secure, min 8 chars)
- [ ] **5.6** Enter confirm password: (same as above)
- [ ] **5.7** Click **Change Password** button
- [ ] **5.8** ✅ Should see: "Password changed successfully"

### Logout and Test New Password
- [ ] **5.9** Logout (if logout button exists) or clear `auth_token` cookie
- [ ] **5.10** Go to `/login`
- [ ] **5.11** Try old password `admin123` - should fail ❌
- [ ] **5.12** Try new password - should succeed ✅

---

## Phase 6: Verify Authentication

### Cookie Setup
- [ ] **6.1** After successful login, open DevTools (F12)
- [ ] **6.2** Go to **Application** tab
- [ ] **6.3** Go to **Cookies**
- [ ] **6.4** Find `auth_token` cookie
- [ ] **6.5** ✅ Should have:
  - `httpOnly`: checked (prevents XSS)
  - `Secure`: checked (HTTPS only in production)
  - `SameSite`: Lax (CSRF protection)

### Route Protection
- [ ] **6.6** While logged in, visit `/dashboard` - works ✅
- [ ] **6.7** Clear `auth_token` cookie
- [ ] **6.8** Refresh `/dashboard` - redirects to `/login` ✅

---

## Phase 7: Additional Setup (Optional)

### Create Additional Admin Users
- [ ] **7.1** Generate hash for new password:
  ```bash
  node scripts/gen-hash.js "new_admin_password"
  ```
- [ ] **7.2** Copy the output SQL UPDATE statement
- [ ] **7.3** Modify to INSERT (example provided in output)
- [ ] **7.4** Run in InsForge SQL Editor

### Configure Email Notifications (if available)
- [ ] **7.5** Go to Settings → Preferences
- [ ] **7.6** Toggle email notifications as desired
- [ ] **7.7** Preferences saved automatically

---

## Phase 8: Production Preparation

- [ ] **8.1** Change `JWT_SECRET` to a new secure value
- [ ] **8.2** Change `INSFORGE_API_KEY` to production key (if different)
- [ ] **8.3** Set `NODE_ENV=production` in deployment
- [ ] **8.4** Ensure HTTPS is enabled (cookies will be secure)
- [ ] **8.5** Backup database before deployment
- [ ] **8.6** Test login on staging before production

---

## Troubleshooting

### Issue: "Invalid credentials" always shows

**Checklist**:
- [ ] Verify user exists: `SELECT * FROM users WHERE email = 'admin@creoai.studio';`
- [ ] Verify hash is valid bcrypt: Should start with `$2a$10$`
- [ ] Check `.env.local` exists and is readable
- [ ] Check `INSFORGE_API_KEY` is correct
- [ ] Check `INSFORGE_API_BASE_URL` is correct
- [ ] Restart dev server after `.env.local` changes

### Issue: "JWT_SECRET must be set"

**Solution**:
- [ ] Add `JWT_SECRET=your-secret-here` to `.env.local`
- [ ] Restart dev server: Stop (Ctrl+C) and run `npm run dev` again

### Issue: Redirect loop (can't stay on dashboard)

**Checklist**:
- [ ] Check DevTools > Application > Cookies for `auth_token`
- [ ] Verify JWT is not expired (7 day expiry)
- [ ] Check middleware.ts includes your route
- [ ] Clear browser cache and cookies, try again

### Issue: "Cannot find module 'bcryptjs'"

**Solution**:
- [ ] Run: `npm install`
- [ ] Wait for completion
- [ ] Restart dev server

### Issue: Database query timeout

**Checklist**:
- [ ] Verify InsForge connection is active
- [ ] Check internet connection
- [ ] Verify `INSFORGE_API_BASE_URL` and `INSFORGE_API_KEY`
- [ ] Try again after a few seconds

---

## Success Criteria

Once you can check all these, authentication is working:

- ✅ Admin user exists in database
- ✅ Admin can login with `admin123` (or changed password)
- ✅ Login redirects to `/dashboard`
- ✅ Wrong password shows "Invalid credentials"
- ✅ `auth_token` cookie is set after login
- ✅ Dashboard requires authentication (redirect if logged out)
- ✅ Password can be changed in Settings
- ✅ New password works after change

---

## Quick Reference

### Default Credentials
```
Email:    admin@creoai.studio
Password: admin123
```

### Key Files
- Database schema: `db/schema.sql`
- Auth utilities: `src/lib/auth.ts`
- Login API: `src/app/api/auth/login/route.ts`
- Login page: `src/app/(auth)/login/page.tsx`
- User service: `src/services/users.ts`

### Key Commands
```bash
# Generate new password hash
node scripts/gen-hash.js "your_password"

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Important URLs
- Login: `http://localhost:3000/login`
- Dashboard: `http://localhost:3000/dashboard`
- Settings: `http://localhost:3000/settings`

---

## Documentation Files

For more information, see:

- **QUICK_START.md** - Fast setup (3 steps)
- **AUTH_SETUP.md** - Complete guide with troubleshooting
- **AUTHENTICATION_FIXED.md** - Technical analysis and verification
- **BEFORE_AFTER.md** - What changed and why
- **FIX_SUMMARY.txt** - Executive summary

---

## Status

After completing all phases:
- ✅ Authentication fully functional
- ✅ Login working
- ✅ Password security enforced
- ✅ Routes protected
- ✅ Ready for production

**You can now use Creo OS with full authentication!** 🎉
