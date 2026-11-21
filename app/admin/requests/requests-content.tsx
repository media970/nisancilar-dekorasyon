import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RequestsManager, { type CustomerRequest } from "./requests-manager";

export default async function RequestsContent() {
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !["admin", "yönetici"].includes(String(user.app_metadata?.role))) {
    redirect("/admin/login");
  }

  const { data, error } = await supabase
    .from("customer_requests")
    .select("id, full_name, phone, email, request_type, message, status, admin_note, created_at")
    .order("created_at", { ascending: false });

  const requests = (data ?? []) as CustomerRequest[];

  return (
    <main style={{
      minHeight: "100vh",
      background: "#f5f3ef",
      padding: "32px clamp(18px, 5vw, 56px) 60px",
      color: "#292721",
    }}>
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
        borderBottom: "1px solid #ddd",
        paddingBottom: 22,
      }}>
        <div>
          <Link href="/admin" style={{ color: "#8d704b", fontSize: 12, textDecoration: "none" }}>
            ← Yönetim merkezine dön
          </Link>
          <h1 style={{ fontSize: 30, fontWeight: 400, margin: "14px 0 4px" }}>
            Müşteri Talepleri
          </h1>
          <p style={{ color: "#777", fontSize: 13, margin: 0 }}>
            Web sitesi üzerinden gönderilen proje talepleri
          </p>
        </div>
        <Link href="/" target="_blank" style={{
          padding: "11px 16px",
          border: "1px solid #d7d1c7",
          borderRadius: 5,
          color: "#51483b",
          textDecoration: "none",
          fontSize: 12,
        }}>
          Siteyi görüntüle ↗
        </Link>
      </header>

      {error ? (
        <section style={{
          marginTop: 28,
          padding: 20,
          background: "#fff",
          border: "1px solid #e8c5c2",
          borderRadius: 8,
          color: "#9f2d25",
        }}>
          Talepler yüklenemedi. Supabase SQL kurulumunun tamamlandığını ve yönetici
          okuma politikasının etkin olduğunu kontrol edin. ({error.message})
        </section>
      ) : (
        <RequestsManager requests={requests} />
      )}
    </main>
  );
}
