// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
var supabaseUrl = process.env.SUPABASE_URL || "";
var supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables on server!");
}
var supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
async function validateAuthToken(token) {
  if (!token) {
    throw new Error("No token provided");
  }
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    throw new Error("Invalid or expired token");
  }
  return user;
}
async function isUserAdmin(userId) {
  const { data, error } = await supabaseAdmin.from("users").select("is_admin").eq("id", userId).single();
  if (error || !data) return false;
  return data.is_admin === true;
}
function requireAdmin() {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const token = authHeader.replace("Bearer ", "");
      const user = await validateAuthToken(token);
      const isAdmin = await isUserAdmin(user.id);
      if (!isAdmin) {
        return res.status(403).json({ error: "Forbidden" });
      }
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ error: error.message || "Unauthorized" });
    }
  };
}
function requireAuth() {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const token = authHeader.replace("Bearer ", "");
      const user = await validateAuthToken(token);
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ error: error.message || "Unauthorized" });
    }
  };
}

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, boolean, timestamp, uuid, integer, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: uuid("id").primaryKey(),
  // matches auth.users.id
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  is_admin: boolean("is_admin").notNull().default(false),
  created_at: timestamp("created_at").notNull().defaultNow()
});
var tools = pgTable("tools", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  short_desc: text("short_desc").notNull(),
  description_markdown: text("description_markdown").notNull(),
  images: text("images").array().notNull().default(sql`ARRAY[]::text[]`),
  tags: text("tags").array().notNull().default(sql`ARRAY[]::text[]`),
  donation_url: text("donation_url"),
  telegram_url: text("telegram_url"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow()
});
var download_buttons = pgTable("download_buttons", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tool_id: uuid("tool_id").notNull().references(() => tools.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  url: text("url").notNull(),
  order: integer("order").notNull().default(0)
});
var downloads = pgTable("downloads", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tool_id: uuid("tool_id").notNull().references(() => tools.id, { onDelete: "cascade" }),
  button_label: text("button_label").notNull(),
  downloaded_at: timestamp("downloaded_at").notNull().defaultNow()
});
var reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tool_id: uuid("tool_id").notNull().references(() => tools.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  review_text: text("review_text").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow()
}, (table) => ({
  uniqueUserTool: unique().on(table.user_id, table.tool_id)
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true
}).extend({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address")
});
var insertToolSchema = createInsertSchema(tools).omit({
  id: true,
  created_at: true,
  updated_at: true
}).extend({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  short_desc: z.string().min(10, "Short description must be at least 10 characters"),
  description_markdown: z.string().min(20, "Description must be at least 20 characters"),
  images: z.array(z.string().url()).default([]),
  tags: z.array(z.string()).default([])
});
var insertDownloadButtonSchema = createInsertSchema(download_buttons).omit({
  id: true
}).extend({
  label: z.string().min(1, "Label is required"),
  url: z.string().url("Invalid URL")
});
var insertDownloadSchema = createInsertSchema(downloads).omit({
  id: true,
  downloaded_at: true
});
var insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  created_at: true
}).extend({
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  review_text: z.string().min(10, "Review must be at least 10 characters")
});

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/tools", async (req, res) => {
    try {
      const { data: tools2, error } = await supabaseAdmin.from("tools").select(`
          *,
          download_buttons (*)
        `).order("created_at", { ascending: false });
      if (error) throw error;
      const toolsWithStats = await Promise.all(
        (tools2 || []).map(async (tool) => {
          const { count: downloadCount } = await supabaseAdmin.from("downloads").select("*", { count: "exact", head: true }).eq("tool_id", tool.id);
          const { data: reviews2 } = await supabaseAdmin.from("reviews").select("rating").eq("tool_id", tool.id);
          const averageRating = reviews2 && reviews2.length > 0 ? reviews2.reduce((sum, r) => sum + r.rating, 0) / reviews2.length : 0;
          return {
            ...tool,
            download_count: downloadCount || 0,
            average_rating: averageRating,
            review_count: reviews2?.length || 0
          };
        })
      );
      res.json(toolsWithStats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/tools/featured", async (req, res) => {
    try {
      const { data: tools2, error } = await supabaseAdmin.from("tools").select(`
          *,
          download_buttons (*)
        `).order("created_at", { ascending: false }).limit(6);
      if (error) throw error;
      const toolsWithStats = await Promise.all(
        (tools2 || []).map(async (tool) => {
          const { count: downloadCount } = await supabaseAdmin.from("downloads").select("*", { count: "exact", head: true }).eq("tool_id", tool.id);
          const { data: reviews2 } = await supabaseAdmin.from("reviews").select("rating").eq("tool_id", tool.id);
          const averageRating = reviews2 && reviews2.length > 0 ? reviews2.reduce((sum, r) => sum + r.rating, 0) / reviews2.length : 0;
          return {
            ...tool,
            download_count: downloadCount || 0,
            average_rating: averageRating,
            review_count: reviews2?.length || 0
          };
        })
      );
      res.json(toolsWithStats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/tools/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const { data: tool, error } = await supabaseAdmin.from("tools").select(`
          *,
          download_buttons (*)
        `).eq("slug", slug).single();
      if (error) throw error;
      if (!tool) return res.status(404).json({ error: "Tool not found" });
      const { count: downloadCount } = await supabaseAdmin.from("downloads").select("*", { count: "exact", head: true }).eq("tool_id", tool.id);
      const { data: reviews2 } = await supabaseAdmin.from("reviews").select("rating").eq("tool_id", tool.id);
      const averageRating = reviews2 && reviews2.length > 0 ? reviews2.reduce((sum, r) => sum + r.rating, 0) / reviews2.length : 0;
      res.json({
        ...tool,
        download_count: downloadCount || 0,
        average_rating: averageRating,
        review_count: reviews2?.length || 0
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/reviews/:toolId", async (req, res) => {
    try {
      const { toolId } = req.params;
      const { data: reviews2, error } = await supabaseAdmin.from("reviews").select(`
          *,
          user:users (username)
        `).eq("tool_id", toolId).order("created_at", { ascending: false });
      if (error) throw error;
      res.json(reviews2 || []);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/downloads", requireAuth(), async (req, res) => {
    try {
      const { tool_id, button_label } = req.body;
      const user = req.user;
      const { error } = await supabaseAdmin.from("downloads").insert({
        user_id: user.id,
        tool_id,
        button_label
      });
      if (error) throw error;
      res.status(201).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/reviews", requireAuth(), async (req, res) => {
    try {
      const user = req.user;
      const validatedData = insertReviewSchema.parse({
        ...req.body,
        user_id: user.id
      });
      const { error } = await supabaseAdmin.from("reviews").insert(validatedData);
      if (error) {
        if (error.code === "23505") {
          return res.status(400).json({ error: "You have already reviewed this tool" });
        }
        throw error;
      }
      res.status(201).json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/admin/test-login", requireAdmin(), async (req, res) => {
    try {
      const user = req.user;
      res.json({
        ok: true,
        admin: user.email,
        message: "Admin authentication successful"
      });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  });
  app2.get("/api/admin/tools", requireAdmin(), async (req, res) => {
    try {
      const { data: tools2, error } = await supabaseAdmin.from("tools").select(`
          *,
          download_buttons (*)
        `).order("created_at", { ascending: false });
      if (error) throw error;
      const toolsWithStats = await Promise.all(
        (tools2 || []).map(async (tool) => {
          const { count: downloadCount } = await supabaseAdmin.from("downloads").select("*", { count: "exact", head: true }).eq("tool_id", tool.id);
          const { data: reviews2 } = await supabaseAdmin.from("reviews").select("rating").eq("tool_id", tool.id);
          const averageRating = reviews2 && reviews2.length > 0 ? reviews2.reduce((sum, r) => sum + r.rating, 0) / reviews2.length : 0;
          return {
            ...tool,
            download_count: downloadCount || 0,
            average_rating: averageRating,
            review_count: reviews2?.length || 0
          };
        })
      );
      res.json(toolsWithStats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/admin/stats", requireAdmin(), async (req, res) => {
    try {
      const { count: totalTools } = await supabaseAdmin.from("tools").select("*", { count: "exact", head: true });
      const { count: totalDownloads } = await supabaseAdmin.from("downloads").select("*", { count: "exact", head: true });
      const { count: totalReviews } = await supabaseAdmin.from("reviews").select("*", { count: "exact", head: true });
      const { data: reviews2 } = await supabaseAdmin.from("reviews").select("rating");
      const averageRating = reviews2 && reviews2.length > 0 ? reviews2.reduce((sum, r) => sum + r.rating, 0) / reviews2.length : 0;
      res.json({
        totalTools: totalTools || 0,
        totalDownloads: totalDownloads || 0,
        totalReviews: totalReviews || 0,
        averageRating
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/admin/tools", requireAdmin(), async (req, res) => {
    try {
      const { downloadButtons, ...toolData } = req.body;
      const validatedTool = insertToolSchema.parse(toolData);
      const { data: tool, error: toolError } = await supabaseAdmin.from("tools").insert(validatedTool).select().single();
      if (toolError) throw toolError;
      if (downloadButtons && downloadButtons.length > 0) {
        const buttons = downloadButtons.map((btn) => ({
          tool_id: tool.id,
          label: btn.label,
          url: btn.url,
          order: btn.order || 0
        }));
        const { error: buttonsError } = await supabaseAdmin.from("download_buttons").insert(buttons);
        if (buttonsError) throw buttonsError;
      }
      res.status(201).json(tool);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.put("/api/admin/tools/:id", requireAdmin(), async (req, res) => {
    try {
      const { id } = req.params;
      const { downloadButtons, ...toolData } = req.body;
      const validatedTool = insertToolSchema.parse(toolData);
      const { data: tool, error: toolError } = await supabaseAdmin.from("tools").update({ ...validatedTool, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id).select().single();
      if (toolError) throw toolError;
      await supabaseAdmin.from("download_buttons").delete().eq("tool_id", id);
      if (downloadButtons && downloadButtons.length > 0) {
        const buttons = downloadButtons.map((btn) => ({
          tool_id: id,
          label: btn.label,
          url: btn.url,
          order: btn.order || 0
        }));
        const { error: buttonsError } = await supabaseAdmin.from("download_buttons").insert(buttons);
        if (buttonsError) throw buttonsError;
      }
      res.json(tool);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.delete("/api/admin/tools/:id", requireAdmin(), async (req, res) => {
    try {
      const { id } = req.params;
      const { error } = await supabaseAdmin.from("tools").delete().eq("id", id);
      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  async function checkOrCreateDefaultAdmin() {
    try {
      const { data: admins } = await supabaseAdmin.from("users").select("*").eq("is_admin", true);
      if (!admins || admins.length === 0) {
        console.log("\n" + "=".repeat(80));
        console.log("\u26A0\uFE0F  NO ADMIN USERS FOUND");
        console.log("=".repeat(80));
        console.log("\nTo create an admin user, follow these steps:");
        console.log("\n1. Register a new account in the application");
        console.log("2. Run this SQL in your Supabase SQL Editor:\n");
        console.log("   UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';");
        console.log("\n   Replace your-email@example.com with your actual email\n");
        console.log("3. Refresh the page to see admin features\n");
        console.log("=".repeat(80) + "\n");
      } else {
        console.log(`\u2713 Admin users found: ${admins.length}`);
      }
    } catch (error) {
      console.error("Error checking for admin users:", error);
    }
  }
  setTimeout(() => checkOrCreateDefaultAdmin(), 2e3);
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
