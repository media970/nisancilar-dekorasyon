"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type RequestStatus = "new" | "in_progress" | "completed" | "cancelled";

export type CustomerRequest = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  request_type: string;
  message: string;
  status: RequestStatus;
  admin_note: string | null;
  created_at: string;
};

const statusLabels: Record<RequestStatus, string> = {
  new: "Yeni",
  in_progress: "Görüşülüyor",
  completed: "Tamamlandı",
  cancelled: "İptal",
};

const statusColors: Record<RequestStatus, { background: string; color: string }> = {
  new: { background: "#e9efff", color: "#3559a6" },
  in_progress: { background: "#fff1d8", color: "#93621b" },
  completed: { background: "#e5f3e9", color: "#267344" },
  cancelled: { background: "#f4e8e6", color: "#9b4037" },
};

export default function RequestsManager({ requests }: { requests: CustomerRequest[] }) {
  const [items, setItems] = useState(requests);
  const [filter, setFilter] = useState<"all" | RequestStatus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(requests[0]?.id ?? null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  const selected = items.find((item) => item.id === selectedId) ?? null;

  const filtered = useMemo(
    () => filter === "all" ? items : items.filter((item) => item.status === filter),
    [items, filter]
  );

  const counts = useMemo(() => ({
    all: items.length,
    new: items.filter((item) => item.status === "new").length,
    in_progress: items.filter((item) => item.status === "in_progress").length,
    completed: items.filter((item) => item.status === "completed").length,
  }), [items]);

  async function updateRequest(id: string, changes: Partial<Pick<CustomerRequest, "status" | "admin_note">>) {
    setSaving(true);
    setFeedback("");

    const supabase = createClient();
    const { error } = await supabase
      .from("customer_requests")
      .update(changes)
      .eq("id", id);

    if (error) {
      setFeedback("Değişiklik kaydedilemedi. Yetki politikalarını ve bağlantıyı kontrol edin.");
      setSaving(false);
      return false;
    }

    setItems((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item));
    setFeedback("Değişiklik kaydedildi.");
    setSaving(false);
    return true;
  }

  return (
    <section style={{ maxWidth: 1240, margin: "30px auto 0" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
        gap: 12,
        marginBottom: 22,
      }}>
        {[
          ["Toplam Talep", counts.all],
          ["Yeni", counts.new],
          ["Görüşülüyor", counts.in_progress],
          ["Tamamlandı", counts.completed],
        ].map(([label, value]) => (
          <div key={label} style={{
            background: "#fff",
            border: "1px solid #e8e5df",
            borderRadius: 8,
            padding: "17px 19px",
          }}>
            <div style={{ color: "#858078", fontSize: 12 }}>{label}</div>
            <strong style={{ display: "block", fontSize: 27, fontWeight: 500, marginTop: 5 }}>{value}</strong>
          </div>
        ))}
      </div>

      <div className="customer-requests-layout" style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.1fr) minmax(300px, .9fr)",
        gap: 18,
        alignItems: "start",
      }}>
        <div style={{
          background: "#fff",
          border: "1px solid #e8e5df",
          borderRadius: 8,
          overflow: "hidden",
        }}>
          <div style={{
            padding: 16,
            borderBottom: "1px solid #eee",
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
          }}>
            {(["all", "new", "in_progress", "completed", "cancelled"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                style={{
                  border: filter === value ? "1px solid #8d704b" : "1px solid #e4e0d8",
                  background: filter === value ? "#f2eee8" : "#fff",
                  color: "#51483b",
                  borderRadius: 20,
                  padding: "7px 11px",
                  cursor: "pointer",
                  fontSize: 11,
                }}
              >
                {value === "all" ? "Tümü" : statusLabels[value]}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p style={{ padding: 24, color: "#777", fontSize: 13 }}>
              Bu filtrede müşteri talebi bulunmuyor.
            </p>
          ) : (
            <div>
              {filtered.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => { setSelectedId(item.id); setFeedback(""); }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "17px 18px",
                    border: 0,
                    borderBottom: "1px solid #f0eee9",
                    borderLeft: selectedId === item.id ? "3px solid #a1845c" : "3px solid transparent",
                    background: selectedId === item.id ? "#faf8f4" : "#fff",
                    cursor: "pointer",
                    color: "#292721",
                  }}
                >
                  <span style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                    <strong style={{ fontSize: 13, fontWeight: 600 }}>{item.full_name}</strong>
                    <span style={{
                      whiteSpace: "nowrap",
                      background: statusColors[item.status].background,
                      color: statusColors[item.status].color,
                      borderRadius: 20,
                      padding: "4px 8px",
                      fontSize: 10,
                    }}>{statusLabels[item.status]}</span>
                  </span>
                  <span style={{ display: "block", marginTop: 7, color: "#777", fontSize: 12 }}>
                    {item.request_type} · {new Date(item.created_at).toLocaleString("tr-TR")}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{
          background: "#fff",
          border: "1px solid #e8e5df",
          borderRadius: 8,
          padding: 22,
          minHeight: 300,
        }}>
          {!selected ? (
            <p style={{ color: "#777", fontSize: 13 }}>Detaylarını görmek için bir talep seçin.</p>
          ) : (
            <>
              <div style={{ color: "#a1845c", fontSize: 10, letterSpacing: 1.5 }}>TALEP DETAYI</div>
              <h2 style={{ fontSize: 21, fontWeight: 500, margin: "9px 0 5px" }}>{selected.full_name}</h2>
              <p style={{ color: "#888", fontSize: 11, margin: "0 0 18px" }}>
                {new Date(selected.created_at).toLocaleString("tr-TR")}
              </p>

              <div style={{ display: "grid", gap: 10, fontSize: 13 }}>
                <div><strong>Talep:</strong> {selected.request_type}</div>
                <div><strong>Telefon:</strong> <a href={`tel:${selected.phone}`} style={{ color: "#8d704b" }}>{selected.phone}</a></div>
                {selected.email && <div><strong>E-posta:</strong> <a href={`mailto:${selected.email}`} style={{ color: "#8d704b" }}>{selected.email}</a></div>}
                <div style={{ lineHeight: 1.7 }}>
                  <strong>Açıklama:</strong>
                  <p style={{ whiteSpace: "pre-wrap", color: "#666", margin: "5px 0 0" }}>{selected.message}</p>
                </div>
              </div>

              <a
                href={`https://wa.me/${toWhatsAppNumber(selected.phone)}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  marginTop: 17,
                  padding: "9px 12px",
                  borderRadius: 5,
                  background: "#e8f4eb",
                  color: "#267344",
                  fontSize: 12,
                  textDecoration: "none",
                }}
              >
                WhatsApp ile iletişim ↗
              </a>

              <label style={{ display: "block", marginTop: 22, fontSize: 12, color: "#514e47" }}>
                Talep durumu
                <select
                  value={selected.status}
                  disabled={saving}
                  onChange={(event) => updateRequest(selected.id, { status: event.target.value as RequestStatus })}
                  style={fieldStyle}
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>

              <label style={{ display: "block", marginTop: 16, fontSize: 12, color: "#514e47" }}>
                Yönetici notu
                <textarea
                  id={`note-${selected.id}`}
                  key={selected.id}
                  defaultValue={selected.admin_note ?? ""}
                  maxLength={3000}
                  rows={4}
                  placeholder="Müşteriyle yapılan görüşme veya takip notu..."
                  style={{ ...fieldStyle, resize: "vertical" }}
                />
              </label>

              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  const element = document.getElementById(`note-${selected.id}`) as HTMLTextAreaElement | null;
                  if (element) updateRequest(selected.id, { admin_note: element.value.trim() || null });
                }}
                style={{
                  marginTop: 12,
                  border: 0,
                  borderRadius: 5,
                  padding: "11px 15px",
                  background: "#292721",
                  color: "#fff",
                  cursor: saving ? "wait" : "pointer",
                  fontSize: 12,
                }}
              >
                {saving ? "Kaydediliyor..." : "Notu Kaydet"}
              </button>

              {feedback && <p role="status" style={{ fontSize: 12, color: feedback.includes("kaydedilemedi") ? "#b42318" : "#267344" }}>{feedback}</p>}
            </>
          )}
        </div>
      </div>

    </section>
  );
}

const fieldStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  marginTop: 8,
  padding: 11,
  border: "1px solid #dedbd4",
  borderRadius: 5,
  background: "#fff",
  color: "#292721",
  font: "inherit",
  fontSize: 13,
};


function toWhatsAppNumber(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (!digits.startsWith("90")) digits = `90${digits}`;
  return digits;
}
