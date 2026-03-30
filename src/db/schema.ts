import { pgTable, timestamp, varchar, uuid, boolean } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
    email: varchar("email", { length: 256 }).unique().notNull(),
    hashedPassword: varchar("hashed_password", { length: 256 })
    .notNull()
    .default("unset"),
    isChirpyRed: boolean("is_chirpy_red").default(false)
});

export const chirps = pgTable("chirps", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
    body: varchar("body", { length: 256 }).notNull(),
    user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" })
});

export const refreshTokens = pgTable("refresh_tokens", {
  token: varchar("token", { length: 256 }).primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  revokedAt: timestamp("revoked_at"),
});

// Shape for **writing** to the db
export type NewUser = typeof users.$inferInsert;
export type NewChirp = typeof chirps.$inferInsert;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;

//Shape for reading to the db
export type UserCreated = typeof users.$inferSelect;
export type ChirpCreated = typeof chirps.$inferSelect;
export type RefreshTokenCreated = typeof refreshTokens.$inferSelect;