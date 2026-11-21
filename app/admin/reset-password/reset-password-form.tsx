
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordForm() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Parola en az 8 karakter olmalıdır.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Girdiğiniz parolalar eşleşmiyor.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      await supabase.auth.signOut();

      router.replace("/admin/login?password_updated=1");
      router.refresh();
    } catch {
      setError("Parola güncellenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: 24,
      background: "#f5f3ef",
    }}>
      <form onSubmit={handleSubmit} style={{
        width: "100%",
        maxWidth: 420,
        padding: 40,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 12px 40px rgba(0,0,0,.06)",
        boxSizing: "border-box",
      }}>
        <div style={{ marginBottom: 32 }}>
          <strong style={{ fontSize: 22, letterSpacing: 3 }}>
            NİŞANCILAR
          </strong>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "#a1845c" }}>
            DEKORASYON & TASARIM
          </div>
        </div>

        <h1 style={{ fontSize: 25, marginBottom: 10 }}>
          Yeni Şifre Belirle
        </h1>

        <p style={{ color: "#777", fontSize: 14, marginBottom: 25 }}>
          Yönetici hesabınız için yeni bir parola oluşturun.
        </p>

        <label style={{ display: "block", fontSize: 13, marginBottom: 8 }}>
          Yeni parola
        </label>

        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          style={inputStyle}
        />

        <label style={{
          display: "block",
          fontSize: 13,
          margin: "18px 0 8px",
        }}>
          Yeni parola tekrar
        </label>

        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          style={inputStyle}
        />

        {error && (
          <p role="alert" style={{ color: "#b42318", fontSize: 13 }}>
            {error}
          </p>
        )}

        <button disabled={loading} style={buttonStyle}>
          {loading ? "Kaydediliyor..." : "Yeni Parolayı Kaydet"}
        </button>
      </form>
    </main>
  );
}

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
  marginTop: 24,
  border: 0,
  borderRadius: 6,
  background: "#292721",
  color: "#fff",
  cursor: "pointer",
};
