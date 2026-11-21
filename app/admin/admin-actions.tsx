
"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminActions() {
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      style={{
        padding: "11px 18px",
        background: "#292721",
        color: "#fff",
        border: 0,
        borderRadius: "6px",
        cursor: "pointer",
      }}
    >
      Güvenli Çıkış
    </button>
  );
}
