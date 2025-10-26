import type { Express } from "express";
import { createServer, type Server } from "http";
import { supabaseAdmin, requireAdmin, requireAuth } from "./lib/supabase";
import { insertToolSchema, insertReviewSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ==================== PUBLIC ROUTES ====================
  
  // Get all tools (with stats)
  app.get('/api/tools', async (req, res) => {
    try {
      const { data: tools, error } = await supabaseAdmin
        .from('tools')
        .select(`
          *,
          download_buttons (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get download counts and ratings for each tool
      const toolsWithStats = await Promise.all(
        (tools || []).map(async (tool) => {
          const { count: downloadCount } = await supabaseAdmin
            .from('downloads')
            .select('*', { count: 'exact', head: true })
            .eq('tool_id', tool.id);

          const { data: reviews } = await supabaseAdmin
            .from('reviews')
            .select('rating')
            .eq('tool_id', tool.id);

          const averageRating = reviews && reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

          return {
            ...tool,
            download_count: downloadCount || 0,
            average_rating: averageRating,
            review_count: reviews?.length || 0,
          };
        })
      );

      res.json(toolsWithStats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get featured tools (same as all tools for now, limited to 6)
  app.get('/api/tools/featured', async (req, res) => {
    try {
      const { data: tools, error } = await supabaseAdmin
        .from('tools')
        .select(`
          *,
          download_buttons (*)
        `)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      const toolsWithStats = await Promise.all(
        (tools || []).map(async (tool) => {
          const { count: downloadCount } = await supabaseAdmin
            .from('downloads')
            .select('*', { count: 'exact', head: true })
            .eq('tool_id', tool.id);

          const { data: reviews } = await supabaseAdmin
            .from('reviews')
            .select('rating')
            .eq('tool_id', tool.id);

          const averageRating = reviews && reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

          return {
            ...tool,
            download_count: downloadCount || 0,
            average_rating: averageRating,
            review_count: reviews?.length || 0,
          };
        })
      );

      res.json(toolsWithStats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get tool by slug
  app.get('/api/tools/:slug', async (req, res) => {
    try {
      const { slug } = req.params;

      const { data: tool, error } = await supabaseAdmin
        .from('tools')
        .select(`
          *,
          download_buttons (*)
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;
      if (!tool) return res.status(404).json({ error: 'Tool not found' });

      // Get stats
      const { count: downloadCount } = await supabaseAdmin
        .from('downloads')
        .select('*', { count: 'exact', head: true })
        .eq('tool_id', tool.id);

      const { data: reviews } = await supabaseAdmin
        .from('reviews')
        .select('rating')
        .eq('tool_id', tool.id);

      const averageRating = reviews && reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      res.json({
        ...tool,
        download_count: downloadCount || 0,
        average_rating: averageRating,
        review_count: reviews?.length || 0,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get reviews for a tool
  app.get('/api/reviews/:toolId', async (req, res) => {
    try {
      const { toolId } = req.params;

      const { data: reviews, error } = await supabaseAdmin
        .from('reviews')
        .select(`
          *,
          user:users (username)
        `)
        .eq('tool_id', toolId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json(reviews || []);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== AUTHENTICATED ROUTES ====================

  // Track download (requires auth)
  app.post('/api/downloads', requireAuth(), async (req, res) => {
    try {
      const { tool_id, button_label } = req.body;
      const user = (req as any).user;

      const { error } = await supabaseAdmin
        .from('downloads')
        .insert({
          user_id: user.id,
          tool_id,
          button_label,
        });

      if (error) throw error;

      res.status(201).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Submit review (requires auth)
  app.post('/api/reviews', requireAuth(), async (req, res) => {
    try {
      const user = (req as any).user;
      const validatedData = insertReviewSchema.parse({
        ...req.body,
        user_id: user.id,
      });

      const { error } = await supabaseAdmin
        .from('reviews')
        .insert(validatedData);

      if (error) {
        if (error.code === '23505') { // Unique violation
          return res.status(400).json({ error: 'You have already reviewed this tool' });
        }
        throw error;
      }

      res.status(201).json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ==================== ADMIN ROUTES ====================

  // Test admin login endpoint
  app.get('/api/admin/test-login', requireAdmin(), async (req, res) => {
    try {
      const user = (req as any).user;
      res.json({ 
        ok: true, 
        admin: user.email,
        message: 'Admin authentication successful'
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  });

  // Get all tools (admin)
  app.get('/api/admin/tools', requireAdmin(), async (req, res) => {
    try {
      const { data: tools, error } = await supabaseAdmin
        .from('tools')
        .select(`
          *,
          download_buttons (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const toolsWithStats = await Promise.all(
        (tools || []).map(async (tool) => {
          const { count: downloadCount } = await supabaseAdmin
            .from('downloads')
            .select('*', { count: 'exact', head: true })
            .eq('tool_id', tool.id);

          const { data: reviews } = await supabaseAdmin
            .from('reviews')
            .select('rating')
            .eq('tool_id', tool.id);

          const averageRating = reviews && reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

          return {
            ...tool,
            download_count: downloadCount || 0,
            average_rating: averageRating,
            review_count: reviews?.length || 0,
          };
        })
      );

      res.json(toolsWithStats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get admin stats
  app.get('/api/admin/stats', requireAdmin(), async (req, res) => {
    try {
      const { count: totalTools } = await supabaseAdmin
        .from('tools')
        .select('*', { count: 'exact', head: true });

      const { count: totalDownloads } = await supabaseAdmin
        .from('downloads')
        .select('*', { count: 'exact', head: true });

      const { count: totalReviews } = await supabaseAdmin
        .from('reviews')
        .select('*', { count: 'exact', head: true });

      const { data: reviews } = await supabaseAdmin
        .from('reviews')
        .select('rating');

      const averageRating = reviews && reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      res.json({
        totalTools: totalTools || 0,
        totalDownloads: totalDownloads || 0,
        totalReviews: totalReviews || 0,
        averageRating,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create tool (admin)
  app.post('/api/admin/tools', requireAdmin(), async (req, res) => {
    try {
      const { downloadButtons, ...toolData } = req.body;

      // Validate tool data
      const validatedTool = insertToolSchema.parse(toolData);

      // Insert tool
      const { data: tool, error: toolError } = await supabaseAdmin
        .from('tools')
        .insert(validatedTool)
        .select()
        .single();

      if (toolError) throw toolError;

      // Insert download buttons
      if (downloadButtons && downloadButtons.length > 0) {
        const buttons = downloadButtons.map((btn: any) => ({
          tool_id: tool.id,
          label: btn.label,
          url: btn.url,
          order: btn.order || 0,
        }));

        const { error: buttonsError } = await supabaseAdmin
          .from('download_buttons')
          .insert(buttons);

        if (buttonsError) throw buttonsError;
      }

      res.status(201).json(tool);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update tool (admin)
  app.put('/api/admin/tools/:id', requireAdmin(), async (req, res) => {
    try {
      const { id } = req.params;
      const { downloadButtons, ...toolData } = req.body;

      // Validate tool data
      const validatedTool = insertToolSchema.parse(toolData);

      // Update tool
      const { data: tool, error: toolError } = await supabaseAdmin
        .from('tools')
        .update({ ...validatedTool, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (toolError) throw toolError;

      // Delete existing download buttons
      await supabaseAdmin
        .from('download_buttons')
        .delete()
        .eq('tool_id', id);

      // Insert new download buttons
      if (downloadButtons && downloadButtons.length > 0) {
        const buttons = downloadButtons.map((btn: any) => ({
          tool_id: id,
          label: btn.label,
          url: btn.url,
          order: btn.order || 0,
        }));

        const { error: buttonsError } = await supabaseAdmin
          .from('download_buttons')
          .insert(buttons);

        if (buttonsError) throw buttonsError;
      }

      res.json(tool);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete tool (admin)
  app.delete('/api/admin/tools/:id', requireAdmin(), async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabaseAdmin
        .from('tools')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== STARTUP: Create default admin ====================
  
  // Check if any admin exists, if not, log instructions
  async function checkOrCreateDefaultAdmin() {
    try {
      const { data: admins } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('is_admin', true);

      if (!admins || admins.length === 0) {
        console.log('\n' + '='.repeat(80));
        console.log('⚠️  NO ADMIN USERS FOUND');
        console.log('='.repeat(80));
        console.log('\nTo create an admin user, follow these steps:');
        console.log('\n1. Register a new account in the application');
        console.log('2. Run this SQL in your Supabase SQL Editor:\n');
        console.log('   UPDATE users SET is_admin = true WHERE email = \'your-email@example.com\';');
        console.log('\n   Replace your-email@example.com with your actual email\n');
        console.log('3. Refresh the page to see admin features\n');
        console.log('='.repeat(80) + '\n');
      } else {
        console.log(`✓ Admin users found: ${admins.length}`);
      }
    } catch (error) {
      console.error('Error checking for admin users:', error);
    }
  }

  // Run admin check on startup
  setTimeout(() => checkOrCreateDefaultAdmin(), 2000);

  const httpServer = createServer(app);
  return httpServer;
}
