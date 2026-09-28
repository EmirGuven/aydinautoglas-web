# PROJE: Dinamik, Çoklu Sektöre Uyarlanabilir Kurumsal Web Sitesi + Admin Paneli
(İlk kullanım: Oto cam firması / Autoglas-Service)

## 0. ÇALIŞMA ŞEKLİN
- Kodlamaya başlamadan önce bu dokümanı oku, bir uygulama planı çıkar (fazlar, dosya yapısı, veri modeli) ve bana onaylat.
- İşi aşağıdaki FAZLAR halinde yap. Her fazın sonunda: çalışır durumda olsun, `pnpm lint && pnpm typecheck && pnpm test` geçsin, anlamlı bir git commit at ve bana kısa bir özet ver.
- Belirsiz bir nokta olursa varsayım yapıp devam etme; önce bana sor.
- Tüm kod TypeScript (strict). Kod, değişken ve commit mesajları İngilizce; kullanıcıya görünen metinler i18n dosyalarında/veritabanında.

## 1. HEDEF
Bir oto cam firması için hızlı, SEO dostu, tamamen mobil uyumlu bir kurumsal web sitesi. Sitedeki HER içerik (metinler, görseller, menüler, sayfalar, renkler, logo, iletişim bilgileri, SEO alanları) admin panelden yönetilebilir olmalı. Kod içinde hardcoded içerik OLMAYACAK.
Sistem jenerik tasarlanmalı: Aynı kod tabanı, admin panelden sektör şablonu ve tema değiştirilerek başka sektörler (ör. diş kliniği, oto servis, temizlik firması) için de kullanılabilmeli. Firma Almanya'da hizmet veriyor. Site başlangıçta 3 dilde yayında olacak: Almanca (varsayılan), İngilizce, Türkçe. Yasal gereklilikler Almanya'ya göre (DSGVO, Impressum, TTDSG cookie kuralları).

Referans (sadece esinlenme, birebir kopya DEĞİL): https://carglass.de, https://www.junited-autoglas.de
Admin panel görsel referansı: Metronic Tailwind Demo1 (https://keenthemes.com/metronic/tailwind/demo1/). Metronic ücretli bir temadır, kodunu KOPYALAMA. Sadece görsel dilini (sol sidebar, üst bar, kart yapıları, tablolar, spacing) referans alarak Tailwind ile kendi bileşenlerini yaz.

## 2. TEKNOLOJİ YIĞINI
- Nuxt 4 (SSR) + Vue 3 + TypeScript, Nitro server routes (ayrı backend yok)
- Tailwind CSS v4 (tema değişkenleri CSS custom properties ile, runtime'da DB'den gelir)
- PostgreSQL 17 + Drizzle ORM (migration'lar `drizzle-kit` ile, `pg` driver)
- Doğrulama: Zod (hem API input'ları hem formlar için ortak şemalar `shared/` altında)
- Auth: `jose` ile JWT (HS256, `ADMIN_JWT_SECRET`), httpOnly + Secure + SameSite=Lax cookie, 8 saat geçerli. Şifreler argon2 ile hashlenir.
- Görseller: `sharp` ile yüklemede otomatik WebP'ye çevirme + birkaç boyut (thumb/medium/large)
- i18n: `@nuxtjs/i18n` + DB tabanlı çeviri sistemi (detaylar Bölüm 14'te)
- Rich text editör (admin): TipTap
- Paket yöneticisi: pnpm. Test: Vitest (+ kritik akışlar için Playwright)
- Ağır UI kütüphanesi KULLANMA. İkonlar için tree-shake edilebilen bir set (ör. `@iconify` / lucide) kullan.

## 3. MİMARİ VE KLASÖR YAPISI (öneri, gerekirse iyileştir)
app/
  pages/            -> public sayfalar + /admin/** sayfaları
  components/
    blocks/         -> page builder blokları (her blok = 1 bileşen + 1 zod şeması)
    admin/          -> admin UI kit (DataTable, FormField, Modal, Sidebar, MediaPicker...)
    ui/             -> public UI kit
  layouts/          -> default, admin, auth
  composables/
server/
  api/              -> public GET endpoint'leri
  api/admin/        -> JWT korumalı CRUD endpoint'leri
  middleware/       -> admin-auth.ts, rate-limit
  routes/uploads/[...path].get.ts -> dosya servis (path traversal korumalı)
  db/schema/        -> Drizzle şemaları
  db/migrations/
  db/seed/          -> sektör şablonları (autoglass.ts, dental.ts, ...)
  services/         -> iş mantığı (route'lar ince kalsın)
  utils/
shared/             -> ortak tipler + zod şemaları
docs/               -> AI ve geliştirici dokümanları (bkz. Bölüm 11)

Kurallar: API route'ları ince, iş mantığı `server/services/` içinde. Her admin endpoint'i Zod ile input doğrular. Public GET endpoint'leri cache'lenir (Nitro `defineCachedEventHandler` veya route rules). İçerik güncellenince ilgili cache invalidate edilir.

## 4. VERİ MODELİ (minimum)
- users (admin kullanıcıları; roller: owner, admin, editor)
- site_settings (firma adı, logo, favicon, iletişim, sosyal medya, çalışma saatleri, analytics ID'leri, aktif sektör şablonu)
- theme (renk paleti, fontlar, border-radius, buton stili; CSS değişkenlerine dönüşür)
- languages (aktif diller, varsayılan dil)
- pages (slug, başlık, SEO alanları, durum: draft/published, çok dilli) + page_blocks (sıralı, tip + JSON veri)
- menus / menu_items (header, footer, iç içe menü desteği)
- services (hizmetler: başlık, kısa açıklama, içerik, ikon/görsel, sıra, öne çıkan)
- locations / branches (şube: adres, koordinat, telefon, çalışma saatleri, harita)
- blog_posts, blog_categories
- faqs, faq_categories
- testimonials (müşteri yorumları)
- partners (sigorta şirketleri / marka logoları)
- appointments (randevu/teklif talepleri, durum: new/contacted/scheduled/done/cancelled, admin notları)
- contact_messages
- media (yüklenen dosyalar, alt text, boyutlar)
- redirects (301 yönetimi)
- audit_log (kim, ne zaman, neyi değiştirdi)
Çok dilli alanlar için tutarlı bir yaklaşım seç (ör. `*_translations` tabloları veya JSONB `{de, tr, en}`) ve gerekçesini `docs/decisions.md` dosyasına yaz.

## 5. PUBLIC SİTE
Tüm sayfalar blok tabanlı page builder ile oluşturulur. Başlangıç blok tipleri:
Hero (görsel/video arka plan + CTA), Hizmet kartları grid, "Nasıl çalışır" adımları, Hasar kontrolü sihirbazı (aşağıda), Neden biz / özellikler, İstatistik sayaçları, Müşteri yorumları slider, Partner/sigorta logoları, Şube bulucu (harita + liste), SSS akordeon, Blog önizleme, CTA bandı, Zengin metin, Görsel+metin, Galeri, İletişim formu.

Sayfalar (hepsi admin panelden düzenlenebilir, yenileri eklenebilir):
Anasayfa, Hizmetler (liste + detay), Hakkımızda, Şubeler (liste + detay), Blog (liste + kategori + detay), SSS, İletişim, Randevu Al, Yasal sayfalar (Impressum, Datenschutz, AGB, Cookie-Richtlinie).

Oto cam sektörüne özel (ama jenerik bloklar olarak yazılmış):
- **Hasar kontrolü sihirbazı:** Kullanıcı hasar tipini/boyutunu seçer ("taş izi 2 € madeni paradan küçük mü?", "görüş alanında mı?"). Sonuca göre "Onarım" veya "Değişim" önerir ve randevu formuna yönlendirir. Sorular, seçenekler ve sonuç kuralları admin panelden tanımlanabilir. Böylece başka sektörlerde "ihtiyaç analizi sihirbazı" olarak kullanılabilir.
- **Çok adımlı randevu formu:** Araç (marka/model/yıl, plaka opsiyonel), hizmet, şube, tarih/saat tercihi, sigorta bilgisi (opsiyonel), iletişim bilgileri, KVKK/DSGVO onayı. Form alanları admin panelden yapılandırılabilir.
- Sabit mobil CTA barı (Ara / Randevu Al / WhatsApp). Butonlar admin panelden açılıp kapatılabilir.

Tasarım: Modern, güven veren, temiz; bol beyaz alan, net CTA'lar. Mobile-first yaz. Breakpoint'lerde (360, 768, 1024, 1280+) test et. Dokunma hedefleri en az 44px olsun. Menüler mobilde erişilebilir off-canvas olarak çalışsın.

## 6. SEKTÖR ŞABLONU & TEMA SİSTEMİ
- Tema: Admin panelden renkler (primary, secondary, accent, arka plan, metin), font ailesi, köşe yuvarlaklığı ve buton stili canlı önizlemeyle değiştirilebilir. Bu değerler SSR'da `<style>:root{...}</style>` olarak basılır (FOUC olmasın).
- Sektör şablonu: `server/db/seed/templates/*.ts` altında her sektör için bir preset bulunur (tema + menüler + sayfalar + bloklar + örnek hizmetler + SSS). Admin panelde "Şablon uygula" ekranı olur: önizleme gösterir, onay ister ve mevcut içeriği yedekler.
- En az 2 şablon hazırla: `autoglass` (DE, EN ve TR dillerinde tam içerikli) ve `generic-service` (jenerik hizmet firması iskeleti, 3 dilde).
- Yeni blok tipi veya yeni şablon eklemenin adımlarını `docs/` altında belgele.


## 7. ADMIN PANELİ (/admin)
Metronic Demo1 tarzı layout: daraltılabilir sol sidebar, üst bar (arama, dil, profil), breadcrumb, kart tabanlı içerik. Admin paneli de tam responsive olacak; mobilde sidebar drawer'a dönüşür. Açık/koyu mod desteği olsun.

Modüller:
- Dashboard: son randevular, okunmamış mesajlar, hızlı istatistikler
- Sayfalar: listele/oluştur/düzenle, blokları sürükle-bırak ile sırala, blok ekle/çıkar, taslak/yayın, önizleme
- Hizmetler, Şubeler, Blog (+kategoriler), SSS, Yorumlar, Partnerler: CRUD, sürükle-bırak sıralama
- Menü yöneticisi (header/footer, iç içe)
- Medya kütüphanesi: yükle, alt text düzenle, ara, sil (kullanımdaysa uyar). Tüm görsel alanları MediaPicker ile seçilir.
- Randevular & mesajlar: liste, filtre, durum değiştirme, not ekleme, CSV export
- Hasar sihirbazı / form yapılandırıcı
- Görünüm: tema editörü + sektör şablonları
- Ayarlar: genel, iletişim, sosyal medya, SEO varsayılanları, diller, e-posta (SMTP), cookie banner metinleri, analytics
- Yönlendirmeler (301)
- Kullanıcılar & roller, audit log
Ortak bileşenler: DataTable (sayfalama, arama, sıralama, toplu işlem), form bileşenleri, toast bildirimleri, onay modalı, kaydedilmemiş değişiklik uyarısı.

## 8. SEO & PERFORMANS
- Her sayfa ve içerik için meta title/description, OG görseli, canonical, noindex seçeneği
- Otomatik sitemap.xml (çok dilli, hreflang dahil) ve robots.txt
- JSON-LD: LocalBusiness / AutoRepair (her şube için), Service, FAQPage, BlogPosting, BreadcrumbList
- Görseller: WebP, `srcset`, lazy load, width/height belirtilmiş (CLS olmasın). Hero görseli preload edilsin.
- Fontlar self-host edilsin (DSGVO: Google Fonts CDN KULLANMA)
- Hedef: mobil Lighthouse Performance, SEO, Accessibility ve Best Practices ≥ 90; public sayfalarda minimum JS
- Harita: kullanıcı cookie onayı verene kadar yüklenmesin (statik önizleme + "Haritayı yükle" butonu)

## 9. GÜVENLİK & YASAL
- Tüm `/api/admin/**` route'ları middleware ile korunur. Rol bazlı yetki kontrolü servis katmanında yapılır.
- Login endpoint'inde ve public formlarda rate limit + honeypot (opsiyonel Cloudflare Turnstile, admin'den açılıp kapatılabilir)
- Upload: yalnızca jpg/png/webp/gif/svg, max 5MB, MIME türü magic bytes ile doğrulanır, rastgele dosya adı kullanılır. SVG'ler sanitize edilir (XSS riski).
- Uploads servis route'unda path traversal koruması olsun
- Rich text çıktısı sanitize edilir
- Güvenlik başlıkları (CSP, HSTS, X-Frame-Options vb.)
- DSGVO uyumlu cookie consent: kategoriler + onay kaydı; analytics yalnızca onaydan sonra yüklenir
- Form gönderimlerinde admin'e e-posta bildirimi, müşteriye onay e-postası (şablonlar admin'den düzenlenebilir)
- `.env.example` hazırla; hiçbir secret repoya girmesin

## 10. DEPLOYMENT (Hetzner, Docker)
- Multi-stage Dockerfile (node:22-alpine, production'da sadece `.output`)
- docker-compose.yml: `app`, `postgres:17` (volume ile), `uploads` volume. Reverse proxy ve otomatik HTTPS için Caddy servisi opsiyonel olarak eklensin.
- Container başlarken migration'lar otomatik çalışsın. Seed ayrı bir komutla çalışsın (`pnpm db:seed --template=autoglass`).
- İlk admin kullanıcı CLI komutu ile oluşturulsun (`pnpm admin:create`)
- Günlük PostgreSQL + uploads yedekleme scripti ve yedekten geri dönme talimatı yazılsın
- Health check endpoint'i (`/api/health`)
- `docs/deployment.md`: sıfırdan Hetzner kurulumu adım adım

## 11. AI İÇİN TALİMATLAR (projenin geliştirilebilirliği)
Projeye şunları ekle ve her fazda güncel tut:
- `CLAUDE.md` (kökte): proje özeti, komutlar, mimari kurallar, kod stili, "yapılmaması gerekenler" listesi, sık yapılan işlerin tarifleri
- `docs/architecture.md`: katmanlar, veri akışı, cache stratejisi
- `docs/decisions.md`: önemli teknik kararlar ve gerekçeleri (ADR formatında kısa notlar)
- `docs/how-to/`: yeni blok tipi ekleme, yeni sektör şablonu ekleme, yeni admin modülü ekleme, yeni dil ekleme
Kod içinde karmaşık yerlere kısa ve anlamlı yorumlar yaz; gereksiz yorum yazma.

## 12. FAZLAR
1. Proje iskeleti, Docker (dev + prod), DB şeması, migration'lar, `CLAUDE.md`
2. Auth + admin layout + admin UI kit + kullanıcı yönetimi
3. Ayarlar, tema sistemi, medya kütüphanesi, menüler
4. Page builder (blok altyapısı + tüm bloklar) + public layout + dinamik sayfa render
5. İçerik modülleri: hizmetler, şubeler, blog, SSS, yorumlar, partnerler
6. Randevu formu, hasar sihirbazı, iletişim, e-posta bildirimleri
7. i18n, SEO (sitemap, JSON-LD, redirects), cookie consent
8. Sektör şablonları + seed (autoglass tam içerikli)
9. Performans ve erişilebilirlik iyileştirmeleri, testler, güvenlik gözden geçirmesi
10. Production deployment dokümanı, yedekleme scriptleri, son kontrol listesi

## 13. KABUL KRİTERLERİ
- `docker compose up` ile sıfırdan ayağa kalkıyor. Seed sonrası site oto cam firması olarak eksiksiz görünüyor.
- Kodda kullanıcıya görünen hardcoded içerik yok; her şey admin panelden değiştirilebiliyor.
- `generic-service` şablonu uygulanınca site tamamen farklı bir sektöre dönüşüyor.
- Public site ve admin panel 360px genişlikte sorunsuz çalışıyor.
- Mobil Lighthouse skorları ≥ 90
- Admin API'leri token olmadan 401 dönüyor. Upload ve form güvenlik testleri geçiyor.
- Seed sonrası site DE, EN ve TR dillerinde eksiksiz; dil değiştirici aynı sayfanın karşılığına gidiyor.
- Admin panelden 4. bir dil eklenip içerik girildiğinde, deploy olmadan yayına alınabiliyor.
- Google Rich Results Test ve Schema.org validator'da tüm sayfa tipleri hatasız.
- `/llms.txt`, `/sitemap.xml` ve `/robots.txt` DB'den doğru üretiliyor; admin'deki bot ayarları robots.txt'ye yansıyor.
- JS devre dışıyken tüm public sayfaların içeriği tam okunabiliyor.

## 14. ÇOKLU DİL (i18n)
Başlangıç dilleri: `de` (varsayılan), `en`, `tr`. Sistem N dile genişleyebilir olmalı; yeni dil eklemek KOD DEĞİŞİKLİĞİ GEREKTİRMEMELİ.

URL yapısı:
- Strateji: `prefix_except_default` → `/leistungen/scheibenreparatur`, `/en/services/windshield-repair`, `/tr/hizmetler/cam-onarimi`
- Slug'lar her dil için ayrı ve admin panelden düzenlenebilir. Dil değiştirici, kullanıcıyı aynı içeriğin diğer dildeki karşılığına götürür (anasayfaya değil).
- Her sayfada `hreflang` (x-default = de), dile özel canonical ve `<html lang>` doğru basılır. Sitemap tüm dilleri içerir.
- İlk ziyarette tarayıcı diline göre öneri banner'ı gösterilir. Zorla yönlendirme YAPILMAZ (SEO için).

İçerik çevirisi:
- Tüm çevrilebilir içerikler (sayfalar, bloklar, hizmetler, blog, SSS, menüler, SEO alanları, form etiketleri, sihirbaz soruları, e-posta şablonları, cookie banner metinleri) her dil için ayrı tutulur.
- Bir çeviri eksikse varsayılan dile (de) fallback yapılır. Admin panelde eksik çeviriler uyarı ile gösterilir.
- Blog yazıları gibi içerikler dil bazında yayınlanabilir (ör. yazı sadece DE'de yayında olabilir).

Arayüz metinleri (butonlar, form hataları, "Mehr erfahren" vb.):
- Kod içindeki locale dosyaları sadece varsayılan/fallback değerlerdir. Gerçek değerler DB'de tutulur ve admin panelde "Çeviriler" ekranından (anahtar bazlı, aranabilir, dil sütunlu tablo) düzenlenir.
- Admin panelden yeni dil eklenince (kod, ad, bayrak, yön, aktif/pasif) tüm modüllerde o dilin sekmesi otomatik görünür.

Admin panel:
- Her çevrilebilir alanda dil sekmeleri (DE | EN | TR) ve her dil için doluluk göstergesi bulunur.
- İsteğe bağlı "diğer dillerden kopyala" butonu olur. AI çeviri entegrasyonu için bir interface/servis katmanı hazırla, ama implementasyonu şimdilik boş bırak.
- Admin panelin kendi arayüzü de çok dilli (TR, DE, EN) olsun. Her admin kullanıcısı kendi panel dilini seçer.

Formatlar:
- Tarih, saat, sayı ve para birimi `Intl` ile dile göre formatlanır (para birimi EUR, saat dilimi Europe/Berlin).
- Randevu talebine kullanıcının dili kaydedilir. Müşteriye giden onay e-postası o dilde gönderilir.

## 15. SEO, LOKAL SEO ve GEO (Generative Engine Optimization)
Amaç: Site hem Google'da (özellikle "Scheibenreparatur + şehir" gibi lokal aramalarda) hem de yapay zeka arama motorlarında (Google AI Overviews, ChatGPT, Perplexity, Claude, Gemini) üst sıralarda görünsün ve kaynak olarak gösterilsin.

### 15.1 Teknik SEO
- Tüm public içerik SSR ile render edilir. JS kapalıyken de içerik okunabilir olmalı (hem Google hem AI botları için kritik).
- Semantik HTML: sayfa başına tek H1, mantıklı H2/H3 hiyerarşisi, `<main>`, `<article>`, `<nav>`, `<time>` gibi doğru etiketler
- Temiz URL'ler, trailing slash tutarlılığı, küçük harf. Slug değişince otomatik 301 oluşturulur.
- Sitemap index: içerik tipine göre ayrı sitemap'ler (pages, services, locations, blog), doğru `lastmod`, çok dilli
- robots.txt DB'den üretilir ve admin panelden düzenlenebilir. Admin, teşekkür sayfaları ve arama sonuçları noindex olur.
- Özel 404 sayfası. 404 alan URL'ler loglanır ve admin panelde listelenir, tek tıkla 301 yönlendirmesi oluşturulabilir.
- Dahili linkleme: hizmet sayfalarında ilgili hizmetler ve şubeler, blog yazılarında ilgili yazılar ve hizmetler otomatik önerilir; admin panelden manuel de seçilebilir.
- Görsel SEO: alt text zorunlu uyarısı, anlamlı dosya adları (yüklemede slug'dan üretilir), görsel sitemap
- İçerik yayınlanınca/güncellenince IndexNow ile Bing/Yandex'e bildirim gönderilir (admin'den açılıp kapatılabilir).
- Google Search Console ve Bing Webmaster doğrulama kodları ayarlardan girilir.

### 15.2 Yapısal Veri (JSON-LD)
- Organization (logo, sameAs ile sosyal medya profilleri) + WebSite
- Her şube için ayrı `AutoRepair` (LocalBusiness alt tipi): adres, koordinat, telefon, çalışma saatleri (tatil/özel günler dahil), hizmet bölgesi (`areaServed`)
- Service (her hizmet için; sağlayıcı ve bölge bağlantılı), FAQPage, BlogPosting (yazar, yayın ve güncelleme tarihi), BreadcrumbList
- Şema tipi sektör şablonuna göre değişebilir olmalı (ör. diş kliniği için `Dentist`). Tip admin panelden seçilir.
- Firmanın kendi sitesindeki müşteri yorumlarını LocalBusiness için `AggregateRating` olarak işaretleme (Google politikası: self-serving review). Bunu `docs/decisions.md` dosyasına not et.
- Üretilen şemalar build/test aşamasında doğrulanır (schema testleri yaz).

### 15.3 Lokal SEO
- NAP tutarlılığı: firma adı, adres ve telefon tek bir kaynaktan (site_settings / locations) gelir; sitenin her yerinde birebir aynı basılır.
- Her şubenin kendi landing sayfası olur (`/standorte/berlin-mitte`): benzersiz açıklama, ekip/fotoğraflar, yol tarifi, çalışma saatleri, o şubeye özel SSS ve yorumlar, Google Business Profile linki.
- Şehir × hizmet sayfaları (ör. "Steinschlagreparatur in Berlin"): admin panelden oluşturulabilir. Doorway page cezası riskine karşı her sayfa benzersiz içerik gerektirir. Admin panel, içeriği diğer sayfalara çok benzeyen sayfalar için uyarı verir (basit benzerlik kontrolü).
- Hizmet verilen bölgeler (şehirler/posta kodları) şube bazında tanımlanabilir.

### 15.4 GEO: Yapay Zeka Aramaları için Optimizasyon
- `/llms.txt` ve `/llms-full.txt` otomatik üretilir (site özeti, ana hizmetler, şubeler, önemli sayfaların linkleri ve kısa açıklamaları). Her dil için ayrı versiyon olur; içerik değişince güncellenir.
- AI crawler yönetimi: admin panelde bot bazında izin ver/engelle anahtarları (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, PerplexityBot, Google-Extended, Applebot-Extended vb.). Seçimler robots.txt'ye yansır. Varsayılan: arama botlarına izin ver.
- İçerik yapısı AI'ın alıntılayabileceği şekilde olur:
  - Her sayfa ve hizmet için admin'de "Kısa cevap / özet" alanı olur (2-3 cümlelik, soruyu doğrudan yanıtlayan metin). Sayfanın üstünde gösterilir.
  - Soru formatında başlıklar ("Wie lange dauert ein Scheibentausch?") ve hemen altında net cevap
  - Somut bilgiler yapılandırılmış alanlarda tutulur: ortalama işlem süresi, fiyat aralığı ("ab ... €"), garanti süresi, sigorta ile ödeme koşulları. Bunlar hem sayfada hem şemada kullanılır.
  - Karşılaştırmalar için tablo bloğu (ör. onarım vs değişim)
- E-E-A-T sinyalleri: yazar profilleri (ad, uzmanlık, fotoğraf), blog yazılarında yazar ve "son güncelleme" tarihi görünür olur. Sertifika/ödül/üyelik bloğu (ör. ADAS kalibrasyon sertifikaları) ve Hakkımızda sayfasında firma bilgileri bulunur.
- Entity tutarlılığı: Organization şemasında `sameAs` ile Google Business, sosyal medya ve sektör dizinleri bağlanır. Firma adı her yerde aynı yazılır.
- İsteğe bağlı: her içerik sayfasının temiz Markdown versiyonu (`/page-slug.md` veya `Accept: text/markdown`). Admin'den açılıp kapatılabilir.

### 15.5 Admin Panel SEO Araçları
- Her içerik için SEO paneli: meta title/description (karakter sayacı + piksel genişliği uyarısı), Google arama sonucu önizlemesi (masaüstü/mobil), OG/sosyal medya önizlemesi, odak anahtar kelime, noindex/nofollow, canonical override
- SEO kontrol listesi skoru (her dil için ayrı): başlık uzunluğu, açıklama, H1 varlığı, anahtar kelime kullanımı, alt text'ler, dahili link sayısı, kısa özet alanı dolu mu, çeviri eksik mi
- Site geneli SEO raporu ekranı: meta'sı eksik sayfalar, alt text'i eksik görseller, kırık dahili linkler, 404 logları, duplicate title/description'lar
- Toplu SEO editörü: tüm sayfaların title/description alanlarını tek tabloda düzenleme

Bu bölüm için `docs/how-to/seo-geo.md` yaz: yeni içerik girerken editörün dikkat etmesi gerekenler (içerik yazım rehberi), yeni şema tipi ekleme ve llms.txt üretim mantığı.

## 16. ADMIN PANEL TEMASI (Metronic / KTUI)
Kaynaklar ve lisans:
- Layout iskeleti: https://github.com/keenthemes/metronic-tailwind-html-integration (MIT). Repoyu klonla, özellikle `metronic-tailwind-vue` (Header, Sidebar, Footer, SearchModal ve KTUI entegrasyon deseni) ile `metronic-tailwind-django/templates/demo1/partials/` (Demo1 sidebar, header, topbar markup'ı) klasörlerini incele. Admin layout'unu bunlardan uyarlayarak Vue/Nuxt bileşenlerine çevir.
- Bileşenler: `@keenthemes/ktui` npm paketi (MIT). Önce KTUI dokümantasyonuna (https://ktui.io) bak ve hangi bileşenlerin mevcut olduğunu listele. Mevcut olanları kullan; olmayanları (ör. sürükle-bırak sıralama, rich text editör sarmalayıcısı) aynı tasarım diliyle kendin yaz.
- YAPMA: Ücretli Metronic paketinin dosyalarını ekleme; keenthemes.com demo sitesinden HTML, CSS, görsel veya ikon kopyalama. Repo içindeki her varlığın (ör. keenicons, görseller) lisansını kontrol et. Lisansı net olmayanları kullanma, yerine lucide/iconify kullan.
- Kullanılan MIT lisanslı kaynakların telif ve lisans metinlerini `THIRD_PARTY_LICENSES.md` dosyasına ekle.

Nuxt entegrasyonu:
- KTUI vanilla JS ile DOM üzerinde çalışır. Bu yüzden admin panel için `routeRules: { '/admin/**': { ssr: false } }` kullan (admin SEO gerektirmez, entegrasyon basitleşir).
- KTUI'yi sadece admin layout'unda yükle (lazy import) ki public sitenin JS paketine hiç girmesin. KTUI bileşenlerini mount'ta ve her route değişiminde başlat, unmount'ta temizle (Vue iskeletindeki deseni referans al). Bu mantığı tek bir composable/plugin içinde topla.
- KTUI'yi doğrudan sayfalarda kullanma. `components/admin/` altında kendi sarmalayıcı bileşenlerini yaz (AdminModal, AdminDropdown, AdminDrawer, AdminTabs, AdminToast, AdminDataTable...). İleride KTUI çıkarılmak istenirse sadece bu katman değişsin.
- Açık/koyu mod ve renkler KTUI'nin CSS değişkenleri üzerinden yönetilsin. Admin paneli, public sitenin tema ayarlarından BAĞIMSIZ kendi temasını kullanır.

Görünüm hedefi: Demo1 düzeni (daraltılabilir sol sidebar, üst bar, breadcrumb, kart tabanlı içerik, temiz tablolar). Mobilde sidebar drawer'a dönüşür.