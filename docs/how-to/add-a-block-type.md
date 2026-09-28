# How to add a new page-builder block type

> Fully implemented in Phase 4. This is the process to follow when it's time.

1. Add a Zod schema for the block in `shared/schemas/blocks/<block-name>.ts`, e.g.:
   ```ts
   export const statsCounterBlockSchema = z.object({
     type: z.literal('stats-counter'),
     data: z.object({ /* ... */ }),
   })
   ```
2. Add it to the union in `shared/schemas/blocks/index.ts`.
3. Create the public Vue component in `app/components/blocks/<BlockName>.vue`, typed against the schema's `data`.
4. Register it in the render-side `BLOCK_REGISTRY` (maps `type` → component).
5. Add an admin editor form for the block's fields (with language tabs for any translatable field) and register it in the "add block" picker, including a display name/icon and a sensible default `data`.
6. Add a unit test validating the schema accepts valid data and rejects invalid data.
