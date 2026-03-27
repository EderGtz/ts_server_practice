import { db } from "../index.js";
import { chirps, NewChirp } from "../schema.js";
import { asc, eq } from 'drizzle-orm';

export async function createChirp(chirp: NewChirp) {
  const [result] = await db
    .insert(chirps)
    .values(chirp)
    .onConflictDoNothing()
    .returning();
   return result
};

export async function getAllChirps() {
  return await db.select().from(chirps).orderBy(asc(chirps.createdAt));
}

export async function deleteAllChirps() {
    await db.delete(chirps);
}

export async function getSingleChirp(chirpId: string) {
  const rows =  await db.select().from(chirps).where(eq(chirps.id, chirpId));

  if (rows.length === 0) return
  return rows[0]
};