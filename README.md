# Steam Family - Gaming Tools Directory

A complete, responsive website for sharing useful third-party gaming and Steam tools. Built with React, Express, and Supabase.

## 🚀 Features

- **Supabase Authentication** - Secure user signup/login
- **Tool Management** - Admin dashboard for creating and managing gaming tools
- **Download Tracking** - Track authenticated user downloads
- **Review System** - Users can rate and review tools (one review per tool)
- **Session Popups** - One-time donate/Telegram prompts per browser session
- **Responsive Design** - Beautiful dark theme with red accents
- **Row Level Security** - Secure database access with Supabase RLS

## 📋 Prerequisites

- Node.js 20+
- Supabase account (free tier works)
- Git

## ⚙️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

#### A. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Create a new project (free tier is fine)
3. Go to **Project Settings → API**
4. Copy your:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** secret key

#### B. Add Environment Variables in Replit

In the Replit Secrets tab, add:
- `SUPABASE_URL` - Your project URL
- `SUPABASE_ANON_KEY` - Your anon public key
- `SUPABASE_SERVICE_ROLE_KEY` - Your service_role key
- `SESSION_SECRET` - Any random string (e.g., `your-secret-key-12345`)

The frontend automatically uses `SUPABASE_URL` and `SUPABASE_ANON_KEY` from Replit Secrets.

### 3. Set Up Database Tables

Go to your Supabase project → **SQL Editor** and run the following SQL commands **in order**:

#### Step 1: Create Tables

```sql
-- Users table (synced with auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tools table
CREATE TABLE tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_desc TEXT NOT NULL,
  description_markdown TEXT NOT NULL,
  images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  donation_url TEXT,
  telegram_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Download buttons table
CREATE TABLE download_buttons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0
);

-- Downloads tracking table
CREATE TABLE downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  button_label TEXT NOT NULL,
  downloaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL CHECK (LENGTH(review_text) >= 10),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, tool_id)
);
```

#### Step 2: Enable Row Level Security

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_buttons ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
```

#### Step 3: Create RLS Policies

**IMPORTANT:** For INSERT policies, use `WITH CHECK` (not `USING`). This is a PostgreSQL requirement that prevents the error: `only WITH CHECK expression allowed for INSERT`.

```sql
-- Users policies
CREATE POLICY "Users: select public" ON users FOR SELECT USING (true);

CREATE POLICY "Users: insert their own" ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users: update own" ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Tools policies (public read, admin manage)
CREATE POLICY "Tools: public select" ON tools FOR SELECT USING (true);

CREATE POLICY "Tools: admins insert" ON tools FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)
);

CREATE POLICY "Tools: admins update" ON tools FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)
);

CREATE POLICY "Tools: admins delete" ON tools FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)
);

-- Download buttons policies
CREATE POLICY "Download buttons: public select" ON download_buttons FOR SELECT USING (true);

CREATE POLICY "Download buttons: admins manage" ON download_buttons FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)
);

-- Downloads policies
CREATE POLICY "Downloads: insert own" ON downloads FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Downloads: select own or admin" ON downloads FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR 
  EXISTS(SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)
);

-- Reviews policies
CREATE POLICY "Reviews: public select" ON reviews FOR SELECT USING (true);

CREATE POLICY "Reviews: insert own" ON reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Reviews: user manage own" ON reviews FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Reviews: user delete own" ON reviews FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Reviews: admins delete" ON reviews FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)
);
```

### 4. Create an Admin User

#### Option 1: Register normally, then promote

1. Register a new account in the application UI
2. Run this SQL in Supabase SQL Editor:

```sql
UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';
```

Replace `your-email@example.com` with your actual email.

3. Refresh the page to see the Admin link in the navigation

#### Option 2: Find user ID and promote

```sql
-- List all users to find your ID
SELECT id, email, is_admin FROM users;

-- Promote by ID
UPDATE users SET is_admin = true WHERE id = 'user-uuid-here';
```

### 5. Run the Application

```bash
npm run dev
```

The app will be available at the Replit webview URL.

## 🧪 Testing Admin Endpoints

After creating an admin user and logging in, you can test the admin endpoints:

### Test Admin Login

1. Log in to the application
2. Open browser DevTools → Console
3. Get your access token:

```javascript
const session = await (await fetch('/api/auth/session')).json();
console.log(session.access_token);
```

Or use this to get the token from Supabase:

```javascript
import { supabase } from './client/src/lib/supabase';
const { data } = await supabase.auth.getSession();
console.log(data.session.access_token);
```

4. Test the endpoint with curl:

```bash
curl -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" https://<YOUR_REPL_URL>/api/admin/test-login
```

**Expected response:**
```json
{
  "ok": true,
  "admin": "your-email@example.com",
  "message": "Admin authentication successful"
}
```

### Test Creating a Tool

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -d '{
    "title": "Test Gaming Tool",
    "slug": "test-gaming-tool",
    "short_desc": "A test tool for gamers",
    "description_markdown": "## Test Tool\n\nThis is a test tool with markdown support.",
    "images": ["https://placehold.co/800x450/1a1a1a/ef4444?text=Test+Tool"],
    "tags": ["test", "gaming"],
    "downloadButtons": [
      {
        "label": "Download Now",
        "url": "https://example.com/download",
        "order": 0
      }
    ]
  }' \
  https://<YOUR_REPL_URL>/api/admin/tools
```

**Expected response:** Status 201 with the created tool object.

## 🐛 Possible Errors & Fixes

### Error: `401: {"error":"Unauthorized"}`

**Cause:** Request missing a valid Supabase session token or token not sent in Authorization header.

**Fix:** 
- Ensure frontend sends `Authorization: Bearer <access_token>` header when calling `/api/admin/*`
- Server validates token with `supabase.auth.getUser(token)`
- Check that your session hasn't expired - log in again if needed

Example code to get token:
```typescript
import { supabase } from '@/lib/supabase';
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
```

### Error: `new row violates row-level security policy for table "users" (500)`

**Cause:** Attempting to insert into `users` table before `auth.uid()` exists or RLS policy blocks the insert.

**Fix:** Upsert the profile **after** Supabase authentication completes:

```typescript
// In your signup handler
const { data: { user } } = await supabase.auth.signUp({ email, password });

if (user) {
  await supabase.from('users').upsert({
    id: user.id,
    email: user.email,
    username: username,
    is_admin: false
  });
}
```

Make sure the `users` table has the correct INSERT policy with `WITH CHECK (auth.uid() = id)`.

### Error: `42601: only WITH CHECK expression allowed for INSERT`

**Cause:** Using `USING (...)` in an INSERT policy instead of `WITH CHECK (...)`.

**Fix:** For INSERT policies, always use `WITH CHECK`:

```sql
-- ❌ WRONG
CREATE POLICY "example" ON table FOR INSERT
USING (condition);  -- This causes the error!

-- ✅ CORRECT
CREATE POLICY "example" ON table FOR INSERT
WITH CHECK (condition);
```

See the RLS policies section above for correct examples.

### Error: `42601: syntax error at or near "const"`

**Cause:** Attempting to run JavaScript code inside the Supabase SQL editor.

**Fix:** 
- Run JavaScript code in your application (browser console or Node.js)
- Use Supabase SQL Editor **only** for SQL statements
- Example: Don't run `const { data } = await supabase...` in SQL editor

### Error: `auth.uid() is null` or session appears null

**Cause:** Session token not passed to server or has expired.

**Fix:**
1. Client-side: Check your session exists
   ```typescript
   const { data: { session } } = await supabase.auth.getSession();
   if (!session) {
     // User needs to log in
   }
   ```

2. Server-side: Forward the `access_token` in the Authorization header
   ```typescript
   const token = await getAuthToken(); // from your auth helper
   await fetch('/api/admin/tools', {
     headers: { Authorization: `Bearer ${token}` }
   });
   ```

### Error: `Could not find the table 'public.tools'`

**Cause:** Database tables haven't been created in Supabase.

**Fix:** Run all the SQL commands in "Step 1: Create Tables" section above in your Supabase SQL Editor.

### Error: Downloads not tracking or reviews failing

**Cause:** Missing foreign key references or RLS policies blocking inserts.

**Fix:**
1. Verify all tables exist
2. Check RLS policies are created correctly (see Step 3 above)
3. Ensure user is authenticated when attempting to download/review
4. Check browser console for detailed error messages

## 📚 Database Schema Reference

### Tables

- **users** - User profiles synced with Supabase auth
  - `id` (UUID, PK) - Matches auth.users.id
  - `username` (TEXT) - Unique username
  - `email` (TEXT) - User email
  - `is_admin` (BOOLEAN) - Admin flag
  - `created_at` (TIMESTAMP)

- **tools** - Gaming tools and utilities
  - `id` (UUID, PK)
  - `title`, `slug`, `short_desc`, `description_markdown`
  - `images` (TEXT[]) - Array of image URLs
  - `tags` (TEXT[]) - Array of tags
  - `donation_url`, `telegram_url` (optional)
  - `created_at`, `updated_at`

- **download_buttons** - Multiple download options per tool
  - `id` (UUID, PK)
  - `tool_id` (UUID, FK → tools)
  - `label`, `url`, `order`

- **downloads** - Download tracking
  - `id` (UUID, PK)
  - `user_id` (UUID, FK → users)
  - `tool_id` (UUID, FK → tools)
  - `button_label`, `downloaded_at`

- **reviews** - Tool reviews
  - `id` (UUID, PK)
  - `user_id` (UUID, FK → users)
  - `tool_id` (UUID, FK → tools)
  - `rating` (1-5), `review_text` (min 10 chars)
  - `created_at`
  - UNIQUE constraint on (user_id, tool_id)

## 🚀 Deployment to GitHub Pages

### Option 1: Build and Deploy Manually

1. Build the frontend:
   ```bash
   npm run build
   ```

2. The static files will be in the `dist` directory

3. Deploy `dist` to GitHub Pages:
   - Push `dist` folder to `gh-pages` branch
   - Or use GitHub Actions for automatic deployment

### Option 2: Using GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm install
        
      - name: Build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        run: npm run build
        
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

Add your Supabase credentials as GitHub Secrets in repository settings.

**Note:** The Express backend needs to be hosted separately (e.g., on Replit, Heroku, or similar). GitHub Pages only hosts static files.

## 🔒 Security Notes

- Never commit `.env` files or expose your `SUPABASE_SERVICE_ROLE_KEY`
- The service role key is only used server-side
- Frontend uses the `anon` key which is safe to expose
- All admin operations are protected with server-side JWT validation
- RLS policies prevent unauthorized database access

## 📄 Legal

**Important:** This site hosts links to 3rd-party software and tools.

See [Privacy Policy](/privacy) and [Terms of Service](/terms) for full details.

## 🤝 Contributing

1. Register an account
2. Request admin access
3. Use the admin dashboard to add/edit tools
4. Submit issues or pull requests for improvements

## 📞 Support

For issues or questions, please open an issue on GitHub or contact the site administrators.

---

**Built with ❤️ for the gaming community**
