import argon2 from 'argon2'
import { eq, ne, and } from 'drizzle-orm'
import { db } from '../db/client'
import { users } from '../db/schema'
import type { CreateUserInput, UpdateUserInput, UserRole } from '../../shared/schemas/users'
import { ForbiddenError, requireRole } from '../utils/permissions'
import { recordAuditLog } from './audit-log.service'

const SAFE_COLUMNS = {
  id: users.id,
  email: users.email,
  name: users.name,
  role: users.role,
  locale: users.locale,
  isActive: users.isActive,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
}

export async function listUsers(actingRole: UserRole) {
  requireRole(actingRole, 'admin')
  return db.select(SAFE_COLUMNS).from(users).orderBy(users.createdAt)
}

export async function createUser(actingUserId: string, actingRole: UserRole, input: CreateUserInput) {
  requireRole(actingRole, 'admin')
  // Only an owner may create another owner or admin account.
  if (input.role !== 'editor') {
    requireRole(actingRole, 'owner')
  }

  const passwordHash = await argon2.hash(input.password)
  const [created] = await db
    .insert(users)
    .values({
      email: input.email,
      name: input.name,
      passwordHash,
      role: input.role,
      locale: input.locale,
    })
    .returning(SAFE_COLUMNS)

  if (!created) {
    throw new Error('User insert did not return a row')
  }

  await recordAuditLog({
    userId: actingUserId,
    action: 'user.create',
    entityType: 'user',
    entityId: created.id,
    metadata: { email: created.email, role: created.role },
  })

  return created
}

export async function updateUser(
  actingUserId: string,
  actingRole: UserRole,
  targetUserId: string,
  input: UpdateUserInput,
) {
  const isSelf = targetUserId === actingUserId
  // Any admin user (any role) can update their own profile — most importantly `locale`,
  // their panel language preference (prompt.md §14: "her admin kullanıcısı kendi panel
  // dilini seçer"). Touching another user's record still needs 'admin'.
  if (!isSelf) {
    requireRole(actingRole, 'admin')
  }

  if (input.role !== undefined) {
    requireRole(actingRole, 'owner')
  }
  if (isSelf && input.role !== undefined) {
    throw new ForbiddenError('Cannot change your own role')
  }
  if (isSelf && input.isActive !== undefined) {
    throw new ForbiddenError('Cannot change your own active status')
  }

  const values: Partial<typeof users.$inferInsert> = {
    updatedAt: new Date(),
  }
  if (input.name !== undefined) values.name = input.name
  if (input.role !== undefined) values.role = input.role
  if (input.locale !== undefined) values.locale = input.locale
  if (input.isActive !== undefined) values.isActive = input.isActive
  if (input.password !== undefined) values.passwordHash = await argon2.hash(input.password)

  const [updated] = await db.update(users).set(values).where(eq(users.id, targetUserId)).returning(SAFE_COLUMNS)

  if (!updated) {
    throw new Error('User not found')
  }

  await recordAuditLog({
    userId: actingUserId,
    action: 'user.update',
    entityType: 'user',
    entityId: targetUserId,
    metadata: { fields: Object.keys(input) },
  })

  return updated
}

export async function deleteUser(actingUserId: string, actingRole: UserRole, targetUserId: string) {
  requireRole(actingRole, 'owner')

  if (targetUserId === actingUserId) {
    throw new ForbiddenError('Cannot delete your own account')
  }

  const remainingOwners = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.role, 'owner'), ne(users.id, targetUserId)))

  const [target] = await db.select().from(users).where(eq(users.id, targetUserId)).limit(1)
  if (target?.role === 'owner' && remainingOwners.length === 0) {
    throw new ForbiddenError('Cannot delete the last remaining owner')
  }

  await db.delete(users).where(eq(users.id, targetUserId))

  await recordAuditLog({
    userId: actingUserId,
    action: 'user.delete',
    entityType: 'user',
    entityId: targetUserId,
  })
}
