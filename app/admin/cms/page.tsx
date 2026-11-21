import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { siteContent } from "@/app/site-content";
import CmsEditor from "./cms-editor";

function CmsLoading() {
  return (
    <main className="cms-page">
      <div className="cms-topbar">
        <div>
          <p className="cms-kicker">NİŞANCILAR DEKORASYON</p>
          <h1>Site içerik yönetimi</h1>
        </div>
        <p>İçerik yönetimi yükleniyor...</p>
      </div>
    </main>
  );
}

async function CmsContent() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !["admin", "yönetici"].includes(String(user.app_metadata?.role))) {
    redirect("/admin/login");
  }

  const { data, error } = await supabase
    .from("site_content")
    .select("draft_content, published_at, updated_at")
    .eq("id", 1)
    .single();

  if (error) {
    throw new Error(`Site içerikleri yüklenemedi: ${error.message}`);
  }

  const content = { ...siteContent, ...(data?.draft_content ?? {}) };

  return (
    <main className="cms-page">
      <header className="cms-topbar">
        <div>
          <Link href="/admin" className="cms-back">← Yönetim paneli</Link>
          <p className="cms-kicker">NİŞANCILAR DEKORASYON</p>
          <h1>Site içerik yönetimi</h1>
        </div>
        <div className="cms-top-meta">
          <span>Taslak düzenleme</span>
          <small>
            {data?.updated_at
              ? `Son kayıt: ${new Date(data.updated_at).toLocaleString("tr-TR")}`
              : "Henüz kayıt yok"}
          </small>
        </div>
      </header>
      <CmsEditor initialContent={content} />
    </main>
  );
}

export default function CmsPage() {
  return (
    <Suspense fallback={<CmsLoading />}>
      <CmsContent />
    </Suspense>
  );
}
