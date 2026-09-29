// POST /api/appointments — randevu formu gönderimi
import { getDb } from "../utils/db"
import { checkRateLimit, resolveClientIp } from "../utils/rate-limit"

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event)
  const body = await readBody(event)
  const {
    name, phone, email, service, message,
    glassType, damageExtent, damageLocation,
    licensePlate, insuranceCompany, vin,
    additionalService, referralSource,
    preferredDate, preferredTime,
  } = body || {}

  const rateLimit = checkRateLimit(event, {
    keyPrefix: "contact-form",
    windowMs: 10 * 60 * 1000,
    maxRequests: 3,
  })

  if (!rateLimit.allowed) {
    setHeader(event, "Retry-After", rateLimit.retryAfterSeconds)
    throw createError({ statusCode: 429, message: "Zu viele Anfragen. Bitte versuchen Sie es in einigen Minuten erneut." })
  }

  const honeypot = String(body?.website || "").trim()
  if (honeypot) {
    return { success: true }
  }

  const startedAt = Number(body?.form_started_at || 0)
  if (Number.isFinite(startedAt) && startedAt > 0) {
    const elapsed = Date.now() - startedAt
    if (elapsed >= 0 && elapsed < 2500) {
      throw createError({ statusCode: 400, message: "Formular wurde zu schnell gesendet. Bitte überprüfen Sie Ihre Angaben und versuchen Sie es erneut." })
    }
  }

  const turnstileSecret = String(runtimeConfig.turnstileSecret || "").trim()
  if (turnstileSecret) {
    const token = String(body?.turnstile_token || "").trim()
    if (!token) {
      throw createError({ statusCode: 400, message: "Bitte bestätigen Sie die Sicherheitsprüfung." })
    }

    const formData = new URLSearchParams()
    formData.set("secret", turnstileSecret)
    formData.set("response", token)
    formData.set("remoteip", resolveClientIp(event))

    let verification: any = null
    try {
      verification = await $fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body: formData,
      })
    } catch {
      throw createError({ statusCode: 503, message: "Sicherheitsdienst nicht erreichbar. Bitte versuchen Sie es erneut." })
    }

    if (!verification?.success) {
      throw createError({ statusCode: 400, message: "Sicherheitsprüfung fehlgeschlagen. Bitte versuchen Sie es erneut." })
    }
  }

  if (!name || !email) {
    throw createError({ statusCode: 400, message: "Name und E-Mail sind erforderlich." })
  }

  const db = await getDb()
  const result = await db.prepare(`
    INSERT INTO appointments (
      name, phone, email, service, message,
      glass_type, damage_extent, damage_location,
      license_plate, insurance_company, vin,
      additional_service, referral_source,
      preferred_date, preferred_time
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    String(name).slice(0, 200),
    String(phone || "").slice(0, 50),
    String(email).slice(0, 200),
    String(service || "").slice(0, 100),
    String(message || "").slice(0, 2000),
    String(glassType || "").slice(0, 50),
    String(damageExtent || "").slice(0, 50),
    String(damageLocation || "").slice(0, 50),
    String(licensePlate || "").slice(0, 20),
    String(insuranceCompany || "").slice(0, 100),
    String(vin || "").slice(0, 20),
    String(additionalService || "").slice(0, 50),
    String(referralSource || "").slice(0, 50),
    String(preferredDate || "").slice(0, 20),
    String(preferredTime || "").slice(0, 20)
  )

  return { success: true, id: result.lastInsertRowid }
})
