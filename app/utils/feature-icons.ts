import {
  Award,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
  Truck,
  Users,
  Wrench,
} from '@lucide/vue'
import type { Component } from 'vue'

/**
 * A small curated set of generic, sector-agnostic icons an editor can attach to a "why us"
 * feature or a service card, without needing to upload a custom image. Deliberately not
 * exhaustive — these cover the common trust/feature themes (speed, quality, guarantee,
 * mobility, team) any small service business needs; add more here if a real need comes up.
 */
export const FEATURE_ICONS: Record<string, Component> = {
  shield: ShieldCheck,
  clock: Clock,
  wrench: Wrench,
  star: Star,
  check: CheckCircle,
  award: Award,
  truck: Truck,
  phone: Phone,
  mapPin: MapPin,
  thumbsUp: ThumbsUp,
  sparkles: Sparkles,
  users: Users,
}

export const FEATURE_ICON_NAMES = Object.keys(FEATURE_ICONS)
