import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = (process.env.ADMIN_EMAIL || "admin@admin.com").toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!url || !serviceRoleKey || !password) {
  throw new Error("Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and ADMIN_PASSWORD.");
}
if (password.length < 8) throw new Error("ADMIN_PASSWORD must contain at least 8 characters.");
if (process.env.VERCEL_ENV === "production" && password === "admin@123") {
  throw new Error("admin@123 is blocked in production. Set a unique ADMIN_PASSWORD.");
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: usersPage, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
if (listError) throw listError;
const existing = usersPage.users.find((user) => user.email?.toLowerCase() === email);

if (existing) {
  const { error } = await supabase.auth.admin.updateUserById(existing.id, {
    password,
    email_confirm: true,
    app_metadata: { ...existing.app_metadata, role: "admin" },
  });
  if (error) throw error;
  process.stdout.write(`Updated admin account ${email}\n`);
} else {
  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: "admin" },
    user_metadata: { full_name: "SafarSet administrator" },
  });
  if (error) throw error;
  process.stdout.write(`Created admin account ${email}\n`);
}
