import { z } from 'zod'

export const userRoleSchema = z.enum(['owner', 'admin', 'editor'])
export type UserRole = z.infer<typeof userRoleSchema>

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10, 'Password must be at least 10 characters'),
  name: z.string().min(1),
  role: userRoleSchema,
  locale: z.string().default('de'),
})

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: userRoleSchema.optional(),
  locale: z.string().optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(10).optional(),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type LoginInput = z.infer<typeof loginSchema>
