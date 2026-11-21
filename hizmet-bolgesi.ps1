
$pageFile = ".\app\page.tsx"
$cssFile = ".\app\globals.css"

$page = Get-Content $pageFile -Raw -Encoding utf8

if (-not $page.Contains('id="hizmet-bolgelerimiz"')) {
    $marker = '<section className="quote-section">'

    if ($page.Contains($marker)) {
        $section = @'
<section className="service-area-section" id="hizmet-bolgelerimiz">
  <div className="service-area-container">
    <div className="service-area-content">
      <span className="eyebrow">HİZMET ALANIMIZ</span>
      <h2>Yaşadığınız bölgeye<br /><em>değer katıyoruz.</em></h2>
      <p>
        Dekorasyon, tadilat ve yaşam alanı yenileme projelerimizle
        hizmet bölgemizde hayalinizdeki mekânları gerçeğe dönüştürüyoruz.
      </p>
      <div className="service-area-location">
        <span className="location-icon">⌖</span>
        <div>
          <strong>Tokat ve çevresi</strong>
          <span>Hizmet bölgemiz hakkında bilgi alın.</span>
        </div>
      </div>
      <a
        href="https://www.google.com/maps/search/?api=1&query=Tokat%2C+T%C3%BCrkiye"
        target="_blank"
        rel="noopener noreferrer"
        className="service-area-button"
      >
        Google Haritalar'da Görüntüle ↗
      </a>
    </div>
    <div className="service-area-map">
      <iframe
        src="https://maps.google.com/maps?q=Tokat%2C%20T%C3%BCrkiye&z=12&output=embed"
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

'@

        $page = $page.Replace($marker, $section + $marker)
        Set-Content $pageFile $page -Encoding utf8
        Write-Host "Hizmet bölgesi JSX eklendi." -ForegroundColor Green
    }
    else {
        Write-Host "Quote bölümü bulunamadı. JSX eklenmedi." -ForegroundColor Red
    }
}
else {
    Write-Host "Hizmet bölgesi JSX zaten mevcut." -ForegroundColor Yellow
}

$css = Get-Content $cssFile -Raw -Encoding utf8

if (-not $css.Contains("/* HİZMET BÖLGELERİ */")) {
    $styles = @'

/* HİZMET BÖLGELERİ */
.service-area-section {
  padding: 120px 7%;
  background: #f4f2ed;
}

.service-area-container {
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  gap: 70px;
  align-items: center;
  max-width: 1500px;
  margin: 0 auto;
}

.service-area-content {
  max-width: 520px;
}

.service-area-content h2 {
  font-size: clamp(36px, 4vw, 58px);
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: -1.8px;
  margin: 20px 0 25px;
}

.service-area-content h2 em {
  color: #a58c6c;
}

.service-area-content > p {
  color: #77766f;
  line-height: 1.9;
  font-size: 15px;
  margin-bottom: 35px;
}

.service-area-location {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 30px;
}

.location-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border: 1px solid #d8d2c8;
  color: #a58c6c;
  font-size: 23px;
  flex-shrink: 0;
}

.service-area-location div {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.service-area-location strong {
  font-size: 14px;
  font-weight: 500;
}

.service-area-location div span {
  color: #77766f;
  font-size: 12px;
}

.service-area-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
  background: #22231f;
  color: #f4f2ed;
  text-decoration: none;
  font-size: 12px;
  transition: background 0.3s ease;
}

.service-area-button:hover {
  background: #a58c6c;
}

.service-area-map {
  width: 100%;
  height: 480px;
  overflow: hidden;
  background: #e6e1d9;
}

.service-area-map iframe {
  display: block;
}

@media (max-width: 1000px) {
  .service-area-container {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .service-area-content {
    max-width: 700px;
  }

  .service-area-map {
    height: 400px;
  }
}

@media (max-width: 700px) {
  .service-area-section {
    padding: 80px 6%;
  }

  .service-area-content h2 {
    font-size: 38px;
  }

  .service-area-map {
    height: 320px;
  }
}
'@

    Add-Content $cssFile $styles -Encoding utf8
    Write-Host "Hizmet bölgesi CSS eklendi." -ForegroundColor Green
}
else {
    Write-Host "Hizmet bölgesi CSS zaten mevcut." -ForegroundColor Yellow
}

Write-Host "İşlem tamamlandı." -ForegroundColor Cyan
