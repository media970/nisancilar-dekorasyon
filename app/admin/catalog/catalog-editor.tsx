"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { publishCatalog, saveCatalogDraft } from "../catalog-actions";

type CatalogItem = { number?: string; title: string; description?: string; category?: string; image: string };
type Props = { section: "services" | "projects"; initialItems: CatalogItem[]; availableServices?: string[] };

export default function CatalogEditor({ section, initialItems, availableServices = [] }: Props) {
  const [items, setItems] = useState<CatalogItem[]>(initialItems);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState<number[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const isServices = section === "services";
  const title = isServices ? "Hizmetlerimiz" : "Projelerimiz";

  function change(index: number, key: keyof CatalogItem, value: string) {
    setItems(current => current.map((item, i) => i === index ? { ...item, [key]: value } : item));
  }

  async function upload(index: number, file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setStatus("Lütfen bir görsel dosyası seçin."); return; }
    if (file.size > 5 * 1024 * 1024) { setStatus("Görsel en fazla 5 MB olabilir."); return; }
    setUploading(current => [...current, index]);
    setStatus("Görsel yükleniyor...");
    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${section}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
      const supabase = createClient();
      const { error } = await supabase.storage.from("site-media").upload(path, file, { contentType: file.type, cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("site-media").getPublicUrl(path);
      change(index, "image", data.publicUrl);
      setStatus("Görsel yüklendi. Değişiklikleri kaydetmeyi unutmayın.");
    } catch (error) {
      setStatus(error instanceof Error ? `Görsel yüklenemedi: ${error.message}` : "Görsel yüklenemedi.");
    } finally {
      setUploading(current => current.filter(i => i !== index));
    }
  }

  function addItem() {
    const item: CatalogItem = isServices
      ? { number: String(items.length + 1).padStart(2, "0"), title: "", description: "", image: "" }
      : { title: "", category: "", image: "" };
    setItems(current => [...current, item]);
    setEditing(items.length);
  }

  function removeItem(index: number) {
    setItems(current => current.filter((_, i) => i !== index));
    setEditing(current => current === index ? null : current !== null && current > index ? current - 1 : current);
  }

  function submit(publish: boolean) {
    if (uploading.length) { setStatus("Görsel yüklemesi tamamlanmadan kayıt yapılamaz."); return; }
    if (items.some(item => !item.title.trim() || !item.image.trim())) { setStatus("Her kayıt için başlık ve görsel ekleyin."); return; }
    if (isServices && items.some(item => !item.description?.trim())) { setStatus("Her hizmet için kısa bir açıklama ekleyin."); return; }
    if (!isServices && items.some(item => !item.category?.trim() || !availableServices.includes(item.category.trim()))) {
      setStatus(availableServices.length ? "Her proje için mevcut hizmetlerden bir kategori seçin." : "Önce Hizmetlerimiz bölümüne en az bir hizmet ekleyip kaydedin.");
      return;
    }
    const formData = new FormData();
    formData.set("section", section);
    formData.set("items", JSON.stringify(items));
    startTransition(async () => {
      try {
        const result = publish ? await publishCatalog(formData) : await saveCatalogDraft(formData);
        if (result?.success) setStatus(publish ? "Yayınlandı. Sitede görüntülenebilir." : "Taslak kaydedildi. Henüz ziyaretçilere gösterilmiyor.");
      } catch (error) { setStatus(error instanceof Error ? error.message : "İşlem başarısız."); }
    });
  }

  return (
    <div className="catalog-editor">
      <div className="catalog-list-head">
        <div><span className="cms-kicker">NİŞANCILAR DEKORASYON</span><h2>{title}</h2><p>{isServices ? "Yalnızca gerçekten sunduğunuz hizmetleri ekleyin." : "Yalnızca tamamlanmış ve gerçek projelerinizi ekleyin."}</p></div>
        <button className="catalog-add" type="button" onClick={addItem}>+ Yeni {isServices ? "hizmet" : "proje"} ekle</button>
      </div>

      {items.length === 0 && <div className="catalog-empty">Henüz kayıt eklenmemiş. Başlamak için “Yeni {isServices ? "hizmet" : "proje"} ekle” seçeneğini kullanın.</div>}

      <div className="catalog-items">
        {items.map((item, index) => (
          <article className={`catalog-item ${editing === index ? "is-editing" : ""}`} key={`${section}-${index}`}>
            <div className="catalog-summary">
              {item.image ? <div className="catalog-thumb" style={{ backgroundImage: `url("${item.image}")` }} /> : <div className="catalog-thumb catalog-thumb-empty">Görsel yok</div>}
              <div className="catalog-summary-text">
                <strong>{item.title.trim() || `${isServices ? "Yeni hizmet" : "Yeni proje"} ${index + 1}`}</strong>
                <span>{isServices ? (item.description?.trim() || "Hizmet açıklaması eklenmedi") : (item.category?.trim() || "Kategori belirtilmedi")}</span>
              </div>
              <div className="catalog-summary-actions">
                <button type="button" className="catalog-edit-button" onClick={() => setEditing(editing === index ? null : index)}>{editing === index ? "Düzenlemeyi kapat" : "Düzenle"}</button>
                <button type="button" className="catalog-delete-button" onClick={() => removeItem(index)}>Sil</button>
              </div>
            </div>

            {editing === index && <div className="catalog-edit-panel">
              <div className="catalog-fields">
                {isServices && <label className="cms-field"><span>Sıra numarası</span><input value={item.number ?? ""} onChange={e => change(index, "number", e.target.value)} placeholder="01" /></label>}
                <label className="cms-field"><span>{isServices ? "Hizmet adı" : "Proje adı"}</span><input value={item.title} onChange={e => change(index, "title", e.target.value)} placeholder={isServices ? "Örn. Anahtar Teslim Tadilat" : "Örn. Merkez Konut Yenileme"} /></label>
                {isServices
                  ? <label className="cms-field"><span>Hizmet açıklaması</span><textarea rows={3} value={item.description ?? ""} onChange={e => change(index, "description", e.target.value)} placeholder="Hizmetin kapsamını kısaca açıklayın." /></label>
                  : <label className="cms-field">
                      <span>Proje kategorisi</span>
                      <select
                        className="catalog-service-select"
                        value={item.category ?? ""}
                        onChange={e => change(index, "category", e.target.value)}
                        disabled={availableServices.length === 0}
                        style={{
                          width: "100%",
                          minHeight: "46px",
                          padding: "0 13px",
                          border: "1px solid #ded8ce",
                          borderRadius: "8px",
                          backgroundColor: "#fcfbf9",
                          color: "#514b41",
                          fontSize: "14px",
                          fontFamily: "inherit",
                          outline: "none",
                          cursor: availableServices.length === 0 ? "not-allowed" : "pointer",
                          opacity: availableServices.length === 0 ? 0.65 : 1,
                        }}
                      >
                        <option value="">
                          {availableServices.length ? "Hizmet seçin" : "Önce hizmet eklemelisiniz"}
                        </option>
                        {item.category && !availableServices.includes(item.category) && (
                          <option value={item.category}>Geçersiz kategori: {item.category}</option>
                        )}
                        {availableServices.map(service => (
                          <option key={service} value={service}>{service}</option>
                        ))}
                      </select>
                    </label>}
              </div>
              <div className="catalog-image-col"><span className="catalog-image-label">{isServices ? "Hizmet görseli" : "Tamamlanan iş fotoğrafı"}</span>
                {item.image ? <div className="catalog-image-preview" style={{ backgroundImage: `url("${item.image}")` }} /> : <div className="catalog-image-placeholder">Henüz görsel seçilmedi</div>}
                <label className="cms-upload-button">Bilgisayardan görsel seç<input type="file" accept="image/*" disabled={uploading.includes(index)} onChange={e => upload(index, e.target.files?.[0])} /></label>
                {item.image && <button className="cms-remove-image" type="button" onClick={() => change(index, "image", "")}>Görseli kaldır</button>}
                <small>JPG, PNG veya WebP · En fazla 5 MB</small>
              </div>
            </div>}
          </article>
        ))}
      </div>

      <div className="catalog-savebar"><span>{status || "Kayıtları düzenlemek için Düzenle'yi seçin. Taslak ve yayınlama işlemleri ayrıdır."}</span><div><button type="button" disabled={pending || uploading.length > 0} onClick={() => submit(false)}>Taslağı Kaydet</button><button type="button" disabled={pending || uploading.length > 0} onClick={() => submit(true)}>Yayınla</button></div></div>
    </div>
  );
}
