import { db } from "../index.js";
import { NewUser, UserCreated, users } from "../schema.js";
import { eq } from "drizzle-orm";

/**
 * Inserts a new user and returns the stored record.
 * Duplicate emails are ignored by the insert conflict rule.
 */
export async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  return result satisfies UserCreated;
};

/**
 * Removes every user from the database.
 * Cascade rules also clean up linked records.
 */
export async function deleteAllUsers() {
  await db.delete(users);
};

/**
 * Looks up a user by email address.
 * This is mainly used during login and duplicate checks.
 */
export async function getUserByEmail(email: string) {
  const [result] =  await db.select().from(users).where(eq(users.email, email));
  return result
}

/**
 * Updates the email and password hash for one user.
 * The user is selected by id, not by the old email value.
 */
export async function editUserByEmail(userId: string, hashedPassword: string, email: string) {
  const [result] = await db
  .update(users)
  .set({ 
    email: email,
    hashedPassword: hashedPassword 
  })
  .where(eq(users.id, userId))
  .returning()
  return result satisfies UserCreated;
};

/**
 * Marks a user as Chirpy Red.
 * The updated record is returned for follow-up checks if needed.
 */
export async function upgradeUserToChirpyRed(userId: string) {
  const [result] = await db
  .update(users)
  .set({
    isChirpyRed: true
  })
  .where(eq(users.id, userId))
  .returning()
  return result
}
