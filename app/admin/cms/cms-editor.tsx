"use client";

import { useMemo, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { publishContent, saveDraft } from "../cms-actions";
import { siteContent } from "@/app/site-content";

type AnyRecord = Record<string, any>;
type HeroSocialButton = { id: string; label: string; href: string; visible: boolean };
type Props = { initialContent: AnyRecord };

const sections = [
  { id: "navbar", title: "Genel bilgiler", description: "Marka kimliği, menü ve üst iletişim bağlantısı." },
  { id: "hero", title: "Hero alanı", description: "Ana sayfanın ilk karşılama alanı." },
  { id: "about", title: "Hakkımızda", description: "Marka anlatımı ve tanıtım metinleri." },
  { id: "serviceArea", title: "Hizmet bölgemiz", description: "Şehir seçin; harita otomatik olarak güncellensin." },
  { id: "quote", title: "Tasarım felsefesi", description: "Markanın tasarım yaklaşımını anlatan slogan." },
  { id: "contact", title: "İletişim", description: "İletişim metinleri ve WhatsApp butonu." },
  { id: "footer", title: "Footer", description: "Alt alan marka bilgileri ve telif metni." },
] as const;

const fieldLabels: Record<string, string> = {
  brand: "Marka adı", subtitle: "Marka alt yazısı", contactLabel: "Üst iletişim butonu",
  eyebrow: "Üst küçük yazı", title: "Başlık", description: "Açıklama", image: "Bölüm arka plan görseli",
  button1: "Birinci buton yazısı", button2: "İkinci buton yazısı", bottomLeft: "Alt sol yazı", bottomRight: "Alt sağ yazı",
  sectionNumber: "Bölüm numarası", linkLabel: "Bağlantı yazısı", location: "Konum", locationDescription: "Konum açıklaması",
  mapLink: "Harita bağlantısı", mapEmbed: "Harita gömme bağlantısı", whatsapp: "WhatsApp bağlantısı", phone: "Telefon numarası",
  copyright: "Telif yazısı", backTop: "Başa dön yazısı",
};

const turkishCities = ["Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkâri", "Hatay", "Iğdır", "Isparta", "İstanbul", "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kırıkkale", "Kırklareli", "Kırşehir", "Kilis", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Şanlıurfa", "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"];

function mapsForCity(city: string) {
  const query = `${city.trim()}, Türkiye`;
  return {
    mapLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
    mapEmbed: `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=12&output=embed`,
  };
}

function formatTurkishPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  if (digits.length <= 9) return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`;
}

function setAtPath(source: AnyRecord, path: string, value: string) {
  const copy = structuredClone(source);
  const parts = path.split(".");
  let target = copy;
  for (const part of parts.slice(0, -1)) target = target[part];
  target[parts[parts.length - 1]] = value;
  return copy;
}

export default function CmsEditor({ initialContent }: Props) {
  const [content, setContent] = useState<AnyRecord>(() => {
    const legacyWhatsapp = String(initialContent?.contact?.whatsapp ?? "");
    const rawPhone = String(initialContent?.navbar?.phone ?? legacyWhatsapp).replace(/\D/g, "");
    const legacyPhone = rawPhone.startsWith("90") && rawPhone.length === 12
      ? `0${rawPhone.slice(2)}`
      : rawPhone;
    return {
      ...initialContent,
      navbar: {
        ...siteContent.navbar,
        ...(initialContent?.navbar ?? {}),
        phone: String(initialContent?.navbar?.phone ?? legacyPhone),
      },
      contact: {
        ...siteContent.contact,
        ...(initialContent?.contact ?? {}),
      },
    };
  });
  const [active, setActive] = useState<string>("hero");
  const [status, setStatus] = useState("");
  const [localPreviews, setLocalPreviews] = useState<Record<string, string>>({});
  const [uploadingPaths, setUploadingPaths] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const activeSection = sections.find((section) => section.id === active)!;
  const fields = useMemo(() => {
    const section = content[active] ?? {};
    const result: { path: string; label: string; value: string; multiline?: boolean; image?: boolean; phone?: boolean }[] = [];
    const walk = (value: any, path: string) => {
      if (typeof value === "string") {
        // Harita bağlantıları şehir adından otomatik üretilir; yönetici URL düzenlemez.
        if (path === "serviceArea.mapLink" || path === "serviceArea.mapEmbed" || path === "contact.whatsapp" || path === "hero.socialButtons" || path.startsWith("hero.socialButtons.")) return;
        const key = path.split(".").pop() ?? path;
        const displayValue = path === "serviceArea.location" && value === "Tokat ve çevresi" ? "Tokat" : value;
        result.push({ path, label: fieldLabels[key] ?? key, value: displayValue, multiline: ["description", "title"].includes(key), image: key === "image", phone: path === "navbar.phone" });
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => walk(item, `${path}.${index}`));
      } else if (value && typeof value === "object") {
        Object.entries(value).forEach(([key, child]) => walk(child, `${path}.${key}`));
      }
    };
    walk(section, active);
    return result;
  }, [active, content]);

  const socialButtons: HeroSocialButton[] = Array.isArray(content?.hero?.socialButtons)
    ? content.hero.socialButtons
    : [];

  function updateSocialButton(index: number, key: keyof HeroSocialButton, value: string | boolean) {
    setContent((current) => {
      const currentButtons: HeroSocialButton[] = Array.isArray(current?.hero?.socialButtons)
        ? current.hero.socialButtons
        : [];
      const nextButtons = currentButtons.map((button, i) =>
        i === index ? { ...button, [key]: value } : button
      );
      return { ...current, hero: { ...current.hero, socialButtons: nextButtons } };
    });
  }

  function addSocialButton() {
    setContent((current) => {
      const currentButtons = Array.isArray(current?.hero?.socialButtons)
        ? current.hero.socialButtons
        : [];
      return {
        ...current,
        hero: {
          ...current.hero,
          socialButtons: [
            ...currentButtons,
            { id: `social-${Date.now()}`, label: "", href: "", visible: true },
          ],
        },
      };
    });
  }

  function removeSocialButton(index: number) {
    setContent((current) => ({
      ...current,
      hero: {
        ...current.hero,
        socialButtons: (Array.isArray(current?.hero?.socialButtons) ? current.hero.socialButtons : [])
          .filter((_: HeroSocialButton, i: number) => i !== index),
      },
    }));
  }

  function update(path: string, value: string) {
    if (path === "navbar.phone") {
      value = value.replace(/\D/g, "").slice(0, 11);
    }
    setContent((current) => {
      let next = setAtPath(current, path, value);
      if (path === "serviceArea.location") {
        const maps = mapsForCity(value);
        next = setAtPath(next, "serviceArea.mapLink", maps.mapLink);
        next = setAtPath(next, "serviceArea.mapEmbed", maps.mapEmbed);
      }
      return next;
    });
  }

  async function uploadImage(path: string, file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("Lütfen geçerli bir görsel dosyası seçin.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setStatus("Görsel en fazla 5 MB olabilir.");
      return;
    }

    // Önizlemeyi yükleme tamamlanmadan yerel dosyadan hemen göster.
    const localUrl = URL.createObjectURL(file);
    setLocalPreviews((current) => {
      const previous = current[path];
      if (previous) URL.revokeObjectURL(previous);
      return { ...current, [path]: localUrl };
    });
    setUploadingPaths((current) => [...current.filter((item) => item !== path), path]);
    setStatus("Görsel seçildi. Supabase Storage'a yükleniyor...");
    try {
      const supabase = createClient();
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `${path.replace(".", "-")}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from("site-media").upload(filePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("site-media").getPublicUrl(filePath);
      update(path, data.publicUrl);
      setLocalPreviews((current) => {
        const next = { ...current };
        const previous = next[path];
        if (previous) URL.revokeObjectURL(previous);
        delete next[path];
        return next;
      });
      setStatus("Görsel Supabase Storage'a yüklendi. Şimdi Taslağı Kaydet veya Yayınla düğmesine basın.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Bilinmeyen yükleme hatası.";
      setStatus(`Görsel yüklenemedi: ${message}. site-media alanını ve yönetici yükleme politikasını kontrol edin.`);
    } finally {
      setUploadingPaths((current) => current.filter((item) => item !== path));
    }
  }

  function submit(publish: boolean) {
    const phone = String(content?.navbar?.phone ?? "");
    if (publish && !/^0\d{10}$/.test(phone)) {
      setStatus("Yayınlamak için telefon numarasını 0 ile başlayan 11 rakam olarak girin. Örn. 05054168460");
      return;
    }
    if (uploadingPaths.length > 0) {
      setStatus("Görsel yüklemesi tamamlanmadan kaydedemez veya yayınlayamazsınız.");
      return;
    }
    setStatus("");
    const form = new FormData();
    form.set("content", JSON.stringify(content));
    startTransition(async () => {
      try {
        if (publish) await publishContent(form); else await saveDraft(form);
        setStatus(publish ? "Değişiklikler yayınlandı." : "Taslak başarıyla kaydedildi.");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "İşlem tamamlanamadı.");
      }
    });
  }

  return <div className="cms-layout">
    <aside className="cms-sidebar">
      <p className="cms-sidebar-label">SİTE BÖLÜMLERİ</p>
      {sections.map((section) => <button key={section.id} type="button" className={`cms-nav-item ${active === section.id ? "active" : ""}`} onClick={() => setActive(section.id)}><span>{section.title}</span><small>İçeriği düzenle →</small></button>)}
    </aside>

    <section className="cms-workspace">
      <div className="cms-section-heading"><div><p className="cms-kicker">İÇERİK DÜZENLEME</p><h2>{activeSection.title}</h2><p>{activeSection.description}</p></div><span className="cms-edit-tag">Düzenlenebilir alan</span></div>
      <div className="cms-fields-grid">
        {fields.map((field) => <label className={`cms-field ${field.image ? "cms-image-field" : ""}`} key={field.path}>
          <span>{field.path === "serviceArea.location" ? "Şehir / İl" : field.label}</span>
          {field.image ? <>
            {(localPreviews[field.path] || field.value) ? <div className="cms-image-preview" style={{ backgroundImage: `url("${localPreviews[field.path] || field.value}")` }} /> : <div className="cms-image-empty-preview">Henüz görsel seçilmedi</div>}
            <div className="cms-image-actions">
              <label className="cms-upload-button">{uploadingPaths.includes(field.path) ? "Görsel yükleniyor…" : "Bilgisayardan görsel seç"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden disabled={uploadingPaths.includes(field.path)} onChange={(event) => { const file = event.target.files?.[0]; void uploadImage(field.path, file); event.target.value = ""; }} /></label>
              {field.value && <button type="button" className="cms-remove-image" onClick={() => { const previous = localPreviews[field.path]; if (previous) URL.revokeObjectURL(previous); setLocalPreviews((current) => { const next = { ...current }; delete next[field.path]; return next; }); update(field.path, ""); }}>Görseli kaldır</button>}
            </div>
            <small>Yalnızca bilgisayarınızdan görsel seçebilirsiniz. JPG, PNG, WebP veya GIF · En fazla 5 MB. Önizleme hemen görünür; kalıcı olması için yüklemenin tamamlanması gerekir.</small>
          </> : field.phone ? <>
            <input
              type="tel"
              inputMode="numeric"
              value={formatTurkishPhone(field.value)}
              onChange={(event) => update(field.path, event.target.value)}
              placeholder="05xx xxx xx xx"
              maxLength={14}
              autoComplete="tel"
            />
            <small>Numarayı 05 ile başlayarak yazın; boşluklar otomatik eklenir. Örn. 0505 416 84 60. WhatsApp ve arama bağlantıları bu numaradan otomatik oluşturulur.</small>
          </> : field.path === "serviceArea.location" ? <>
            <input
              list="turkish-city-list"
              value={field.value}
              onChange={(event) => update(field.path, event.target.value)}
              placeholder="Şehir adı yazın (örn. Sivas)"
              autoComplete="off"
            />
            <datalist id="turkish-city-list">{turkishCities.map((city) => <option value={city} key={city} />)}</datalist>
            <small>Şehir adını doğrudan bu kutuya yazın. Örneğin Sivas veya Ankara. Harita yazdıkça otomatik güncellenir.</small>
          </> : field.multiline ? <textarea rows={field.path.endsWith("title") ? 3 : 4} value={field.value} onChange={(event) => update(field.path, event.target.value)} /> : <input value={field.value} onChange={(event) => update(field.path, event.target.value)} />}
        </label>)}
      </div>
      {active === "hero" && <section className="cms-social-manager">
        <div className="cms-social-manager-heading">
          <div><strong>Hero bağlantılı butonlar</strong><p>Mevcut iki ana sayfa butonu aynen kalır. Buraya ekleyeceğiniz sosyal medya bağlantıları onların yanında ayrıca görünür.</p></div>
          <button type="button" onClick={addSocialButton}>+ Bağlantı ekle</button>
        </div>
        {socialButtons.length === 0 ? <p className="cms-social-empty">Henüz ek sosyal medya butonu yok.</p> : socialButtons.map((button, index) => <div className="cms-social-row" key={button.id || index}>
          <label className="cms-field"><span>Buton yazısı</span><input value={button.label} onChange={(event) => updateSocialButton(index, "label", event.target.value)} placeholder="Instagram" /></label>
          <label className="cms-field"><span>Bağlantı adresi</span><input type="url" value={button.href} onChange={(event) => updateSocialButton(index, "href", event.target.value)} placeholder="https://www.instagram.com/..." /></label>
          <label className="cms-social-visible"><input type="checkbox" checked={button.visible} onChange={(event) => updateSocialButton(index, "visible", event.target.checked)} /> Aktif</label>
          <button type="button" className="cms-social-delete" onClick={() => removeSocialButton(index)}>Sil</button>
        </div>)}
      </section>}
      {active === "serviceArea" && <div className="cms-map-preview"><div><strong>Harita önizlemesi</strong><span>{content.serviceArea.location || "Şehir girildiğinde harita burada görünür."}</span></div>{content.serviceArea.location?.trim() ? <iframe title={`${content.serviceArea.location} hizmet bölgesi harita önizlemesi`} src={mapsForCity(content.serviceArea.location).mapEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /> : <div className="cms-map-empty">Haritayı görmek için yukarıdaki şehir alanına şehir adı yazın.</div>}</div>}
      {active === "navbar" && <p className="cms-note">Menü bağlantılarının hedef adresleri mevcut sayfa bağlantıları olarak korunur; burada yalnızca görünen yazıları değiştirebilirsin.</p>}
      <div className="cms-savebar"><div aria-live="polite" className="cms-status">{status || "Değişikliklerinizi kaydetmeyi unutmayın."}</div><div><button type="button" className="cms-save-button" disabled={isPending || uploadingPaths.length > 0} onClick={() => submit(false)}>{isPending ? "İşleniyor…" : "Taslağı Kaydet"}</button><button type="button" className="cms-publish-button" disabled={isPending || uploadingPaths.length > 0} onClick={() => submit(true)}>{isPending ? "İşleniyor…" : "Yayınla"}</button></div></div>
    </section>
  </div>;
}
