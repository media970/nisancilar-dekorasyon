"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type CustomerRequestFormProps = { requestTypes: string[] };

export default function CustomerRequestForm({ requestTypes }: CustomerRequestFormProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [requestType, setRequestType] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setError("");

    // Honeypot: normal ziyaretçi bu gizli alanı doldurmaz.
    if (website) {
      setStatus("Talebiniz alındı. Teşekkür ederiz.");
      return;
    }

    if (!consent) {
      setError("Talebiniz hakkında sizinle iletişime geçebilmemiz için onay vermelisiniz.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: insertError } = await supabase
        .from("customer_requests")
        .insert({
          full_name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          request_type: requestType,
          message: message.trim(),
          privacy_consent: consent,
        });

      if (insertError) {
        console.error("Müşteri talebi kaydedilemedi:", insertError);
        setError("Talebiniz şu anda gönderilemedi. Lütfen biraz sonra tekrar deneyin.");
        return;
      }

      setFullName("");
      setPhone("");
      setEmail("");
      setRequestType("");
      setMessage("");
      setConsent(false);
      setStatus("Talebiniz başarıyla alındı. En kısa sürede sizinle iletişime geçeceğiz.");
    } catch {
      setError("Bağlantı sırasında bir sorun oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="customer-request-form" onSubmit={handleSubmit}>
      <div className="customer-request-fields">
        <label>
          Adınız Soyadınız *
          <input
            required
            maxLength={120}
            autoComplete="name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Adınızı ve soyadınızı girin"
          />
        </label>

        <label>
          Telefon Numaranız *
          <input
            required
            type="tel"
            maxLength={30}
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="05XX XXX XX XX"
          />
        </label>

        <label>
          E-posta Adresiniz
          <input
            type="email"
            maxLength={254}
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ornek@mail.com"
          />
        </label>

        <label>
          Talep Konusu *
          <select
            required
            value={requestType}
            onChange={(event) => setRequestType(event.target.value)}
            disabled={requestTypes.length === 0}
          >
            <option value="">{requestTypes.length ? "Hizmet seçiniz" : "Şu anda listelenen hizmet yok"}</option>
            {requestTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>

        <label className="customer-request-message">
          Projenizi Anlatın *
          <textarea
            required
            minLength={10}
            maxLength={3000}
            rows={5}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Nasıl bir çalışma düşünüyorsunuz? Konum, mekan ve beklentilerinizden bahsedebilirsiniz."
          />
        </label>
      </div>

      <label className="customer-request-consent">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
        />
        <span>Talebim hakkında benimle iletişime geçilmesini kabul ediyorum.</span>
      </label>

      {/* Basit spam önleme alanı; gerçek kullanıcılar için görünmez. */}
      <label className="customer-request-honeypot" aria-hidden="true">
        Web sitesi
        <input
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </label>

      {error && <p className="customer-request-error" role="alert">{error}</p>}
      {status && <p className="customer-request-success" role="status">{status}</p>}

      <button className="customer-request-submit" type="submit" disabled={loading}>
        {loading ? "Gönderiliyor..." : "Talebimi Gönder"}
        <span aria-hidden="true">↗</span>
      </button>
      <p className="customer-request-footnote">* işaretli alanların doldurulması zorunludur.</p>
    </form>
  );
}
