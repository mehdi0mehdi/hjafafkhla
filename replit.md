# Steam Family - Gaming Tools Directory

## Overview

Steam Family is a comprehensive, responsive web application that serves as a community platform for discovering and sharing third-party gaming tools and utilities. The application allows users to browse curated gaming tools, download them, leave reviews, and engage with the community. Administrators can manage tools through a dedicated dashboard, while authenticated users can track their downloads and contribute reviews.

**Core Purpose**: Provide a centralized, trustworthy directory for Steam and gaming-related third-party tools with community validation through reviews and ratings.

**Key Value Proposition**: Combines ease of discovery with community trust through user reviews, download tracking, and admin curation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**:
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server for fast HMR and optimized production builds
- **Wouter** for lightweight, hook-based client-side routing
- **TanStack Query (React Query)** for server state management, caching, and data synchronization

**UI Component Library**:
- **Radix UI** primitives for accessible, unstyled components (dialogs, dropdowns, menus, etc.)
- **shadcn/ui** component system built on Radix UI with Tailwind styling
- **Tailwind CSS** for utility-first styling with custom design tokens
- **class-variance-authority (cva)** for component variant management

**Design System**:
- Dark-first gaming aesthetic with customizable CSS variables
- Steam-inspired color scheme with red accents (#FF0000, #DC2626)
- Inter font family for modern, gaming-appropriate typography
- Responsive breakpoints: mobile-first with md (768px) and lg (1024px) breakpoints

**State Management Pattern**:
- Server state managed via TanStack Query with query keys like `['/api/tools']`
- Authentication context (`AuthContext`) provides global user and admin state
- Session-based popup tracking using `sessionStorage` for one-time prompts
- Local component state for forms and UI interactions

**Rationale**: React Query eliminates the need for Redux/Zustand for server state while providing caching, optimistic updates, and automatic refetching. Wouter is chosen over React Router for its minimal bundle size (~1.2KB) suitable for a content-focused site.

### Backend Architecture

**Server Framework**:
- **Express.js** as the HTTP server and API framework
- **TypeScript** for type safety across the entire stack
- **tsx** for running TypeScript directly in development

**API Design Pattern**:
- RESTful API endpoints under `/api/*` namespace
- Route protection via middleware factories (`requireAuth`, `requireAdmin`)
- JWT-based authentication tokens validated server-side
- Response logging middleware for debugging and monitoring

**Key API Routes**:
- `GET /api/tools` - Public tool listings with stats
- `GET /api/tools/:slug` - Individual tool details
- `POST /api/admin/tools` - Admin-only tool creation
- `POST /api/downloads` - Authenticated download tracking
- `POST /api/reviews` - Authenticated review submission

**Authentication Flow**:
1. Supabase Auth handles signup/login and issues JWT tokens
2. Frontend stores session in Supabase client (auto-managed)
3. API requests include `Authorization: Bearer <token>` header
4. Server validates token via `supabaseAdmin.auth.getUser(token)`
5. User profile fetched from `users` table for admin checks

**Rationale**: Express provides flexibility for custom middleware and easy integration with Supabase. Server-side validation ensures security even if frontend checks are bypassed.

### Data Storage Solutions

**Primary Database**: **Supabase (PostgreSQL)**
- Cloud-hosted PostgreSQL database with RESTful API
- Row Level Security (RLS) policies for data access control
- Real-time subscriptions capability (not currently used but available)

**Schema Design**:

**users** table:
- Synced with `auth.users` via trigger/function
- Columns: `id` (UUID, FK to auth.users), `username`, `email`, `is_admin`, `created_at`
- Admin promotion done via SQL: `UPDATE users SET is_admin = true WHERE id = '<USER_ID>'`

**tools** table:
- Core entity for gaming tools
- Includes `slug` for SEO-friendly URLs, `description_markdown` for rich formatting
- `images` and `tags` stored as PostgreSQL arrays
- Optional `donation_url` and `telegram_url` for community engagement

**download_buttons** table:
- One-to-many relationship with tools (cascade delete)
- Supports multiple download options per tool with ordering
- Stores `label` and `url` for external download links

**downloads** table:
- Tracks authenticated user downloads for analytics
- References both `user_id` and `tool_id` with cascade deletes
- Includes `button_label` to distinguish which download option was used

**reviews** table:
- User reviews with 1-5 star ratings and optional text
- Unique constraint: one review per user per tool
- Includes timestamps for sorting and moderation

**ORM Choice**: **Drizzle ORM**
- Type-safe schema definitions in `shared/schema.ts`
- Generates Zod schemas via `drizzle-zod` for runtime validation
- Note: `drizzle.config.ts` references PostgreSQL but currently using Supabase client directly

**Alternatives Considered**:
- Prisma: Heavier, requires code generation step
- TypeORM: Less type-safe, more boilerplate

**Pros of Supabase + Drizzle**:
- Supabase free tier sufficient for small-medium traffic
- Built-in Auth reduces custom implementation
- Drizzle provides types without runtime overhead
- RLS adds security layer beyond application logic

**Cons**:
- Vendor lock-in to Supabase ecosystem
- Schema migrations require manual SQL or Drizzle Kit pushes

### Authentication & Authorization

**Authentication Provider**: **Supabase Auth**
- Handles email/password authentication
- JWT token generation and refresh logic
- Email verification workflow (configurable)

**Client-Side Auth**:
- `@supabase/supabase-js` client with anon key for public operations
- `AuthContext` provider wraps entire app with user/profile state
- Session persistence via localStorage (Supabase default)
- Token automatically included in API calls via helper: `getAuthToken()`

**Server-Side Auth**:
- Service role key used for admin operations (bypasses RLS)
- Token validation via `supabaseAdmin.auth.getUser(token)`
- Middleware checks: `requireAuth()` for logged-in users, `requireAdmin()` for admin routes

**Authorization Model**:
- Role-based: regular users vs admins (boolean `is_admin` flag)
- Admin routes protected both client-side (UI hidden) and server-side (middleware)
- Download tracking requires authentication to prevent abuse
- Reviews require authentication (one per user per tool)

**Security Considerations**:
- Service role key stored in server-only environment variables
- CORS configured for same-origin requests
- JWT expiration handled by Supabase (automatic refresh)

### External Dependencies

**Third-Party Services**:

1. **Supabase** (Authentication & Database)
   - Free tier: 500MB database, 50,000 monthly active users
   - Environment variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - Used for: User auth, data storage, RLS policies

2. **Google Fonts CDN**
   - Loads Inter font family (400-900 weights)
   - Preconnected via `<link rel="preconnect">` for performance

**Frontend Dependencies**:
- **react-markdown** + **remark-gfm**: Renders tool descriptions from Markdown with GitHub Flavored Markdown support
- **react-icons** (specifically `react-icons/si`): For brand icons like Telegram
- **lucide-react**: Icon library for UI elements (Download, Star, etc.)
- **date-fns**: Date formatting and manipulation
- **nanoid**: Unique ID generation for session tracking
- **zod**: Runtime schema validation (integrated with Drizzle)

**Backend Dependencies**:
- **@neondatabase/serverless**: Neon-compatible PostgreSQL driver (prepared for potential Neon migration)
- **connect-pg-simple**: PostgreSQL session store (currently unused, prepared for session management)
- **esbuild**: Server bundle compilation for production

**Build & Development Tools**:
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Replit-specific development tools
- **@replit/vite-plugin-dev-banner**: Development mode banner
- **drizzle-kit**: Schema migrations and introspection

**Deployment Configuration**:
- **Replit Secrets**: Environment variables stored securely
- **Vite Client Build**: Static assets output to `dist/public`
- **Express Server**: Serves built frontend and API routes
- Production build uses `esbuild` for server code bundling

**External URLs**:
- Tools link to third-party download sources (not hosted by the app)
- Optional donation URLs (e.g., PayPal, Ko-fi)
- Optional Telegram group/channel links

**Alternatives Considered**:
- **Firebase**: More expensive at scale, less SQL-friendly
- **Auth0**: Overkill for simple email/password auth
- **Self-hosted PostgreSQL**: More maintenance, less features than Supabase

**Integration Points**:
- No webhooks or external API calls currently
- All downloads tracked internally (no external analytics services)
- Reviews and ratings stored locally (no third-party review platforms)