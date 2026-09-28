import argon2 from 'argon2'
import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { users } from '../db/schema'
import type { LoginInput } from '../../shared/schemas/users'

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password')
  }
}

export async function login(input: LoginInput) {
  const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1)

  if (!user || !user.isActive) {
    throw new InvalidCredentialsError()
  }

  const passwordValid = await argon2.verify(user.passwordHash, input.password)
  if (!passwordValid) {
    throw new InvalidCredentialsError()
  }

  return user
}

export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  return user
}
