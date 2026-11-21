import { connection } from "next/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminActions from "./admin-actions";
import AdminNotifications from "./admin-notifications";

const cardStyle = { display: "block", background: "#fff", padding: "26px 28px", borderRadius: "10px", border: "1px solid #e8e5df", textDecoration: "none", color: "#292721" } as const;

export default async function AdminContent() {
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/admin/login");

  return (
    <main style={{ minHeight: "100vh", background: "#f5f3ef", padding: "40px", color: "#292721" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", borderBottom: "1px solid #ddd", paddingBottom: "25px" }}>
        <div>
          <div style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "2px" }}>NİŞANCILAR</div>
          <p style={{ color: "#888", fontSize: "12px" }}>DEKORASYON & TASARIM — YÖNETİM</p>
        </div>
        <AdminActions />
      </header>

      <section style={{ maxWidth: "1100px", margin: "60px auto" }}>
        <p style={{ color: "#a1845c", letterSpacing: "2px", fontSize: "12px" }}>YÖNETİM MERKEZİ</p>
        <h1 style={{ fontSize: "34px", margin: "12px 0" }}>Hoş geldiniz.</h1>
        <p style={{ color: "#777" }}>Nişancılar Dekorasyon web sitesi yönetim panelindesiniz.</p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "18px",
            marginTop: "40px",
          }}
          className="admin-dashboard-grid"
        >
          <Link
            href="/admin/requests"
            style={{
              ...cardStyle,
              background: "#292721",
              borderColor: "#292721",
              color: "#fff",
              minHeight: "132px",
            }}
          >
            <span style={{ color: "#c5a77e", fontSize: "11px", letterSpacing: "2px" }}>BAŞVURU YÖNETİMİ</span>
            <h2 style={{ fontSize: "22px", margin: "10px 0" }}>
              Müşteri Talepleri <span style={{ float: "right" }}>↗</span>
            </h2>
            <p style={{ fontSize: "14px", color: "#d0c9bd", margin: 0 }}>
              Web sitesinden gelen proje başvurularını görüntüleyin ve takip edin.
            </p>
          </Link>

          <Link href="/admin/cms" style={{ ...cardStyle, minHeight: "132px" }}>
            <span style={{ color: "#a1845c", fontSize: "11px", letterSpacing: "2px" }}>WEB SİTESİ YÖNETİMİ</span>
            <h2 style={{ fontSize: "22px", margin: "10px 0" }}>
              Site Düzeni <span style={{ float: "right" }}>↗</span>
            </h2>
            <p style={{ fontSize: "14px", color: "#777", margin: 0 }}>
              Ana sayfa içeriklerini ve site görünümünü düzenleyin.
            </p>
          </Link>

          <Link href="/admin/projects" style={{ ...cardStyle, minHeight: "132px" }}>
            <span style={{ color: "#a1845c", fontSize: "11px", letterSpacing: "2px" }}>TAMAMLANAN ÇALIŞMALAR</span>
            <h2 style={{ fontSize: "22px", margin: "10px 0" }}>
              Projelerimiz <span style={{ float: "right" }}>↗</span>
            </h2>
            <p style={{ fontSize: "14px", color: "#777", margin: 0 }}>
              Tamamlanmış işlerinizin fotoğraflarını, proje adlarını ve kategorilerini ekleyin.
            </p>
          </Link>

          <Link href="/admin/services" style={{ ...cardStyle, minHeight: "132px" }}>
            <span style={{ color: "#a1845c", fontSize: "11px", letterSpacing: "2px" }}>İŞLETME KATALOĞU</span>
            <h2 style={{ fontSize: "22px", margin: "10px 0" }}>
              Hizmetlerimiz <span style={{ float: "right" }}>↗</span>
            </h2>
            <p style={{ fontSize: "14px", color: "#777", margin: 0 }}>
              Gerçekten sunduğunuz hizmetleri ekleyin, açıklamalarını ve görsellerini yönetin.
            </p>
          </Link>
        </div>

        <style>{`
          @media (max-width: 700px) {
            .admin-dashboard-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </section>
    </main>
  );
}
