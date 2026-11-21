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

async function updateCatalog(formData: FormData, publish: boolean) {
  const supabase = await requireAdmin();
  const section = formData.get("section");
  const raw = formData.get("items");
  if (section !== "services" && section !== "projects") throw new Error("Geçersiz içerik bölümü.");
  if (typeof raw !== "string") throw new Error("İçerik verisi bulunamadı.");
  let items: unknown;
  try { items = JSON.parse(raw); } catch { throw new Error("İçerik verisi geçersiz."); }
  if (!Array.isArray(items)) throw new Error("Kayıt listesi geçersiz.");
  const { data, error: readError } = await supabase.from("site_content").select("draft_content, published_content").eq("id", 1).single();
  if (readError) throw new Error(`Mevcut içerik okunamadı: ${readError.message}`);
  const draft = { ...(data.draft_content ?? {}), [section]: { ...(data.draft_content?.[section] ?? {}), items } };
  const update: Record<string, unknown> = { draft_content: draft, updated_at: new Date().toISOString() };
  if (publish) {
    update.published_content = { ...(data.published_content ?? {}), [section]: { ...(data.published_content?.[section] ?? {}), items } };
    update.published_at = new Date().toISOString();
  }
  const { error } = await supabase.from("site_content").update(update).eq("id", 1);
  if (error) throw new Error(`Kayıt başarısız: ${error.message}`);
  revalidatePath("/");
  revalidatePath(`/admin/${section}`);
  return { success: true };
}

export async function saveCatalogDraft(formData: FormData) { return updateCatalog(formData, false); }
export async function publishCatalog(formData: FormData) { return updateCatalog(formData, true); }
