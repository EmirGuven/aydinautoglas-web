/**
 * Autoglass sector template — full DE/EN/TR seed content for a German auto-glass
 * repair & replacement company. Placeholder business identity ("Aydin Autoglas") and
 * contact details throughout — every field is admin-editable after seeding, so replacing
 * them with a real company's actual details is a content edit, not a code change.
 *
 * Partner logos are intentionally NOT seeded: `partners.logoMediaId` is a required media
 * reference and a seed script has no image to upload — an admin adds real partner/insurer
 * logos via Media + the Partners module once the site is live.
 */
import { setTheme } from '../../../services/theme.service'
import { createMenuItem } from '../../../services/menus.service'
import { createPage, createBlock, updatePage } from '../../../services/pages.service'
import { createService } from '../../../services/services.service'
import { createLocation } from '../../../services/locations.service'
import { createFaq, createFaqCategory } from '../../../services/faqs.service'
import { createTestimonial } from '../../../services/testimonials.service'
import { createQuestion, createOption, createRule } from '../../../services/damage-wizard.service'
import { createBlogCategory, createBlogPost } from '../../../services/blog.service'
import { setSetting } from '../../../services/site-settings.service'
import type { Block } from '../../../../shared/schemas/blocks'

export async function seedAutoglassTemplate(): Promise<void> {
  console.log('[seed] autoglass: theme, settings...')
  // "Werkstatt Präzision" direction — see docs/design/directions/direction-1-werkstatt-praezision.html
  // and docs/design-system.md for the full rationale and WCAG contrast figures.
  await setTheme({
    colorPrimary: '#1E3A5F',
    colorSecondary: '#23282D',
    colorAccent: '#FFB020',
    colorBackground: '#F4F6F8',
    colorText: '#1A1F24',
    colorSurface: '#FFFFFF',
    colorBorder: '#D7DCE1',
    colorMuted: '#5B6570',
    fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
    fontFamilyHeading: '"IBM Plex Sans Condensed", "Arial Narrow", sans-serif',
    borderRadius: '2px',
    radiusCard: '4px',
    shadowCard: '0 1px 2px rgba(20, 41, 67, 0.08)',
    shadowElevated: '0 12px 28px rgba(20, 41, 67, 0.18)',
    buttonStyle: 'solid',
  })

  await setSetting('general', { companyName: 'Aydin Autoglas', activeSectorTemplate: 'autoglass' })
  await setSetting('contact', {
    email: 'info@aydin-autoglas.example',
    phone: '+49 30 1234567',
    address: {
      de: 'Musterstraße 1, 10115 Berlin',
      en: 'Musterstraße 1, 10115 Berlin, Germany',
      tr: 'Musterstraße 1, 10115 Berlin, Almanya',
    },
  })

  console.log('[seed] autoglass: menus...')
  const navItems: { label: Record<string, string>; linkValue: string }[] = [
    { label: { de: 'Startseite', en: 'Home', tr: 'Anasayfa' }, linkValue: '/' },
    { label: { de: 'Leistungen', en: 'Services', tr: 'Hizmetler' }, linkValue: '/services' },
    { label: { de: 'Standorte', en: 'Branches', tr: 'Şubeler' }, linkValue: '/branches' },
    { label: { de: 'Blog', en: 'Blog', tr: 'Blog' }, linkValue: '/blog' },
    { label: { de: 'Termin buchen', en: 'Book an appointment', tr: 'Randevu al' }, linkValue: '/appointment' },
  ]
  for (const item of navItems) {
    await createMenuItem('header', { label: item.label, linkType: 'url', linkValue: item.linkValue })
    await createMenuItem('footer', { label: item.label, linkType: 'url', linkValue: item.linkValue })
  }

  console.log('[seed] autoglass: services...')
  await createService({
    slug: { de: 'steinschlagreparatur', en: 'windshield-chip-repair', tr: 'tas-cizigi-onarimi' },
    title: { de: 'Steinschlagreparatur', en: 'Windshield Chip Repair', tr: 'Taş Çizigi Onarımı' },
    shortDescription: {
      de: 'Schnelle Reparatur kleiner Steinschläge in ca. 30 Minuten — meist ohne Kosten für Sie dank Teilkasko.',
      en: 'Fast repair of small chips in about 30 minutes — usually free of charge thanks to comprehensive insurance.',
      tr: 'Küçük taş çiziklerinin yaklaşık 30 dakikada onarımı — genellikle kasko sayesinde ücretsiz.',
    },
    content: {
      de: '<p>Ein Steinschlag muss nicht gleich einen kompletten Scheibenwechsel bedeuten. In den meisten Fällen reicht eine schnelle Reparatur, bei der wir das beschädigte Glas mit einem speziellen Harz auffüllen und aushärten. So wird die Ausbreitung des Risses gestoppt und die Sicht bleibt klar.</p><p>Die Reparatur dauert in der Regel nur 30 Minuten und kann direkt in einer unserer Filialen oder mobil bei Ihnen vor Ort durchgeführt werden.</p>',
      en: '<p>A stone chip doesn\'t automatically mean a full windshield replacement. In most cases a quick repair is enough: we fill the damaged glass with a special resin and cure it, stopping the crack from spreading and keeping your view clear.</p><p>The repair usually takes about 30 minutes and can be done at one of our branches or on-site at your location.</p>',
      tr: '<p>Bir taş çizigi her zaman komple cam değişimi anlamına gelmez. Çoğu durumda hızlı bir onarım yeterlidir: hasarlı camı özel bir reçineyle doldurup sertleştiriyoruz. Böylece çatlağın yayılması durur ve görüş netliği korunur.</p><p>Onarım genellikle yaklaşık 30 dakika sürer ve şubelerimizden birinde veya bulunduğunuz yerde mobil olarak yapılabilir.</p>',
    },
    isFeatured: true,
    shortAnswer: {
      de: 'Ja — kleine Steinschläge (kleiner als eine 2-€-Münze, nicht im Sichtfeld) reparieren wir in ca. 30 Minuten, meist kostenfrei über Ihre Teilkaskoversicherung.',
      en: 'Yes — small chips (smaller than a 2-euro coin, outside the driver\'s field of view) are repaired in about 30 minutes, usually free of charge through comprehensive insurance.',
      tr: 'Evet — küçük taş çizikleri (2 euroluk bozuk paradan küçük, görüş alanı dışında) yaklaşık 30 dakikada onarılır, genellikle kasko sayesinde ücretsizdir.',
    },
    priceFromCents: 0,
    durationMinutes: 30,
    warranty: { de: '2 Jahre Garantie auf die Reparatur', en: '2-year warranty on the repair', tr: 'Onarımda 2 yıl garanti' },
    insuranceInfo: {
      de: 'Wird in der Regel direkt mit Ihrer Teilkaskoversicherung abgerechnet, ohne Selbstbeteiligung.',
      en: 'Usually billed directly to your comprehensive insurance, with no deductible.',
      tr: 'Genellikle doğrudan kasko sigortanıza, ek ödeme olmadan yansıtılır.',
    },
    seo: {},
  })

  await createService({
    slug: { de: 'scheibentausch', en: 'windshield-replacement', tr: 'cam-degisimi' },
    title: { de: 'Scheibentausch', en: 'Windshield Replacement', tr: 'Cam Değişimi' },
    shortDescription: {
      de: 'Fachgerechter Austausch Ihrer Frontscheibe inkl. ADAS-Kalibrierung, mit Originalteilen oder gleichwertiger Qualität.',
      en: 'Professional windshield replacement including ADAS calibration, with OEM or equivalent-quality parts.',
      tr: 'ADAS kalibrasyonu dahil, orijinal veya eşdeğer kalitede parçalarla profesyonel ön cam değişimi.',
    },
    content: {
      de: '<p>Ist der Schaden zu groß für eine Reparatur, tauschen wir Ihre Scheibe fachgerecht aus. Moderne Fahrzeuge verfügen häufig über Fahrerassistenzsysteme (ADAS), deren Sensoren an der Frontscheibe angebracht sind — nach dem Austausch kalibrieren wir diese Systeme neu, damit Spurhalteassistent, Notbremsassistent & Co. wieder korrekt funktionieren.</p><p>Wir arbeiten mit Originalteilen oder gleichwertiger Qualität und rechnen auf Wunsch direkt mit Ihrer Versicherung ab.</p>',
      en: '<p>If the damage is too extensive for a repair, we replace your windshield professionally. Modern vehicles often carry driver-assistance sensors (ADAS) mounted on the windshield — after replacement we recalibrate these systems so lane-keeping assist, emergency braking and similar features work correctly again.</p><p>We use OEM or equivalent-quality parts and can bill your insurance directly on request.</p>',
      tr: '<p>Hasar onarım için çok büyükse ön camınızı profesyonelce değiştiriyoruz. Modern araçlarda genellikle ön cama monte edilmiş sürücü destek sensörleri (ADAS) bulunur — değişimden sonra bu sistemleri yeniden kalibre ediyoruz ki şerit takip ve acil fren asistanı gibi özellikler doğru çalışsın.</p><p>Orijinal veya eşdeğer kalitede parçalar kullanıyoruz ve talep üzerine doğrudan sigortanızla anlaşabiliyoruz.</p>',
    },
    isFeatured: true,
    shortAnswer: {
      de: 'Ein Scheibentausch mit ADAS-Kalibrierung dauert bei uns in der Regel 2-3 Stunden, Preise beginnen ab ca. 89 €.',
      en: 'A windshield replacement with ADAS calibration usually takes 2-3 hours, prices start from about €89.',
      tr: 'ADAS kalibrasyonlu cam değişimi genellikle 2-3 saat sürer, fiyatlar yaklaşık 89 €\'dan başlar.',
    },
    priceFromCents: 8900,
    durationMinutes: 150,
    warranty: { de: '2 Jahre Garantie auf Material und Einbau', en: '2-year warranty on parts and installation', tr: 'Parça ve montajda 2 yıl garanti' },
    insuranceInfo: {
      de: 'Direkte Abrechnung mit Ihrer Kaskoversicherung möglich, auf Wunsch übernehmen wir die gesamte Kommunikation.',
      en: 'Direct billing to your comprehensive insurance is possible; we handle all communication with them on request.',
      tr: 'Kasko sigortanızla doğrudan anlaşma mümkündür, talep üzerine tüm iletişimi biz yürütürüz.',
    },
    seo: {},
  })

  await createService({
    slug: { de: 'seiten-heckscheiben', en: 'side-rear-window-repair', tr: 'yan-arka-cam-onarimi' },
    title: { de: 'Seiten- & Heckscheiben', en: 'Side & Rear Windows', tr: 'Yan & Arka Camlar' },
    shortDescription: {
      de: 'Reparatur und Austausch von Seiten- und Heckscheiben für nahezu alle Fahrzeugmodelle.',
      en: 'Repair and replacement of side and rear windows for nearly every vehicle model.',
      tr: 'Neredeyse tüm araç modelleri için yan ve arka cam onarımı ve değişimi.',
    },
    content: {
      de: '<p>Ob nach einem Einbruch, Vandalismus oder Verschleiß — wir ersetzen beschädigte Seiten- und Heckscheiben schnell und zuverlässig, inklusive fachgerechter Entsorgung des Altglases.</p>',
      en: '<p>Whether after a break-in, vandalism or wear — we replace damaged side and rear windows quickly and reliably, including proper disposal of the old glass.</p>',
      tr: '<p>İster hırsızlık, vandalizm ister eskime sonrası olsun — hasarlı yan ve arka camları hızlı ve güvenilir şekilde değiştiriyoruz, eski camın uygun şekilde bertaraf edilmesi dahil.</p>',
    },
    isFeatured: false,
    shortAnswer: {
      de: 'Ja, wir reparieren und tauschen Seiten- und Heckscheiben für nahezu alle Fahrzeugmodelle, meist innerhalb eines Tages.',
      en: 'Yes, we repair and replace side and rear windows for nearly every vehicle model, usually within one day.',
      tr: 'Evet, neredeyse tüm araç modelleri için yan ve arka camları onarıyor ve değiştiriyoruz, genellikle bir gün içinde.',
    },
    priceFromCents: 12900,
    durationMinutes: 90,
    warranty: { de: '2 Jahre Garantie auf Material und Einbau', en: '2-year warranty on parts and installation', tr: 'Parça ve montajda 2 yıl garanti' },
    insuranceInfo: {
      de: 'Abrechnung mit Ihrer Teil- oder Vollkaskoversicherung möglich, abhängig von der Schadensursache.',
      en: 'Billing to your comprehensive insurance is possible, depending on the cause of the damage.',
      tr: 'Hasarın nedenine bağlı olarak kasko sigortanıza fatura edilebilir.',
    },
    seo: {},
  })

  console.log('[seed] autoglass: branches...')
  await createLocation({
    slug: { de: 'berlin', en: 'berlin', tr: 'berlin' },
    name: { de: 'Filiale Berlin', en: 'Berlin Branch', tr: 'Berlin Şubesi' },
    address: {
      de: 'Musterstraße 1, 10115 Berlin',
      en: 'Musterstraße 1, 10115 Berlin, Germany',
      tr: 'Musterstraße 1, 10115 Berlin, Almanya',
    },
    phone: '+49 30 1234567',
    email: 'berlin@aydin-autoglas.example',
    latitude: 52.5170365,
    longitude: 13.3888599,
    openingHours: { mon: '08:00-18:00', tue: '08:00-18:00', wed: '08:00-18:00', thu: '08:00-18:00', fri: '08:00-18:00', sat: '09:00-13:00' },
  })

  await createLocation({
    slug: { de: 'muenchen', en: 'munich', tr: 'munih' },
    name: { de: 'Filiale München', en: 'Munich Branch', tr: 'Münih Şubesi' },
    address: {
      de: 'Beispielweg 22, 80331 München',
      en: 'Beispielweg 22, 80331 Munich, Germany',
      tr: 'Beispielweg 22, 80331 Münih, Almanya',
    },
    phone: '+49 89 7654321',
    email: 'muenchen@aydin-autoglas.example',
    latitude: 48.1371079,
    longitude: 11.5753822,
    openingHours: { mon: '08:00-18:00', tue: '08:00-18:00', wed: '08:00-18:00', thu: '08:00-18:00', fri: '08:00-18:00', sat: '09:00-13:00' },
  })

  console.log('[seed] autoglass: FAQ categories...')
  const repairCategory = await createFaqCategory({
    name: { de: 'Reparatur & Kosten', en: 'Repair & Costs', tr: 'Onarım & Ücret' },
  })
  const serviceCategory = await createFaqCategory({
    name: { de: 'Termin & Service', en: 'Appointments & Service', tr: 'Randevu & Hizmet' },
  })

  console.log('[seed] autoglass: FAQs...')
  const faqs: { categoryId: string; question: Record<string, string>; answer: Record<string, string> }[] = [
    {
      categoryId: repairCategory.id,
      question: { de: 'Wie lange dauert eine Steinschlagreparatur?', en: 'How long does a chip repair take?', tr: 'Taş çizigi onarımı ne kadar sürer?' },
      answer: {
        de: 'In der Regel etwa 30 Minuten — Sie können in dieser Zeit bei uns warten.',
        en: 'Usually about 30 minutes — you\'re welcome to wait on site.',
        tr: 'Genellikle yaklaşık 30 dakika — bu süre boyunca yerinde bekleyebilirsiniz.',
      },
    },
    {
      categoryId: repairCategory.id,
      question: { de: 'Übernimmt meine Versicherung die Kosten?', en: 'Will my insurance cover the cost?', tr: 'Sigortam masrafları karşılar mı?' },
      answer: {
        de: 'Bei einer Teilkaskoversicherung wird eine Steinschlagreparatur in der Regel ohne Selbstbeteiligung übernommen. Wir klären das gerne direkt mit Ihrer Versicherung.',
        en: 'With comprehensive (partial) coverage, a chip repair is usually covered with no deductible. We\'re happy to clarify this directly with your insurer.',
        tr: 'Kasko sigortanız varsa, taş çizigi onarımı genellikle muafiyetsiz karşılanır. Sigortanızla doğrudan görüşerek netleştirebiliriz.',
      },
    },
    {
      categoryId: repairCategory.id,
      question: { de: 'Muss ich nach einem Scheibentausch die Fahrassistenzsysteme kalibrieren lassen?', en: 'Do driver-assistance systems need calibrating after a windshield replacement?', tr: 'Cam değişiminden sonra sürücü destek sistemlerinin kalibre edilmesi gerekir mi?' },
      answer: {
        de: 'Ja, sofern Ihr Fahrzeug über kamerabasierte Assistenzsysteme verfügt. Wir übernehmen die ADAS-Kalibrierung direkt im Anschluss an den Austausch.',
        en: 'Yes, if your vehicle has camera-based assistance systems. We perform the ADAS calibration immediately after the replacement.',
        tr: 'Evet, aracınızda kamera tabanlı destek sistemleri varsa. Değişimin hemen ardından ADAS kalibrasyonunu biz yapıyoruz.',
      },
    },
    {
      categoryId: repairCategory.id,
      question: { de: 'Welche Garantie erhalte ich auf die Arbeiten?', en: 'What warranty do I get on the work?', tr: 'Yapılan işler için ne kadar garanti alıyorum?' },
      answer: {
        de: 'Auf alle Reparaturen und Scheibenwechsel gewähren wir eine Garantie von 24 Monaten.',
        en: 'We provide a 24-month warranty on all repairs and windshield replacements.',
        tr: 'Tüm onarım ve cam değişimlerinde 24 ay garanti sunuyoruz.',
      },
    },
    {
      categoryId: serviceCategory.id,
      question: { de: 'Bieten Sie einen mobilen Service an?', en: 'Do you offer a mobile service?', tr: 'Mobil hizmet sunuyor musunuz?' },
      answer: {
        de: 'Ja, für viele Reparaturen kommen wir zu Ihnen — nach Hause oder an den Arbeitsplatz.',
        en: 'Yes, for many repairs we come to you — at home or at work.',
        tr: 'Evet, birçok onarım için size geliyoruz — evinize veya iş yerinize.',
      },
    },
    {
      categoryId: serviceCategory.id,
      question: { de: 'Wie vereinbare ich einen Termin?', en: 'How do I book an appointment?', tr: 'Nasıl randevu alabilirim?' },
      answer: {
        de: 'Nutzen Sie unser Online-Formular, den Hasar-Schnelltest auf der Startseite, oder rufen Sie uns direkt an.',
        en: 'Use our online form, the damage quick-check on the homepage, or call us directly.',
        tr: 'Online formumuzu, ana sayfadaki hasar hızlı testini kullanabilir veya bizi doğrudan arayabilirsiniz.',
      },
    },
  ]
  for (const faq of faqs) {
    await createFaq({ categoryId: faq.categoryId, question: faq.question, answer: faq.answer })
  }

  console.log('[seed] autoglass: testimonials...')
  const testimonials: { authorName: string; rating: number; text: Record<string, string> }[] = [
    {
      authorName: 'M. Fischer',
      rating: 5,
      text: {
        de: 'Super schnell und unkompliziert — die Steinschlagreparatur hat keine 30 Minuten gedauert.',
        en: 'Super fast and easy — the chip repair took less than 30 minutes.',
        tr: 'Çok hızlı ve sorunsuz — taş çizigi onarımı 30 dakikadan az sürdü.',
      },
    },
    {
      authorName: 'S. Yılmaz',
      rating: 5,
      text: {
        de: 'Freundliches Team, faire Preise, und die Abwicklung mit meiner Versicherung lief reibungslos.',
        en: 'Friendly team, fair prices, and the process with my insurance went smoothly.',
        tr: 'Güler yüzlü ekip, uygun fiyatlar ve sigortamla işlemler sorunsuz ilerledi.',
      },
    },
    {
      authorName: 'T. Becker',
      rating: 4,
      text: {
        de: 'Der mobile Service hat mir viel Zeit gespart — Reparatur direkt vor der Firma.',
        en: 'The mobile service saved me a lot of time — repair done right in front of my office.',
        tr: 'Mobil hizmet çok zaman kazandırdı — onarım doğrudan ofisimin önünde yapıldı.',
      },
    },
  ]
  for (const t of testimonials) {
    await createTestimonial({ authorName: t.authorName, rating: t.rating, text: t.text })
  }

  console.log('[seed] autoglass: damage wizard...')
  const question = await createQuestion({ text: { de: 'Wie groß ist der Steinschlag?', en: 'How big is the chip?', tr: 'Taş çizigi ne kadar büyük?' } })
  await createOption({ questionId: question.id, label: { de: 'Kleiner als eine Münze', en: 'Smaller than a coin', tr: 'Bir bozuk paradan küçük' }, score: 10 })
  await createOption({ questionId: question.id, label: { de: 'Größer als eine Münze', en: 'Larger than a coin', tr: 'Bir bozuk paradan büyük' }, score: 60 })
  const question2 = await createQuestion({ text: { de: 'Befindet sich der Schaden im Sichtfeld des Fahrers?', en: 'Is the damage in the driver\'s line of sight?', tr: 'Hasar sürücünün görüş alanında mı?' } })
  await createOption({ questionId: question2.id, label: { de: 'Nein', en: 'No', tr: 'Hayır' }, score: 0 })
  await createOption({ questionId: question2.id, label: { de: 'Ja', en: 'Yes', tr: 'Evet' }, score: 40 })
  await createRule({ minScore: 0, recommendation: 'repair', message: { de: 'Eine Reparatur reicht aus.', en: 'A repair is sufficient.', tr: 'Bir onarım yeterli.' } })
  await createRule({ minScore: 50, recommendation: 'replace', message: { de: 'Ein Austausch wird empfohlen.', en: 'A replacement is recommended.', tr: 'Değişim önerilir.' } })

  console.log('[seed] autoglass: blog...')
  const category = await createBlogCategory({ slug: { de: 'tipps', en: 'tips', tr: 'ipuclari' }, name: { de: 'Tipps', en: 'Tips', tr: 'İpuçları' } })
  await createBlogPost({
    categoryId: category.id,
    slug: { de: 'winterreifen-check', en: 'winter-tire-check', tr: 'kis-lastigi-kontrolu' },
    title: { de: 'Winter-Check: Darauf sollten Sie bei Ihrer Scheibe achten', en: 'Winter Check: What to Watch for on Your Windshield', tr: 'Kış Kontrolü: Ön Camınızda Nelere Dikkat Etmelisiniz' },
    excerpt: {
      de: 'Kälte und Streusalz setzen kleinen Rissen zu — warum jetzt der beste Zeitpunkt für eine Reparatur ist.',
      en: 'Cold and road salt are tough on small cracks — why now is the best time for a repair.',
      tr: 'Soğuk ve tuz küçük çatlaklar için zorlayıcıdır — onarım için neden şimdi en iyi zaman.',
    },
    content: {
      de: '<p>Sinkende Temperaturen lassen kleine Steinschläge schneller zu großen Rissen werden — das Glas zieht sich zusammen und die Spannung im Material steigt. Wer im Herbst einen kleinen Schaden ignoriert, riskiert im Winter einen teuren Komplettaustausch.</p><p>Unser Tipp: Lassen Sie kleine Schäden noch vor dem ersten Frost reparieren.</p>',
      en: '<p>Falling temperatures make small chips turn into large cracks faster — the glass contracts and stress in the material increases. Ignoring a small chip in autumn risks an expensive full replacement come winter.</p><p>Our tip: get small chips repaired before the first frost.</p>',
      tr: '<p>Düşen sıcaklıklar küçük taş çiziklerinin daha hızlı büyük çatlaklara dönüşmesine neden olur — cam büzülür ve malzemedeki gerilim artar. Sonbaharda küçük bir hasarı görmezden gelmek, kışın pahalı bir komple değişim riski taşır.</p><p>İpucumuz: küçük hasarları ilk don gelmeden onarttırın.</p>',
    },
    publishedByLocale: { de: true, en: true, tr: true },
    authorName: 'Aydin Autoglas Redaktion',
    authorRole: { de: 'Fachredaktion', en: 'Editorial team', tr: 'Editör ekibi' },
    shortAnswer: {
      de: 'Kleine Steinschläge sollten vor dem ersten Frost repariert werden, da Kälte sie schnell zu größeren Rissen wachsen lässt.',
      en: 'Small chips should be repaired before the first frost, since cold weather quickly makes them grow into larger cracks.',
      tr: 'Küçük taş çizikleri ilk dondan önce onartılmalıdır, çünkü soğuk hava onların hızla büyük çatlaklara dönüşmesine neden olur.',
    },
    seo: {},
  })

  console.log('[seed] autoglass: homepage...')
  const homepage = await createPage({
    slug: { de: '', en: '', tr: '' },
    title: { de: 'Startseite', en: 'Home', tr: 'Anasayfa' },
    seo: {
      de: { metaTitle: 'Aydin Autoglas — Scheibenreparatur & -austausch', metaDescription: 'Schnelle, zuverlässige Autoglas-Reparatur und -austausch in Berlin und München. Direkte Versicherungsabwicklung.' },
      en: { metaTitle: 'Aydin Autoglas — Windshield Repair & Replacement', metaDescription: 'Fast, reliable auto glass repair and replacement in Berlin and Munich. Direct insurance billing.' },
      tr: { metaTitle: 'Aydin Autoglas — Cam Onarımı ve Değişimi', metaDescription: 'Berlin ve Münih\'te hızlı, güvenilir oto cam onarımı ve değişimi. Doğrudan sigorta işlemleri.' },
    },
  })

  const homeBlocks: Block[] = [
    {
      type: 'hero',
      data: {
        heading: { de: 'Ihr Spezialist für Autoglas', en: 'Your Auto Glass Specialist', tr: 'Oto Cam Uzmanınız' },
        subheading: { de: 'Schnell, zuverlässig, in ganz Deutschland', en: 'Fast, reliable, all across Germany', tr: 'Hızlı, güvenilir, tüm Almanya\'da' },
        ctaLabel: { de: 'Termin buchen', en: 'Book an appointment', tr: 'Randevu al' },
        ctaHref: '/appointment',
        badges: [
          { de: 'Kostenloser Ersatzwagen', en: 'Free loaner car', tr: 'Ücretsiz yedek araç' },
          { de: 'Direkte Versicherungsabwicklung', en: 'Direct insurance billing', tr: 'Doğrudan sigorta işlemleri' },
          { de: '2 Standorte in Deutschland', en: '2 branches across Germany', tr: 'Almanya\'da 2 şube' },
        ],
      },
    },
    {
      type: 'service-cards',
      data: { heading: { de: 'Unsere Leistungen', en: 'Our Services', tr: 'Hizmetlerimiz' }, subheading: {}, limit: 6, onlyFeatured: false },
    },
    {
      type: 'how-it-works',
      data: {
        heading: { de: 'So funktioniert es', en: 'How it works', tr: 'Nasıl çalışır' },
        subheading: {},
        steps: [
          { title: { de: '1. Schaden melden', en: '1. Report the damage', tr: '1. Hasarı bildirin' }, description: { de: 'Online-Formular oder Hasar-Check ausfüllen.', en: 'Fill out the online form or damage check.', tr: 'Online formu veya hasar testini doldurun.' } },
          { title: { de: '2. Termin vereinbaren', en: '2. Schedule an appointment', tr: '2. Randevu alın' }, description: { de: 'Wunschtermin und Filiale auswählen.', en: 'Choose your preferred time and branch.', tr: 'Tercih ettiğiniz zamanı ve şubeyi seçin.' } },
          { title: { de: '3. Reparatur oder Austausch', en: '3. Repair or replacement', tr: '3. Onarım veya değişim' }, description: { de: 'Wir kümmern uns um den Rest — inkl. Versicherung.', en: 'We take care of the rest — insurance included.', tr: 'Gerisiyle biz ilgileniyoruz — sigorta dahil.' } },
        ],
      },
    },
    {
      type: 'damage-wizard',
      data: { heading: { de: 'Hasar-Schnelltest', en: 'Quick Damage Check', tr: 'Hızlı Hasar Testi' }, subheading: { de: 'Finden Sie in wenigen Klicks heraus, ob eine Reparatur reicht.', en: 'Find out in a few clicks whether a repair is enough.', tr: 'Birkaç tıkla onarımın yeterli olup olmadığını öğrenin.' } },
    },
    {
      type: 'why-us',
      data: {
        heading: { de: 'Warum Aydin Autoglas?', en: 'Why Aydin Autoglas?', tr: 'Neden Aydin Autoglas?' },
        subheading: {},
        features: [
          { title: { de: 'ADAS-Kalibrierung', en: 'ADAS calibration', tr: 'ADAS kalibrasyonu' }, description: { de: 'Zertifizierte Kalibrierung moderner Assistenzsysteme.', en: 'Certified calibration of modern assistance systems.', tr: 'Modern destek sistemlerinin sertifikalı kalibrasyonu.' }, icon: 'shield' },
          { title: { de: 'Direkte Versicherungsabwicklung', en: 'Direct insurance billing', tr: 'Doğrudan sigorta işlemleri' }, description: { de: 'Wir übernehmen den Papierkram für Sie.', en: 'We handle the paperwork for you.', tr: 'Evrak işlerini sizin için hallederiz.' }, icon: 'check' },
          { title: { de: 'Mobiler Service', en: 'Mobile service', tr: 'Mobil hizmet' }, description: { de: 'Wir kommen zu Ihnen nach Hause oder ins Büro.', en: 'We come to your home or office.', tr: 'Evinize veya ofisinize geliyoruz.' }, icon: 'truck' },
        ],
      },
    },
    {
      type: 'stats-counter',
      data: {
        heading: { de: 'Aydin Autoglas in Zahlen', en: 'Aydin Autoglas in numbers', tr: 'Rakamlarla Aydin Autoglas' },
        stats: [
          { label: { de: 'Reparaturen pro Jahr', en: 'Repairs per year', tr: 'Yıllık onarım' }, value: 5000, suffix: '+' },
          { label: { de: 'Jahre Erfahrung', en: 'Years of experience', tr: 'Yıllık deneyim' }, value: 15 },
          { label: { de: 'Filialen', en: 'Branches', tr: 'Şube' }, value: 2 },
        ],
      },
    },
    {
      type: 'testimonials',
      data: { heading: { de: 'Das sagen unsere Kunden', en: 'What our customers say', tr: 'Müşterilerimiz ne diyor' }, subheading: {}, limit: 6 },
    },
    {
      type: 'branch-finder',
      data: { heading: { de: 'Unsere Standorte', en: 'Our Branches', tr: 'Şubelerimiz' }, subheading: {} },
    },
    {
      type: 'faq-accordion',
      data: { heading: { de: 'Häufige Fragen', en: 'Frequently Asked Questions', tr: 'Sıkça Sorulan Sorular' }, subheading: {} },
    },
    {
      type: 'cta-band',
      data: {
        heading: { de: 'Bereit für Ihren Termin?', en: 'Ready for your appointment?', tr: 'Randevunuza hazır mısınız?' },
        subheading: {},
        ctaLabel: { de: 'Jetzt Termin buchen', en: 'Book now', tr: 'Şimdi randevu al' },
        ctaHref: '/appointment',
      },
    },
    {
      type: 'contact-form',
      data: { heading: { de: 'Kontaktieren Sie uns', en: 'Contact us', tr: 'Bize ulaşın' }, subheading: {} },
    },
  ]

  for (const block of homeBlocks) {
    await createBlock(homepage.id, block)
  }
  await updatePage(homepage.id, { status: 'published' })

  console.log('[seed] autoglass: legal pages...')
  const impressum = await createPage({
    slug: { de: 'impressum' },
    title: { de: 'Impressum' },
    seo: { de: { noindex: true } },
  })
  await createBlock(impressum.id, {
    type: 'rich-text',
    data: {
      content: {
        de: '<h2>Angaben gemäß § 5 TMG</h2><p>Aydin Autoglas GmbH<br>Musterstraße 1<br>10115 Berlin</p><p>Telefon: +49 30 1234567<br>E-Mail: info@aydin-autoglas.example</p><p><em>Platzhalterangaben — vor Live-Schaltung durch die tatsächlichen Firmendaten (Handelsregister, USt-IdNr., vertretungsberechtigte Person) ersetzen.</em></p>',
      },
    },
  })
  await updatePage(impressum.id, { status: 'published' })

  const privacy = await createPage({
    slug: { de: 'datenschutz' },
    title: { de: 'Datenschutzerklärung' },
    seo: { de: { noindex: true } },
  })
  await createBlock(privacy.id, {
    type: 'rich-text',
    data: {
      content: {
        de: '<h2>Datenschutz auf einen Blick</h2><p>Diese Seite verwendet Cookies gemäß den in der Cookie-Einstellung gewählten Kategorien. Kontaktformulardaten werden ausschließlich zur Bearbeitung Ihrer Anfrage verwendet.</p><p><em>Platzhaltertext — vor Live-Schaltung durch eine vollständige, rechtsgeprüfte Datenschutzerklärung ersetzen.</em></p>',
      },
    },
  })
  await updatePage(privacy.id, { status: 'published' })

  console.log('[seed] autoglass template seeded.')
}
