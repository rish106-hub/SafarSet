import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !publishableKey || !serviceRoleKey) {
  throw new Error("Set the local Supabase URL, publishable key, and service-role key.");
}

const options = { auth: { persistSession: false, autoRefreshToken: false } };
const supabase = createClient(url, serviceRoleKey, options);
const suffix = randomUUID().slice(0, 8);
const customerEmail = `browser-${suffix}@example.test`;
const customerPassword = `Browser-${randomUUID()}!9a`;
const adminEmail = "admin@admin.com";
const adminPassword = "admin@123";
let customerId;

async function upsertAdmin() {
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  const existing = data.users.find((user) => user.email?.toLowerCase() === adminEmail);
  if (existing) {
    const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
      password: adminPassword,
      email_confirm: true,
      app_metadata: { ...existing.app_metadata, role: "admin" },
    });
    if (updateError) throw updateError;
    return;
  }
  const { error: createError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    app_metadata: { role: "admin" },
    user_metadata: { full_name: "SafarSet administrator" },
  });
  if (createError) throw createError;
}

try {
  await upsertAdmin();
  const { data, error } = await supabase.auth.admin.createUser({
    email: customerEmail,
    password: customerPassword,
    email_confirm: true,
    user_metadata: { full_name: "Browser Test Customer" },
  });
  if (error) throw error;
  customerId = data.user.id;

  const child = spawn("npx", ["playwright", "test", "tests/e2e/authenticated-beta.spec.ts"], {
    stdio: "inherit",
    env: {
      ...process.env,
      NEXT_PUBLIC_SUPABASE_URL: url,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey,
      SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey,
      E2E_USER_EMAIL: customerEmail,
      E2E_USER_PASSWORD: customerPassword,
      E2E_ADMIN_EMAIL: adminEmail,
      E2E_ADMIN_PASSWORD: adminPassword,
    },
  });
  const exitCode = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code) => resolve(code ?? 1));
  });
  if (exitCode !== 0) process.exitCode = exitCode;
} finally {
  if (customerId) {
    const { error } = await supabase.auth.admin.deleteUser(customerId);
    if (error) process.stderr.write(`Could not remove browser test user: ${error.message}\n`);
  }
}
