import { index, pgTable, text, timestamp, uuid, uniqueIndex } from "drizzle-orm/pg-core";

export const userRoleValues = ["USER", "ADMIN"] as const;
export type UserRole = (typeof userRoleValues)[number];

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    displayName: text("display_name").notNull(),
    role: text("role").$type<UserRole>().notNull().default("USER"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("users_email_unique_idx").on(table.email), index("users_role_idx").on(table.role)],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
