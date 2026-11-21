
import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CatalogEditor from "../catalog/catalog-editor";

async function ProjectsContent() {
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    redirect("/admin/login");
  }

  const { data, error } = await supabase
    .from("site_content")
    .select("draft_content")
    .eq("id", 1)
    .single();

  if (error) {
    throw new Error(`Projeler yüklenemedi: ${error.message}`);
  }

  const items = data?.draft_content?.projects?.items ?? [];
  const availableServices = (
    data?.draft_content?.services?.items ?? []
  )
    .map((service: { title?: string }) => service.title?.trim() ?? "")
    .filter((title: string) => title.length > 0);

  return (
    <main className="cms-page">
      <header className="cms-topbar">
        <div>
          <Link href="/admin" className="cms-back">
            ← Yönetim paneli
          </Link>
          <p className="cms-kicker">TAMAMLANAN ÇALIŞMALAR</p>
          <h1>Projelerimiz</h1>
        </div>
        <span className="cms-top-meta">Gerçek proje kayıtları</span>
      </header>

      <CatalogEditor
        section="projects"
        initialItems={items}
        availableServices={availableServices}
      />
    </main>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<main className="cms-page">Projeler yükleniyor...</main>}>
      <ProjectsContent />
    </Suspense>
  );
}
