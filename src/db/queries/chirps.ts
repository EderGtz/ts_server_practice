import { db } from "../index.js";
import { ChirpCreated, chirps, NewChirp } from "../schema.js";
import { asc, desc, eq } from 'drizzle-orm';

export async function createChirp(chirp: NewChirp): Promise<ChirpCreated> {
  const [result] = await db
    .insert(chirps)
    .values(chirp)
    .onConflictDoNothing()
    .returning();
   return result
};

export async function getAllChirps(sortOrder?: string): Promise<ChirpCreated[]> {
  if (sortOrder === "desc") {
      return await db
        .select()
        .from(chirps)
        .orderBy(desc(chirps.createdAt));
  };

  return await db
  .select()
  .from(chirps)
  .orderBy(asc(chirps.createdAt));
};

export async function getSingleChirp(chirpId: string) {
  const rows =  await db
  .select()
  .from(chirps)
  .where(eq(chirps.id, chirpId));

  if (rows.length === 0) return
  return rows[0]
};

export async function getChirpsByAuthor(authorId: string){
  const rows = await db
  .select()
  .from(chirps)
  .where(eq(chirps.user_id, authorId))

  if (rows.length === 0) return
  return rows
};

export async function deleteAllChirps() {
    await db.delete(chirps);
};

export async function deleteSingleChirp(chirpId: string) {
  const rows = await db
  .delete(chirps)
  .where(eq(chirps.id, chirpId))
  .returning();
   return rows.length > 0;
};