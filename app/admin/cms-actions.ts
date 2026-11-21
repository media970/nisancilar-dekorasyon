"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/admin/login");
  return supabase;
}

export async function saveDraft(formData: FormData) {
  const supabase = await requireAdmin();
  const raw = formData.get("content");
  if (typeof raw !== "string") throw new Error("İçerik verisi bulunamadı.");
  let parsed: Record<string, unknown>;
  try { parsed = JSON.parse(raw) as Record<string, unknown>; }
  catch { throw new Error("İçerik verisi geçersiz."); }

  const { error } = await supabase.from("site_content").update({
    draft_content: parsed,
    updated_at: new Date().toISOString(),
  }).eq("id", 1);
  if (error) throw new Error(`Taslak kaydedilemedi: ${error.message}`);
  revalidatePath("/admin/cms");
  return { success: true };
}

export async function publishContent(formData: FormData) {
  const supabase = await requireAdmin();
  const raw = formData.get("content");
  if (typeof raw !== "string") throw new Error("İçerik verisi bulunamadı.");
  let parsed: Record<string, unknown>;
  try { parsed = JSON.parse(raw) as Record<string, unknown>; }
  catch { throw new Error("İçerik verisi geçersiz."); }

  const now = new Date().toISOString();
  const { error } = await supabase.from("site_content").update({
    draft_content: parsed,
    published_content: parsed,
    updated_at: now,
    published_at: now,
  }).eq("id", 1);
  if (error) throw new Error(`Yayınlama başarısız: ${error.message}`);
  revalidatePath("/");
  revalidatePath("/admin/cms");
  return { success: true };
}
