import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { siteContent } from "@/app/site-content";
import CatalogEditor from "../catalog/catalog-editor";
async function ServicesContent() {
  await connection(); const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/admin/login");
  const { data, error } = await supabase.from("site_content").select("draft_content").eq("id", 1).single();
  if (error) throw new Error(`Hizmetler yüklenemedi: ${error.message}`);
  const items = data?.draft_content?.services?.items ?? [];
  return <main className="cms-page"><header className="cms-topbar"><div><Link href="/admin" className="cms-back">← Yönetim paneli</Link><p className="cms-kicker">İŞLETME KATALOĞU</p><h1>Hizmetlerimiz</h1></div><span className="cms-top-meta">Gerçek hizmet kayıtları</span></header><CatalogEditor section="services" initialItems={items} /></main>;
}
export default function ServicesPage() { return <Suspense fallback={<main className="cms-page">Hizmetler yükleniyor...</main>}><ServicesContent /></Suspense>; }
