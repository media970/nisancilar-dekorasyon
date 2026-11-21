
export const siteContent = {
  navbar: {
    brand: "NİŞANCILAR",
    subtitle: "DEKORASYON & TASARIM",
    links: [
      { label: "Ana Sayfa", href: "#anasayfa" },
      { label: "Hizmetler", href: "#hizmetler" },
      { label: "Projeler", href: "#projeler" },
      { label: "Hizmet Bölgemiz", href: "#hizmet-bolgelerimiz" },
      { label: "Hakkımızda", href: "#hakkimizda" },
    ],
    contactLabel: "İletişime Geç",
    phone: "",
  },

  hero: {
    eyebrow: "TASARIM · UYGULAMA · DÖNÜŞÜM",
    title: "Mekanlara ruh, yaşamınıza değer.",
    description:
      "Hayalinizdeki yaşam alanlarını estetik, kaliteli işçilik ve zamansız tasarım anlayışıyla gerçeğe dönüştürüyoruz.",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2400&q=90",
    button1: "Projelerimizi Keşfedin",
    button2: "Projenizi Konuşalım",
    bottomLeft: "YAŞAM ALANLARINI YENİDEN TASARLIYORUZ",
    bottomRight: "SCROLL TO EXPLORE ↓",
socialButtons: [] as {
  id: string;
  label: string;
  href: string;
  visible: boolean;
}[],
  },

  about: {
    eyebrow: "NİŞANCILAR DEKORASYON",
    sectionNumber: "01 — HAKKIMIZDA",
    title: "Her mekanın bir hikayesi, her detayın bir anlamı vardır.",
    description:
      "Biz yalnızca mekanları yenilemiyoruz. İnsanların kendilerini iyi hissettikleri, hayatlarına dokunan ve yıllar boyunca değerini koruyan alanlar oluşturuyoruz. Tasarımdan uygulamaya her aşamada kaliteyi ve detayları önemsiyoruz.",
    linkLabel: "Bizi daha yakından tanıyın",
  },

  services: {
    eyebrow: "NELER YAPIYORUZ?",
    title: "Yaşam alanınız için doğru dokunuş.",
    linkLabel: "Tüm hizmetler",
    items: [
      {
        number: "01",
        title: "İç Mekan Tasarımı",
        description:
          "Estetik, konfor ve işlevselliği bir araya getiren yaşam alanları.",
        image:
          "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85",
      },
      {
        number: "02",
        title: "Anahtar Teslim Tadilat",
        description:
          "Bir mekanın dönüşümünü baştan sona özenle planlıyor ve uyguluyoruz.",
        image:
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85",
      },
      {
        number: "03",
        title: "Mutfak & Banyo",
        description:
          "Detayları düşünülmüş, modern ve zamansız mekan çözümleri.",
        image:
          "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=85",
      },
    ],
  },

  projects: {
    eyebrow: "SEÇİLMİŞ İŞLER",
    title: "Hayata geçirdiğimiz mekanlar.",
    linkLabel: "Projelerinizi bize anlatın",
    items: [
      {
        title: "Modern Yaşam",
        category: "KONUT TASARIMI",
        image:
          "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=90",
      },
      {
        title: "Doğal Dokular",
        category: "İÇ MEKAN UYGULAMA",
        image:
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=90",
      },
      {
        title: "Minimal Yaşam",
        category: "TADİLAT & DEKORASYON",
        image:
          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=90",
      },
    ],
  },

  serviceArea: {
    eyebrow: "HİZMET ALANIMIZ",
    title: "Yaşadığınız bölgeye değer katıyoruz.",
    description:
      "Dekorasyon, tadilat ve yaşam alanı yenileme projelerimizle hizmet bölgemizde hayalinizdeki mekanları gerçeğe dönüştürüyoruz.",
    location: "Tokat ve çevresi",
    locationDescription: "Hizmet bölgemiz hakkında bilgi alın.",
    mapLink:
      "https://www.google.com/maps/search/?api=1&query=Tokat%2C+T%C3%BCrkiye",
    mapEmbed:
      "https://maps.google.com/maps?q=Tokat%2C%20T%C3%BCrkiye&z=12&output=embed",
  },

  quote: {
    eyebrow: "TASARIM FELSEFEMİZ",
    title: "İyi tasarım yalnızca güzel görünmez. Güzel hissettirir.",
  },

  contact: {
    eyebrow: "HAYALİNİZDEKİ MEKANA İLK ADIM",
    title: "Birlikte güzel bir şeyler yapalım.",
    description:
      "Projenizi, fikirlerinizi ve hayallerinizi konuşmak için bize ulaşın.",
    whatsapp: "https://wa.me/",
    buttonLabel: "WhatsApp ile İletişim",
  },

  footer: {
    brand: "NİŞANCILAR",
    subtitle: "DEKORASYON & TASARIM",
    copyright: "© 2026 Nişancılar Dekorasyon. Tüm hakları saklıdır.",
    backTop: "BAŞA DÖN ↑",
  },
};
