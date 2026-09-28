export interface PageCtaButtons {
  primaryLabel: string
  primaryUrl: string
  secondaryLabel: string
  secondaryUrl: string
}

export const CTA_HIDDEN_VALUE = "__hidden__"

export const homepageCtaDefaults: PageCtaButtons = {
  primaryLabel: "Termin vereinbaren",
  primaryUrl: "/kontakt",
  secondaryLabel: "Leistungen ansehen",
  secondaryUrl: "/steinschlagreparatur",
}

export const aboutCtaDefaults: PageCtaButtons = {
  primaryLabel: "Termin vereinbaren",
  primaryUrl: "/kontakt",
  secondaryLabel: "Leistungen ansehen",
  secondaryUrl: "/steinschlagreparatur",
}

export const faqCtaDefaults: PageCtaButtons = {
  primaryLabel: "Kontakt aufnehmen",
  primaryUrl: "/kontakt",
  secondaryLabel: "Termin anfragen",
  secondaryUrl: "/kontakt",
}

export const serviceCtaDefaults: PageCtaButtons = {
  primaryLabel: "Termin vereinbaren",
  primaryUrl: "/kontakt",
  secondaryLabel: "Über uns",
  secondaryUrl: "/ueber-uns",
}

export function getContactCtaDefaults(email = "", phone = ""): PageCtaButtons {
  return {
    primaryLabel: "E-Mail schreiben",
    primaryUrl: email ? `mailto:${email}` : "",
    secondaryLabel: "Anrufen",
    secondaryUrl: phone ? `tel:${phone}` : "",
  }
}

export function resolvePageCtaButtons(
  value: Partial<PageCtaButtons> | null | undefined,
  defaults: PageCtaButtons,
): PageCtaButtons {
  const primaryLabel = String(value?.primaryLabel || defaults.primaryLabel || "").trim()
  const primaryUrl = String(value?.primaryUrl || defaults.primaryUrl || "").trim()
  const secondaryLabelValue = String(value?.secondaryLabel || "").trim()
  const secondaryUrlValue = String(value?.secondaryUrl || "").trim()
  const secondaryHidden = secondaryLabelValue === CTA_HIDDEN_VALUE

  return {
    primaryLabel,
    primaryUrl,
    secondaryLabel: secondaryHidden
      ? ""
      : String(secondaryLabelValue || defaults.secondaryLabel || "").trim(),
    secondaryUrl: secondaryHidden
      ? ""
      : String(secondaryUrlValue || defaults.secondaryUrl || "").trim(),
  }
}

export function buildPageCtaBackgroundStyle(image?: string) {
  const source = String(image || "").trim()
  if (!source) return {}

  return {
    backgroundImage: `linear-gradient(135deg, rgba(8,10,12,0.84) 0%, rgba(18,16,15,0.8) 58%, rgba(36,21,18,0.72) 100%), url(${source})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }
}
