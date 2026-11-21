
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

if (loginError) {
  console.error("Supabase giriş hatası:", loginError);
  setError(loginError.message);
  return;
}
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Giriş sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: "24px",
      background: "#f5f3ef",
    }}>
      <form
        onSubmit={handleLogin}
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "40px",
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 12px 40px rgba(0,0,0,.06)",
        }}
      >
        <div style={{ marginBottom: "32px" }}>
          <div style={{
            fontSize: "22px",
            letterSpacing: "3px",
            fontWeight: 700,
            color: "#25231f",
          }}>
            NİŞANCILAR
          </div>
          <div style={{
            fontSize: "10px",
            letterSpacing: "2px",
            marginTop: "5px",
            color: "#a1845c",
          }}>
            DEKORASYON & TASARIM
          </div>
        </div>

        <h1 style={{ fontSize: "25px", marginBottom: "8px" }}>
          Yönetici Girişi
        </h1>

        <p style={{ color: "#777", marginBottom: "28px", fontSize: "14px" }}>
          Yönetim paneline erişmek için giriş yapın.
        </p>

        <label style={{ display: "block", fontSize: "13px", marginBottom: "8px" }}>
          E-posta adresi
        </label>

        <input
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          placeholder="E-posta adresiniz"
        />

        <label style={{
          display: "block",
          fontSize: "13px",
          margin: "18px 0 8px",
        }}>
          Parola
        </label>

        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          placeholder="Parolanız"
        />

        {error && (
          <p role="alert" style={{
            color: "#b42318",
            fontSize: "13px",
            marginTop: "16px",
          }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "15px",
            marginTop: "24px",
            border: 0,
            borderRadius: "6px",
            background: "#292721",
            color: "#fff",
            cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      <a
        href="/admin/forgot-password"
        style={{
          display: "block",
          marginTop: "18px",
          textAlign: "center",
          color: "#8d704b",
          fontSize: "13px",
          textDecoration: "none",
        }}
      >
        Şifremi Unuttum
      </a>
    </form>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  outlineColor: "#a1845c",
  boxSizing: "border-box",
  fontSize: "14px",
};
