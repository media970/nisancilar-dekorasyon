
$file = ".\app\page.tsx"
$content = Get-Content $file -Raw -Encoding utf8

$pattern = '(?s)<section className="service-area-section".*?</section>\s*(?=<section className="quote-section">)'

$replacement = @'
<section className="service-area-section" id="hizmet-bolgelerimiz">
  <div className="service-area-container">
    <div className="service-area-content">
      <span className="eyebrow">H&#304;ZMET ALANIMIZ</span>
      <h2>Ya&#351;ad&#305;&#287;&#305;n&#305;z<br /><em>b&ouml;lgeye de&#287;er kat&#305;yoruz.</em></h2>
      <p>
        Dekorasyon, tadilat ve ya&#351;am alan&#305; yenileme projelerimizle hizmet
        b&ouml;lgemizde hayalinizdeki mek&acirc;nlar&#305; ger&ccedil;e&#287;e
        d&ouml;n&uuml;&#351;t&uuml;r&uuml;yoruz.
      </p>
      <div className="service-area-location">
        <span className="location-icon">&#8982;</span>
        <div>
          <strong>Tokat ve &ccedil;evresi</strong>
          <span>Hizmet b&ouml;lgemiz hakk&#305;nda bilgi al&#305;n.</span>
        </div>
      </div>
      <a
        href="https://www.google.com/maps/search/?api=1&query=Tokat%2C+T%C3%BCrkiye"
        target="_blank"
        rel="noopener noreferrer"
        className="service-area-button"
      >
        Google Haritalar&apos;da G&ouml;r&uuml;nt&uuml;le &#8599;
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
        title="Ni&#351;anc&#305;lar Dekorasyon hizmet b&ouml;lgesi haritas&#305;"
      />
    </div>
  </div>
</section>

'@

if ($content -match $pattern) {
    $content = [regex]::Replace($content, $pattern, $replacement, 1)
    Set-Content $file $content -Encoding utf8
    Write-Host "Hizmet bolgesi metinleri yenilendi." -ForegroundColor Green
}
else {
    Write-Host "Bolum bulunamadi, dosya degistirilmedi." -ForegroundColor Red
}
