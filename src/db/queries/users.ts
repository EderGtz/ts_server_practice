import { db } from "../index.js";
import { NewUser, UserCreated, users } from "../schema.js";
import { eq } from "drizzle-orm";

export async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  return result satisfies UserCreated;
};

export async function deleteAllUsers() {
  await db.delete(users);
};

export async function getUserByEmail(email: string) {
  const [result] =  await db.select().from(users).where(eq(users.email, email));
  return result
}

export async function editUserByEmail(userId:string, hashedPassword: string, email: string) {
  const [result] = await db.update(users)
  .set({ 
    email: email,
    hashedPassword: hashedPassword 
  })
  .where(eq(users.id, userId))
  .returning()
  return result satisfies UserCreated;
};