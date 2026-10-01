// Statik fallback site verisi. Asıl içerik veritabanından (admin panel) gelir;
// buradaki değerler yalnızca API boş döndüğünde veya derleme anında kullanılır.

export const siteMeta = {
  name: "Aydin Autoglas",
  titleSuffix: "Aydin Autoglas",
  description:
    "Aydin Autoglas; Steinschlagreparatur, Frontscheibenaustausch, Seiten- und Heckscheibenaustausch sowie mobilem Service in Hildrizhausen und dem Landkreis Stuttgart.",
  url: "https://www.aydinautoglas.de",
  phone: "",
  phoneDisplay: "",
  email: "Autoglas@auto-bb.de",
  ogImage: "https://www.aydinautoglas.de/og-image.png",
  address: {
    street: "Hans Klemm Straße 2",
    city: "Hildrizhausen",
    region: "Hildrizhausen",
    postalCode: "71157"
  },
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Hans+Klemm+Stra%C3%9Fe+2%2C+71157+Hildrizhausen",
  workingHours: "Mo–Fr 08:00–18:00 Uhr · Sa nach Vereinbarung",
  social: ["", ""]
}

export const services = [
  { slug: "steinschlagreparatur", title: "Steinschlagreparatur" },
  { slug: "frontscheibenaustausch", title: "Frontscheibenaustausch" },
  { slug: "seitenscheiben-heckscheibenaustausch", title: "Seiten- & Heckscheiben" },
  { slug: "mobiler-service", title: "Mobiler Service" }
] as const

export const serviceMap = Object.fromEntries(
  services.map((service) => [service.slug, service])
) as Record<(typeof services)[number]["slug"], (typeof services)[number]>

export const testimonials = [] as const

export const blogPosts: Array<{ slug: string; [key: string]: any }> = []

export const blogPostMap = Object.fromEntries(
  blogPosts.map((post) => [post.slug, post])
) as Record<string, (typeof blogPosts)[number]>
