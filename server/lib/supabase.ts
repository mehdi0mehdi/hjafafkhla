import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables on server!');
}

// Server-side Supabase client with service role key for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Helper to validate JWT token and get user
export async function validateAuthToken(token: string) {
  if (!token) {
    throw new Error('No token provided');
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Invalid or expired token');
  }

  return user;
}

// Helper to check if user is admin
export async function isUserAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('is_admin')
    .eq('id', userId)
    .single();

  if (error || !data) return false;
  return data.is_admin === true;
}

// Middleware factory for admin-only routes
export function requireAdmin() {
  return async (req: any, res: any, next: any) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = authHeader.replace('Bearer ', '');
      const user = await validateAuthToken(token);

      const isAdmin = await isUserAdmin(user.id);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error: any) {
      return res.status(401).json({ error: error.message || 'Unauthorized' });
    }
  };
}

// Middleware factory for authenticated routes (non-admin)
export function requireAuth() {
  return async (req: any, res: any, next: any) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = authHeader.replace('Bearer ', '');
      const user = await validateAuthToken(token);

      req.user = user;
      next();
    } catch (error: any) {
      return res.status(401).json({ error: error.message || 'Unauthorized' });
    }
  };
}
