"use server";

import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/application/dal/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type InviteState = Readonly<{ error?: string; code?: string; email?: string }> | null;
const schema = z.object({ email: z.email().trim().toLowerCase(), days: z.coerce.number().int().min(1).max(30) });

export async function createBetaInviteAction(_state: InviteState, formData: FormData): Promise<InviteState> {
  const user = await requireAdmin();
  const parsed = schema.safeParse({ email: formData.get("email"), days: formData.get("days") });
  if (!parsed.success) return { error: "Enter an email and an expiry from 1 to 30 days." };
  const code = `SAFAR-${randomBytes(12).toString("base64url")}`;
  const codeHash = createHash("sha256").update(code).digest("hex");
  const expiresAt = new Date(Date.now() + parsed.data.days * 86_400_000).toISOString();
  const admin = createSupabaseAdminClient();
  const { error } = await admin.schema("private").from("beta_invites").insert({ code_hash: codeHash, allowed_email: parsed.data.email, expires_at: expiresAt, created_by: user.id });
  if (error) return { error: "Invite could not be created. Apply the latest database migration first." };
  revalidatePath("/admin");
  return { code, email: parsed.data.email };
}
