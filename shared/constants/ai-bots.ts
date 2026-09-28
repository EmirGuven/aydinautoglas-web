/**
 * Well-known AI/search crawler user-agents an admin can allow/disallow individually
 * (prompt.md §15.4). This is a fixed list of real-world bot identifiers — not language
 * codes or other project data — so it's fine to hardcode here; add a new bot by adding
 * a line, no schema/migration change needed since it's just a key in the `robots.botRules`
 * JSONB setting.
 */
export const KNOWN_AI_BOTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'PerplexityBot',
  'Google-Extended',
  'Applebot-Extended',
] as const

export type KnownAiBot = (typeof KNOWN_AI_BOTS)[number]
