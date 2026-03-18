import { pgTable, timestamp, varchar, uuid } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
    email: varchar("email", { length: 256 }).unique().notNull(),
});

export const chirps = pgTable("chirps", {
    id: uuid("id").primaryKey().defaultRandom(),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
    body: varchar("body", { length: 256 }).notNull(),
    user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" })
});

// Shape for **writing** to the db
export type NewUser = typeof users.$inferInsert;
export type NewChirp = typeof chirps.$inferInsert;

// Shape for **reading** from db
//export type UserCreated = typeof users.$inferSelect;
//export type ChirpCreated = typeof chirps.$inferSelect;