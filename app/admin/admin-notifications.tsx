"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminNotifications() {
  const [count, setCount] = useState(0);

  const refreshCount = useCallback(async () => {
    const supabase = createClient();
    const { count: newCount, error } = await supabase
      .from("customer_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "new");

    if (!error) {
      setCount(newCount ?? 0);
    }
  }, []);

  useEffect(() => {
    void refreshCount();
    const intervalId = window.setInterval(() => {
      void refreshCount();
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [refreshCount]);

  if (count === 0) return null;

  return (
    <span
      role="status"
      aria-label={`${count} yeni müşteri talebi`}
      title={`${count} yeni müşteri talebi`}
      style={{
        minWidth: 24,
        height: 24,
        padding: "0 7px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: "2px solid #f5f3ef",
        borderRadius: 999,
        background: "#c9362b",
        color: "#fff",
        fontSize: 12,
        fontWeight: 700,
        lineHeight: 1,
        boxShadow: "0 2px 7px rgba(0,0,0,.18)",
        whiteSpace: "nowrap",
      }}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
