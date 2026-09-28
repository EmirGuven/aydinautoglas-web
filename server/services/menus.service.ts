import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { menuItems, menus } from '../db/schema'
import type { MenuItemInput, MenuLocation } from '../../shared/schemas/menus'

export interface MenuItemNode {
  id: string
  menuId: string
  parentId: string | null
  label: Record<string, string>
  linkType: string
  linkValue: string
  sortOrder: number
  children: MenuItemNode[]
}

async function getOrCreateMenu(location: MenuLocation) {
  const [existing] = await db.select().from(menus).where(eq(menus.location, location)).limit(1)
  if (existing) return existing

  const [created] = await db.insert(menus).values({ location }).returning()
  if (!created) throw new Error('Menu insert did not return a row')
  return created
}

function buildTree(items: (typeof menuItems.$inferSelect)[]): MenuItemNode[] {
  const nodes = new Map<string, MenuItemNode>(items.map((item) => [item.id, { ...item, children: [] }]))
  const roots: MenuItemNode[] = []

  for (const node of nodes.values()) {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  const sortRec = (list: MenuItemNode[]) => {
    list.sort((a, b) => a.sortOrder - b.sortOrder)
    list.forEach((n) => sortRec(n.children))
  }
  sortRec(roots)

  return roots
}

export async function getMenuTree(location: MenuLocation): Promise<MenuItemNode[]> {
  const menu = await getOrCreateMenu(location)
  const items = await db.select().from(menuItems).where(eq(menuItems.menuId, menu.id))
  return buildTree(items)
}

export async function createMenuItem(location: MenuLocation, input: MenuItemInput) {
  const menu = await getOrCreateMenu(location)
  const siblingCount = await db.select().from(menuItems).where(eq(menuItems.menuId, menu.id))

  const [created] = await db
    .insert(menuItems)
    .values({
      menuId: menu.id,
      label: input.label,
      linkType: input.linkType,
      linkValue: input.linkValue,
      parentId: input.parentId ?? null,
      sortOrder: siblingCount.length,
    })
    .returning()

  if (!created) throw new Error('Menu item insert did not return a row')
  return created
}

export async function updateMenuItem(id: string, input: Partial<MenuItemInput>) {
  const values: Partial<typeof menuItems.$inferInsert> = {}
  if (input.label !== undefined) values.label = input.label
  if (input.linkType !== undefined) values.linkType = input.linkType
  if (input.linkValue !== undefined) values.linkValue = input.linkValue
  if (input.parentId !== undefined) values.parentId = input.parentId

  const [updated] = await db.update(menuItems).set(values).where(eq(menuItems.id, id)).returning()
  if (!updated) throw new Error('Menu item not found')
  return updated
}

export async function deleteMenuItem(id: string) {
  await db.delete(menuItems).where(eq(menuItems.id, id))
}

export async function reorderMenuItems(updates: { id: string; parentId: string | null; sortOrder: number }[]) {
  await Promise.all(
    updates.map((update) =>
      db.update(menuItems).set({ parentId: update.parentId, sortOrder: update.sortOrder }).where(eq(menuItems.id, update.id)),
    ),
  )
}
