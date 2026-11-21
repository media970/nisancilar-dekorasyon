"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { siteContent } from "../site-content";

type SiteContent = typeof siteContent;
type CustomButtonData = {
  id: string; label: string; href: string;
  placement: "navbar" | "hero" | "contact" | "footer";
  style: "primary" | "outline" | "text"; openNewTab: boolean; visible: boolean;
};

type SiteHomeProps = {
  contentOverride?: Partial<SiteContent>;
  editable?: boolean;
  onContentChange?: (path: string, value: string) => void;
  onHeroTitleChange?: (value: string) => void;
  customButtons?: CustomButtonData[];
};

type EditField = {
  path: string;
  label: string;
  value: string;
};

type SiteEditContextValue = {
  editable: boolean;
  openEditor: (path: string, label: string, value: string) => void;
  chooseImage: (path: string) => void;
  updateContent: (path: string, value: string) => void;
};
const SiteEditContext = createContext<SiteEditContextValue>({
  editable: false,
  openEditor: () => {},
  chooseImage: () => {},
  updateContent: () => {},
});
function TextEdit({ path, label, value, children }: { path: string; label: string; value: string; children: ReactNode }) {
  const editor = useContext(SiteEditContext);
  return (
    <span className="cms-text-wrap">
      {children}
      {editor.editable && (
        <button type="button" className="cms-text-edit" onClick={() => editor.openEditor(path, label, value)} title={`${label} düzenle`} aria-label={`${label} düzenle`}>
          ✎
        </button>
      )}
    </span>
  );
}
function ImageEdit({ path, image, className }: { path: string; image: string; className: string }) {
  const editor = useContext(SiteEditContext);
  return (
    <div className={`${className} cms-image-wrap`} style={image ? { backgroundImage: `url("${image}")` } : undefined}>
      {!image && editor.editable && <div className="cms-image-empty">Görsel bulunmuyor</div>}
      {editor.editable && (
        <div className="cms-image-controls">
          <button type="button" onClick={() => editor.chooseImage(path)}>Değiştir</button>
          <button type="button" onClick={() => editor.updateContent(path, "")}>Kaldır</button>
        </div>
      )}
    </div>
  );
}

function CustomButtonLinks({ buttons, placement }: { buttons: CustomButtonData[]; placement: CustomButtonData["placement"] }) {
  const selected = buttons.filter((item) => item.visible && item.placement === placement);
  if (!selected.length) return null;
  return (
    <div className="cms-custom-button-list">
      {selected.map((item) => (
        <a key={item.id} href={item.href} target={item.openNewTab ? "_blank" : undefined} rel={item.openNewTab ? "noopener noreferrer" : undefined}
          className={`button cms-custom-button ${item.style === "outline" ? "button-outline" : item.style === "text" ? "text-link" : "button-light"}`}>
          {item.label}{item.style !== "text" && <span>↗</span>}
        </a>
      ))}
    </div>
  );
}


export default function SiteHome({
  contentOverride,
  editable = false,
  onContentChange,
  onHeroTitleChange,
  customButtons = [],
}: SiteHomeProps) {
  const [activeField, setActiveField] = useState<EditField | null>(null);
  const [fieldDraft, setFieldDraft] = useState("");
  const [activeImagePath, setActiveImagePath] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const content: SiteContent = {
    ...siteContent,
    ...contentOverride,
    navbar: { ...siteContent.navbar, ...contentOverride?.navbar },
    hero: { ...siteContent.hero, ...contentOverride?.hero },
    about: { ...siteContent.about, ...contentOverride?.about },
    services: {
      ...siteContent.services,
      ...contentOverride?.services,
      items: contentOverride?.services?.items ?? siteContent.services.items,
    },
    projects: {
      ...siteContent.projects,
      ...contentOverride?.projects,
      items: contentOverride?.projects?.items ?? siteContent.projects.items,
    },
    serviceArea: {
      ...siteContent.serviceArea,
      ...contentOverride?.serviceArea,
    },
    quote: { ...siteContent.quote, ...contentOverride?.quote },
    contact: { ...siteContent.contact, ...contentOverride?.contact },
    footer: { ...siteContent.footer, ...contentOverride?.footer },
  };

  // Telefon numarası Genel Bilgiler bölümündeki tek kaynaktan alınır.
  const phone = String(content.navbar.phone ?? "").replace(/\D/g, "");
  const internationalPhone = phone.startsWith("0") ? `90${phone.slice(1)}` : phone;
  const phoneHref = phone ? `tel:${phone}` : "#iletisim";
  const whatsappHref = phone ? `https://wa.me/${internationalPhone}` : "#iletisim";

  const updateContent = (path: string, value: string) => {
    onContentChange?.(path, value);

    if (path === "hero.title") {
      onHeroTitleChange?.(value);
    }
  };

  const openEditor = (path: string, label: string, value: string) => {
    setActiveField({ path, label, value });
    setFieldDraft(value);
  };

  const saveEditor = () => {
    if (!activeField) return;
    updateContent(activeField.path, fieldDraft);
    setActiveField(null);
  };

  const chooseImage = (path: string) => {
    setActiveImagePath(path);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (file?: File) => {
    if (!file || !activeImagePath) return;

    if (!file.type.startsWith("image/")) {
      alert("Lütfen geçerli bir görsel dosyası seç.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Görsel 5 MB sınırını aşıyor. Daha küçük bir görsel seçin.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateContent(activeImagePath, reader.result);
      }
    };

    reader.readAsDataURL(file);
  };

  const heroTitle = content.hero.title.split(", ");
  const quoteLines = content.quote.title.split(". ");

  return (
    <SiteEditContext.Provider value={{ editable, openEditor, chooseImage, updateContent }}>
    <main>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => handleImageChange(event.target.files?.[0])}
      />

      {/* NAVBAR */}
      <header className="navbar">
        <a href="#" className="brand">
          <TextEdit
            path="navbar.brand"
            label="Marka adı"
            value={content.navbar.brand}
          >
            <span className="brand-name">{content.navbar.brand}</span>
          </TextEdit>

          <TextEdit
            path="navbar.subtitle"
            label="Marka alt yazısı"
            value={content.navbar.subtitle}
          >
            <span className="brand-sub">{content.navbar.subtitle}</span>
          </TextEdit>
        </a>

        <nav className="nav-links">
          {content.navbar.links.map((link, index) => (
            <TextEdit
              key={index}
              path={`navbar.links.${index}.label`}
              label="Menü yazısı"
              value={link.label}
            >
              <a href={link.href}>{link.label}</a>
            </TextEdit>
          ))}
        </nav>

        <TextEdit
          path="navbar.contactLabel"
          label="İletişim butonu"
          value={content.navbar.contactLabel}
        >
          <a href={phoneHref} className="nav-contact">
            {content.navbar.contactLabel} <span>↗</span>
          </a>
        </TextEdit>
        <CustomButtonLinks buttons={customButtons} placement="navbar" />
      </header>

      {/* HERO */}
      <section className="hero" id="anasayfa">
        <ImageEdit
          path="hero.image"
          image={content.hero.image}
          className="hero-image"
        />

        <div className="hero-overlay" />

        <div className="hero-content">
          <TextEdit
            path="hero.eyebrow"
            label="Hero üst yazısı"
            value={content.hero.eyebrow}
          >
            <span className="eyebrow hero-eyebrow">
              {content.hero.eyebrow}
            </span>
          </TextEdit>

          <h1>
            <TextEdit
              path="hero.title"
              label="Ana sayfa başlığı"
              value={content.hero.title}
            >
              {heroTitle.length > 1 ? (
                <>
                  {heroTitle[0]},
                  <br />
                  <em>{heroTitle.slice(1).join(", ")}</em>
                </>
              ) : (
                content.hero.title
              )}
            </TextEdit>
          </h1>

          <TextEdit
            path="hero.description"
            label="Ana sayfa açıklaması"
            value={content.hero.description}
          >
            <p>{content.hero.description}</p>
          </TextEdit>

          <div className="hero-actions">
            <TextEdit
              path="hero.button1"
              label="Birinci buton yazısı"
              value={content.hero.button1}
            >
              <a href="#projeler" className="button button-light">
                {content.hero.button1} <span>↗</span>
              </a>
            </TextEdit>

            <TextEdit
              path="hero.button2"
              label="İkinci buton yazısı"
              value={content.hero.button2}
            >
              <a href="#iletisim" className="button button-outline">
                {content.hero.button2}
              </a>
            </TextEdit>
          </div>
          {Array.isArray(content.hero.socialButtons) && content.hero.socialButtons.filter((button: any) => button.visible && button.label?.trim() && button.href?.trim()).length > 0 && (
            <div className="hero-social-actions">
              {content.hero.socialButtons.filter((button: any) => button.visible && button.label?.trim() && button.href?.trim()).map((button: any) => {
                let host = "";
                try { host = new URL(button.href).hostname.replace(/^www\\./, "").toLowerCase(); } catch {}
                const brand = host.includes("instagram") ? "instagram" : host.includes("facebook") ? "facebook" : host.includes("youtube") || host.includes("youtu.be") ? "youtube" : host.includes("tiktok") ? "tiktok" : host.includes("linkedin") ? "linkedin" : host === "x.com" || host.includes("twitter") ? "x" : host.includes("pinterest") ? "pinterest" : "generic";
                return <a key={button.id} href={button.href} target="_blank" rel="noopener noreferrer" className={`hero-social-button hero-social-${brand}`}>{button.label}<span aria-hidden="true">↗</span></a>;
              })}
            </div>
          )}
          <CustomButtonLinks buttons={customButtons} placement="hero" />
        </div>

        <div className="hero-bottom">
          <TextEdit
            path="hero.bottomLeft"
            label="Hero alt sol yazı"
            value={content.hero.bottomLeft}
          >
            <span>{content.hero.bottomLeft}</span>
          </TextEdit>

          <TextEdit
            path="hero.bottomRight"
            label="Hero alt sağ yazı"
            value={content.hero.bottomRight}
          >
            <span>{content.hero.bottomRight}</span>
          </TextEdit>
        </div>
      </section>

      {/* HAKKIMIZDA */}
      <section className="intro section-padding" id="hakkimizda">
        <div className="intro-label">
          <TextEdit
            path="about.eyebrow"
            label="Hakkımızda üst yazısı"
            value={content.about.eyebrow}
          >
            <span className="eyebrow">{content.about.eyebrow}</span>
          </TextEdit>

          <TextEdit
            path="about.sectionNumber"
            label="Bölüm numarası"
            value={content.about.sectionNumber}
          >
            <span className="section-number">
              {content.about.sectionNumber}
            </span>
          </TextEdit>
        </div>

        <div className="intro-content">
          <h2>
            <TextEdit
              path="about.title"
              label="Hakkımızda başlığı"
              value={content.about.title}
            >
              {content.about.title}
            </TextEdit>
          </h2>

          <TextEdit
            path="about.description"
            label="Hakkımızda açıklaması"
            value={content.about.description}
          >
            <p>{content.about.description}</p>
          </TextEdit>

          <TextEdit
            path="about.linkLabel"
            label="Hakkımızda bağlantı yazısı"
            value={content.about.linkLabel}
          >
            <a href="#iletisim" className="text-link">
              {content.about.linkLabel} <span>↗</span>
            </a>
          </TextEdit>
        </div>
      </section>

      {/* HİZMETLER — intentionally read-only in the CMS */}
      <section className="services section-padding" id="hizmetler">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{content.services.eyebrow}</span>
            <h2>{content.services.title}</h2>
          </div>
          <a href="#iletisim" className="text-link">
            {content.services.linkLabel} <span>↗</span>
          </a>
        </div>
        <div className="service-grid">
          {content.services.items.map((service) => (
            <article className="service-card" key={service.number}>
              <div className="service-image" style={{ backgroundImage: service.image ? `url(\"${service.image}\")` : "none" }} />
              <div className="service-info">
                <span className="service-number">{service.number}</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <a href="#iletisim" aria-label={`${service.title} hakkında iletişim`}>↗</a>
              </div>
            </article>
          ))}
        </div>
      </section>


      {/* PROJELER — intentionally locked; user has a separate plan for this section */}
      <section className="projects section-padding" id="projeler">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{content.projects.eyebrow}</span>
            <h2>{content.projects.title}</h2>
          </div>
          <a href="#iletisim" className="text-link">
            {content.projects.linkLabel} <span>↗</span>
          </a>
        </div>
        <div className="project-grid">
          {content.projects.items.map((project, index) => (
            <article className={`project-card project-${index + 1}`} key={project.title}>
              <div className="project-image" style={{ backgroundImage: project.image ? `url(\"${project.image}\")` : "none" }} />
              <div className="project-caption">
                <div>
                  <span className="eyebrow">{project.category}</span>
                  <h3>{project.title}</h3>
                </div>
                <span className="project-arrow">↗</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* HİZMET BÖLGESİ */}
      <section className="service-area-section" id="hizmet-bolgelerimiz">
        <div className="service-area-container">
          <div className="service-area-content">
            <TextEdit
              path="serviceArea.eyebrow"
              label="Hizmet bölgesi üst yazısı"
              value={content.serviceArea.eyebrow}
            >
              <span className="eyebrow">{content.serviceArea.eyebrow}</span>
            </TextEdit>

            <h2>
              <TextEdit
                path="serviceArea.title"
                label="Hizmet bölgesi başlığı"
                value={content.serviceArea.title}
              >
                {content.serviceArea.title}
              </TextEdit>
            </h2>

            <TextEdit
              path="serviceArea.description"
              label="Hizmet bölgesi açıklaması"
              value={content.serviceArea.description}
            >
              <p>{content.serviceArea.description}</p>
            </TextEdit>

            <div className="service-area-location">
              <span className="location-icon">⌖</span>
              <div>
                <TextEdit
                  path="serviceArea.location"
                  label="Konum"
                  value={content.serviceArea.location}
                >
                  <strong>{content.serviceArea.location}</strong>
                </TextEdit>

                <TextEdit
                  path="serviceArea.locationDescription"
                  label="Konum açıklaması"
                  value={content.serviceArea.locationDescription}
                >
                  <span>{content.serviceArea.locationDescription}</span>
                </TextEdit>
              </div>
            </div>

            <TextEdit
              path="serviceArea.mapLink"
              label="Harita bağlantısı"
              value={content.serviceArea.mapLink}
            >
              <a
                href={content.serviceArea.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="service-area-button"
              >
                Google Haritalar&apos;da Görüntüle ↗
              </a>
            </TextEdit>
          </div>

          <div className="service-area-map">
            <iframe
              src={content.serviceArea.mapEmbed}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              title="Nişancılar Dekorasyon hizmet bölgesi haritası"
            />
          </div>
        </div>
      </section>

      {/* TASARIM SÖZÜ */}
      <section className="quote-section">
        <TextEdit
          path="quote.eyebrow"
          label="Slogan üst yazısı"
          value={content.quote.eyebrow}
        >
          <span className="eyebrow">{content.quote.eyebrow}</span>
        </TextEdit>

        <h2>
          <TextEdit
            path="quote.title"
            label="Tasarım sloganı"
            value={content.quote.title}
          >
            {quoteLines.length > 1 ? (
              <>
                {quoteLines[0]}
                <br />
                <em>{quoteLines.slice(1).join(". ")}</em>
              </>
            ) : (
              content.quote.title
            )}
          </TextEdit>
        </h2>
      </section>

      {/* İLETİŞİM */}
      <section className="contact-section" id="iletisim">
        <div className="contact-content">
          <TextEdit
            path="contact.eyebrow"
            label="İletişim üst yazısı"
            value={content.contact.eyebrow}
          >
            <span className="eyebrow">{content.contact.eyebrow}</span>
          </TextEdit>

          <h2>
            <TextEdit
              path="contact.title"
              label="İletişim başlığı"
              value={content.contact.title}
            >
              {content.contact.title}
            </TextEdit>
          </h2>

          <TextEdit
            path="contact.description"
            label="İletişim açıklaması"
            value={content.contact.description}
          >
            <p>{content.contact.description}</p>
          </TextEdit>

          <TextEdit
            path="contact.buttonLabel"
            label="İletişim buton yazısı"
            value={content.contact.buttonLabel}
          >
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-light"
            >
              {content.contact.buttonLabel} <span>↗</span>
            </a>
          </TextEdit>

          <CustomButtonLinks buttons={customButtons} placement="contact" />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <a href="#" className="brand brand-footer">
          <TextEdit
            path="footer.brand"
            label="Footer marka adı"
            value={content.footer.brand}
          >
            <span className="brand-name">{content.footer.brand}</span>
          </TextEdit>

          <TextEdit
            path="footer.subtitle"
            label="Footer alt yazısı"
            value={content.footer.subtitle}
          >
            <span className="brand-sub">{content.footer.subtitle}</span>
          </TextEdit>
        </a>

        <TextEdit
          path="footer.copyright"
          label="Telif yazısı"
          value={content.footer.copyright}
        >
          <span className="footer-copy">{content.footer.copyright}</span>
        </TextEdit>

        <TextEdit
          path="footer.backTop"
          label="Başa dön yazısı"
          value={content.footer.backTop}
        >
          <a href="#anasayfa" className="back-top">
            {content.footer.backTop}
          </a>
        </TextEdit>
        <CustomButtonLinks buttons={customButtons} placement="footer" />
      </footer>

      {/* METİN DÜZENLEME MODALI */}
      {editable && activeField && (
        <div
          className="edit-modal-overlay"
          onClick={() => setActiveField(null)}
        >
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{activeField.label}</h2>

            <label>İçerik</label>

            <textarea
              value={fieldDraft}
              onChange={(e) => setFieldDraft(e.target.value)}
              rows={5}
              autoFocus
            />

            <div className="edit-modal-actions">
              <button type="button" onClick={() => setActiveField(null)}>
                İptal
              </button>

              <button type="button" onClick={saveEditor}>
                Uygula
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
    </SiteEditContext.Provider>
  );
}