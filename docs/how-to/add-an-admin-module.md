# How to add a new admin module

> Pattern established in Phase 2, applied repeatedly from Phase 3 onward.

1. Define/extend the Drizzle schema in `server/db/schema/<module>.ts`, run `pnpm db:generate` then `pnpm db:migrate`.
2. Add a Zod schema in `shared/schemas/<module>.ts` for create/update input.
3. Add service functions in `server/services/<module>.service.ts` (CRUD, role checks, audit log writes).
4. Add thin route handlers under `server/api/admin/<module>/*.ts`, guarded by `server/middleware/admin-auth.ts`, validating input with the shared Zod schema.
5. Add the admin UI page(s) under `app/pages/admin/<module>/`, built from the shared admin UI kit (`DataTable`, `FormField`, `Modal`, `Toast`, `ConfirmDialog`) in `app/components/admin/`.
6. Add the module to the admin sidebar navigation.
7. Add tests: at least one service-layer unit test and one API-level test asserting a 401 without a valid session.
