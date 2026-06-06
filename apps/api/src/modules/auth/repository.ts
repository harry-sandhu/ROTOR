import { eq } from "drizzle-orm";

import { users, type DbClient, type NewUser } from "@rotor/db";

export async function findUserByEmail(db: DbClient, email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user;
}

export async function findUserById(db: DbClient, userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return user;
}

export async function createUser(db: DbClient, input: NewUser) {
  const [user] = await db.insert(users).values(input).returning();
  return user;
}
