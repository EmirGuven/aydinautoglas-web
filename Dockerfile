# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS production
ENV NODE_ENV=production
RUN addgroup -S nuxt && adduser -S nuxt -G nuxt

# Runtime app output
COPY --from=build /app/.output ./.output

# Migration / seed / admin-create tooling needs these at runtime. server/services and
# server/utils are required by the seed templates (server/db/seed/templates/*), which call
# the same service-layer functions the admin API uses rather than raw db.insert.
COPY --from=build /app/server/db/migrations ./server/db/migrations
COPY --from=build /app/server/db/migrate.ts ./server/db/migrate.ts
COPY --from=build /app/server/db/client.ts ./server/db/client.ts
COPY --from=build /app/server/db/schema ./server/db/schema
COPY --from=build /app/server/db/seed ./server/db/seed
COPY --from=build /app/server/services ./server/services
COPY --from=build /app/server/utils ./server/utils
COPY --from=build /app/server/cli ./server/cli
COPY --from=build /app/shared ./shared
# server/db/seed/core-translations.ts imports the static locale files as its seed source.
COPY --from=build /app/i18n/locales ./i18n/locales
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=deps /app/node_modules ./node_modules
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN mkdir -p /app/uploads && chown -R nuxt:nuxt /app
USER nuxt

EXPOSE 3000
ENTRYPOINT ["sh", "./docker-entrypoint.sh"]
CMD ["node", ".output/server/index.mjs"]
