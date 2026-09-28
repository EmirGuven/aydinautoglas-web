import type { SessionPayload } from '../utils/jwt'

declare module 'h3' {
  interface H3EventContext {
    user?: SessionPayload
  }
}

export {}
