import { relations, sql } from "drizzle-orm"
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

import { users } from "@/lib/database/better-auth"

const stuffs = pgTable("stuffs", {
  uuid: uuid("uuid")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  description: text("description").notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .default(sql`now()`)
    .notNull(),
})

type StuffSelect = typeof stuffs.$inferSelect
type StuffInsert = typeof stuffs.$inferInsert

const stuffsRelations = relations(stuffs, ({ one }) => {
  return {
    user: one(users, {
      fields: [stuffs.userId],
      references: [users.id],
    }),
  }
})

export { stuffs, stuffsRelations, type StuffInsert, type StuffSelect }
