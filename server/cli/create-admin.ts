import { createInterface } from 'node:readline/promises'
import argon2 from 'argon2'
import { createUserSchema } from '../../shared/schemas/users'
import { db, pool } from '../db/client'
import { users } from '../db/schema'

function parseArg(name: string): string | undefined {
  const prefix = `--${name}=`
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length)
}

async function prompt(rl: ReturnType<typeof createInterface>, question: string): Promise<string> {
  return (await rl.question(question)).trim()
}

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout })

  const email = parseArg('email') ?? (await prompt(rl, 'Email: '))
  const name = parseArg('name') ?? (await prompt(rl, 'Name: '))
  const password = parseArg('password') ?? (await prompt(rl, 'Password (min 10 chars): '))
  const role = (parseArg('role') ?? 'owner') as 'owner' | 'admin' | 'editor'

  rl.close()

  const input = createUserSchema.parse({ email, name, password, role })
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
    .returning({ id: users.id, email: users.email })

  if (!created) {
    throw new Error('User insert did not return a row')
  }

  console.log(`Admin user created: ${created.email} (${created.id})`)
  await pool.end()
}

main().catch((error) => {
  console.error('Failed to create admin user:', error)
  process.exit(1)
})
