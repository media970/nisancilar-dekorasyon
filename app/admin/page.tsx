
import { Suspense } from "react";
import AdminContent from "./admin-content";

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <main style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f5f3ef",
          color: "#292721",
        }}>
          Yönetim paneli yükleniyor...
        </main>
      }
    >
      <AdminContent />
    </Suspense>
  );
}
