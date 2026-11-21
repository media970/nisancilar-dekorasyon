
"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      const redirectTo =
        `${window.location.origin}/auth/callback?next=/admin/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo }
      );

      if (error) {
        setError(error.message);
      } else {
        setMessage(
          "Eğer bu adres kayıtlıysa parola yenileme bağlantısı e-posta adresinize gönderildi."
        );
      }
    } catch {
      setError("İşlem sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={containerStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <Brand />

        <h1 style={{ fontSize: 25, marginBottom: 10 }}>
          Şifremi Unuttum
        </h1>

        <p style={descriptionStyle}>
          Yönetici hesabınıza ait e-posta adresini girin.
          Size parola yenileme bağlantısı göndereceğiz.
        </p>

        <label style={labelStyle}>E-posta adresi</label>

        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="E-posta adresiniz"
          style={inputStyle}
        />

        {message && <p style={successStyle}>{message}</p>}
        {error && <p style={errorStyle}>{error}</p>}

        <button disabled={loading} style={buttonStyle}>
          {loading ? "Gönderiliyor..." : "Yenileme Bağlantısı Gönder"}
        </button>

        <Link href="/admin/login" style={linkStyle}>
          Giriş ekranına dön
        </Link>
      </form>
    </main>
  );
}

function Brand() {
  return (
    <div style={{ marginBottom: 32 }}>
      <strong style={{ fontSize: 22, letterSpacing: 3 }}>NİŞANCILAR</strong>
      <div style={{ fontSize: 10, letterSpacing: 2, color: "#a1845c" }}>
        DEKORASYON & TASARIM
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: 24,
  background: "#f5f3ef",
};

const formStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 420,
  padding: 40,
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 12px 40px rgba(0,0,0,.06)",
  boxSizing: "border-box",
};

const descriptionStyle: React.CSSProperties = {
  color: "#777",
  fontSize: 14,
  lineHeight: 1.6,
  marginBottom: 25,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 13,
  border: "1px solid #ddd",
  borderRadius: 6,
  boxSizing: "border-box",
  fontSize: 14,
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: 15,
  marginTop: 22,
  border: 0,
  borderRadius: 6,
  background: "#292721",
  color: "#fff",
  cursor: "pointer",
};

const successStyle: React.CSSProperties = {
  color: "#16834a",
  fontSize: 13,
  marginTop: 15,
};

const errorStyle: React.CSSProperties = {
  color: "#b42318",
  fontSize: 13,
  marginTop: 15,
};

const linkStyle: React.CSSProperties = {
  display: "block",
  marginTop: 22,
  textAlign: "center",
  color: "#8d704b",
  fontSize: 13,
  textDecoration: "none",
};
