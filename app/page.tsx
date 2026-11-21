import { Suspense } from "react";
import { connection } from "next/server";
import CustomerRequestForm from "./components/customer-request-form";
import { createClient } from "@/lib/supabase/server";
import { siteContent } from "./site-content";

function mergeContent(published: any) {
  return {
    ...siteContent,
    ...published,
    navbar: { ...siteContent.navbar, ...published?.navbar, links: published?.navbar?.links ?? siteContent.navbar.links },
    hero: { ...siteContent.hero, ...published?.hero },
    about: { ...siteContent.about, ...published?.about },
    services: { ...siteContent.services, ...published?.services, items: published?.services?.items ?? siteContent.services.items },
    projects: { ...siteContent.projects, ...published?.projects, items: published?.projects?.items ?? siteContent.projects.items },
    serviceArea: { ...siteContent.serviceArea, ...published?.serviceArea },
    quote: { ...siteContent.quote, ...published?.quote },
    contact: { ...siteContent.contact, ...published?.contact },
    footer: { ...siteContent.footer, ...published?.footer },
  };
}

function cityMap(city: string) {
  const normalizedCity = city.trim().replace(/\s+ve çevresi$/i, "") || "Tokat";
  const query = `${normalizedCity}, Türkiye`;
  return {
    link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
    embed: `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=12&output=embed`,
  };
}

async function PublishedHome() {
  await connection();
  const supabase = await createClient();
  const { data: publishedData } = await supabase.rpc("get_published_site_content");
  const content = mergeContent(publishedData ?? {});
  const map = cityMap(content.serviceArea.location);
  const heroTitle = content.hero.title.split(", ");
  const aboutTitle = content.about.title.split(", ");
  const quoteLines = content.quote.title.split(". ");
  const contactTitle = content.contact.title.split(" bir ");

  return (
    <main>
      <header className="navbar">
        <a href="#" className="brand">
          <span className="brand-name">{content.navbar.brand}</span>
          <span className="brand-sub">{content.navbar.subtitle}</span>
        </a>

        <nav className="nav-links">
          {content.navbar.links.map((link: { label: string; href: string }, index: number) => (
            <a href={link.href} key={`${link.href}-${index}`}>{link.label}</a>
          ))}
        </nav>

        <a href="#iletisim" className="nav-contact">
          {content.navbar.contactLabel} <span>↗</span>
        </a>
      </header>

      <section className="hero" id="anasayfa">
        <div className="hero-image" style={content.hero.image ? { backgroundImage: `url("${content.hero.image}")` } : undefined} />
        <div className="hero-overlay" />

        <div className="hero-content">
          <span className="eyebrow hero-eyebrow">
            {content.hero.eyebrow}
          </span>

          <h1>
            {heroTitle.length > 1 ? <>{heroTitle[0]},<br /><em>{heroTitle.slice(1).join(", ")}</em></> : content.hero.title}
          </h1>

          <p>
            {content.hero.description}
          </p>

          <div className="hero-actions">
            <a href="#projeler" className="button button-light">
              {content.hero.button1} <span>↗</span>
            </a>
            <a href="#iletisim" className="button button-outline">
              {content.hero.button2}
            </a>
          </div>
          {Array.isArray(content.hero.socialButtons) && content.hero.socialButtons.filter((button: { visible?: boolean; label?: string; href?: string }) => button.visible && button.label?.trim() && button.href?.trim()).length > 0 && (
            <div className="hero-social-actions">
              {content.hero.socialButtons.filter((button: { visible?: boolean; label?: string; href?: string }) => button.visible && button.label?.trim() && button.href?.trim()).map((button: { id: string; label: string; href: string }) => {
                let host = "";
                try { host = new URL(button.href).hostname.replace(/^www\./, "").toLowerCase(); } catch {}
                const brand = host.includes("instagram") ? "instagram" : host.includes("facebook") ? "facebook" : host.includes("youtube") || host.includes("youtu.be") ? "youtube" : host.includes("tiktok") ? "tiktok" : host.includes("linkedin") ? "linkedin" : host === "x.com" || host.includes("twitter") ? "x" : host.includes("pinterest") ? "pinterest" : "generic";
                return <a key={button.id} href={button.href} target="_blank" rel="noopener noreferrer" className={`hero-social-button hero-social-${brand}`}>{button.label}<span aria-hidden="true">↗</span></a>;
              })}
            </div>
          )}
        </div>

        <div className="hero-bottom">
          <span>{content.hero.bottomLeft}</span>
          <span>{content.hero.bottomRight}</span>
        </div>
      </section>

      <section className="intro section-padding" id="hakkimizda">
        <div className="intro-label">
          <span className="eyebrow">{content.about.eyebrow}</span>
          <span className="section-number">{content.about.sectionNumber}</span>
        </div>

        <div className="intro-content">
          <h2>
            {aboutTitle.length > 1 ? <>{aboutTitle[0]},<br /><em>{aboutTitle.slice(1).join(", ")}</em></> : content.about.title}
          </h2>
          <p>
            {content.about.description}
          </p>
          <a href="#iletisim" className="text-link">
            {content.about.linkLabel} <span>↗</span>
          </a>
        </div>
      </section>

      <section className="services section-padding" id="hizmetler">
        <div className="section-heading">
          <div>
            <span className="eyebrow">NELER YAPIYORUZ?</span>
            <h2>Yaşam alanınız için<br /><em>doğru dokunuş.</em></h2>
          </div>
          <a href="#iletisim" className="text-link">
            Tüm hizmetler <span>↗</span>
          </a>
        </div>

        <div className="service-grid">
          {content.services.items.map((service: { number: string; title: string; description: string; image: string }) => (
            <article className="service-card" key={service.number}>
              <div
                className="service-image"
                style={{ backgroundImage: `url(${service.image})` }}
              />
              <div className="service-info">
                <span className="service-number">{service.number}</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <a href="#iletisim" aria-label={`${service.title} hakkında iletişim`}>
                  ↗
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="projects section-padding" id="projeler">
        <div className="section-heading">
          <div>
            <span className="eyebrow">SEÇİLMİŞ İŞLER</span>
            <h2>Hayata geçirdiğimiz<br /><em>mekanlar.</em></h2>
          </div>
          <a href="#iletisim" className="text-link">
            Projelerinizi bize anlatın <span>↗</span>
          </a>
        </div>

        <div className="project-grid">
          {content.projects.items.map((project: { title: string; category: string; image: string }, index: number) => (
            <article className={`project-card project-${index + 1}`} key={project.title}>
              <div
                className="project-image"
                style={{ backgroundImage: `url(${project.image})` }}
              />
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

      <section className="service-area-section" id="hizmet-bolgelerimiz">
  <div className="service-area-container">
    <div className="service-area-content">
      <span className="eyebrow">{content.serviceArea.eyebrow}</span>
      <h2>{content.serviceArea.title}</h2>
      <p>
        {content.serviceArea.description}
      </p>
      <div className="service-area-location">
        <span className="location-icon">&#8982;</span>
        <div>
          <strong>{content.serviceArea.location}</strong>
          <span>{content.serviceArea.locationDescription}</span>
        </div>
      </div>
      <a
        href={map.link}
        target="_blank"
        rel="noopener noreferrer"
        className="service-area-button"
      >
        Google Haritalar&apos;da G&ouml;r&uuml;nt&uuml;le &#8599;
      </a>
    </div>
    <div className="service-area-map">
      <iframe
        src={map.embed}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        title="Ni&#351;anc&#305;lar Dekorasyon hizmet b&ouml;lgesi haritas&#305;"
      />
    </div>
  </div>
</section>
<section className="quote-section">
        <span className="eyebrow">{content.quote.eyebrow}</span>
        <h2>
          {quoteLines.length > 1 ? <>{quoteLines[0]}.<br /><em>{quoteLines.slice(1).join(". ")}</em></> : content.quote.title}
        </h2>
      </section>

      <section className="contact-section" id="iletisim" style={content.contact.image ? { backgroundImage: `linear-gradient(rgba(30, 29, 26, 0.76), rgba(30, 29, 26, 0.76)), url("${content.contact.image}")` } : undefined}>
        <div className="contact-content">
          <span className="eyebrow">{content.contact.eyebrow}</span>
          <h2>{contactTitle.length > 1 ? <>{contactTitle[0]}<br /><em>bir {contactTitle.slice(1).join(" bir ")}</em></> : content.contact.title}</h2>
          <p>{content.contact.description}</p>
          <div className="hero-actions" style={{ justifyContent: "center" }}>
            <a
              href="#musteri-talebi"
              className="button button-light"
            >
              Proje Talep Formu <span>↗</span>
            </a>
            <a
              href={content.contact.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-outline"
            >
              {content.contact.buttonLabel} <span>↗</span>
            </a>
          </div>
        </div>
      </section>

      <section className="customer-request-section" id="musteri-talebi">
        <div className="customer-request-heading">
          <span className="eyebrow">PROJENİZİ KONUŞALIM</span>
          <h2>Hayalinizdeki mekanı<br /><em>birlikte tasarlayalım.</em></h2>
          <p>
            Projenizle ilgili birkaç bilgi bırakın. Ekibimiz talebinizi
            inceleyip sizinle iletişime geçsin.
          </p>
        </div>
        <CustomerRequestForm
          requestTypes={(publishedData?.services?.items ?? [])
            .map((service: { title?: string }) => service.title?.trim())
            .filter((title: string | undefined): title is string => Boolean(title))}
        />
      </section>

      <footer className="footer">
        <a href="#" className="brand brand-footer">
          <span className="brand-name">{content.footer.brand}</span>
          <span className="brand-sub">{content.footer.subtitle}</span>
        </a>

        <span className="footer-copy">
          {content.footer.copyright}
        </span>

        <a href="#anasayfa" className="back-top">
          {content.footer.backTop}
        </a>
      </footer>
    </main>
  );
}







export default function Home() {
  return (
    <Suspense fallback={<main aria-busy="true" />}>
      <PublishedHome />
    </Suspense>
  );
}
