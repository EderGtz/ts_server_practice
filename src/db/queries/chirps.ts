import { db } from "../index.js";
import { ChirpCreated, chirps, NewChirp } from "../schema.js";
import { asc, desc, eq } from 'drizzle-orm';

/**
 * Inserts a new chirp row and returns the created record.
 * Conflicts are ignored, so callers should handle an empty result.
 */
export async function createChirp(chirp: NewChirp): Promise<ChirpCreated> {
  const [result] = await db
    .insert(chirps)
    .values(chirp)
    .onConflictDoNothing()
    .returning();
   return result
};

/**
 * Fetches the chirp feed ordered by creation time.
 * Pass `desc` to show newest chirps first.
 */
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

/**
 * Retrieves one chirp by its id.
 * Undefined is returned when no row matches.
 */
export async function getSingleChirp(chirpId: string) {
  const rows =  await db
  .select()
  .from(chirps)
  .where(eq(chirps.id, chirpId));

  if (rows.length === 0) return
  return rows[0]
};

/**
 * Fetches all chirps written by a specific user.
 * Undefined is returned when that author has no chirps yet.
 */
export async function getChirpsByAuthor(authorId: string){
  const rows = await db
  .select()
  .from(chirps)
  .where(eq(chirps.user_id, authorId))

  if (rows.length === 0) return
  return rows
};

/**
 * Deletes every chirp in the table.
 * This is used by the development reset flow.
 */
export async function deleteAllChirps() {
    await db.delete(chirps);
};

/**
 * Deletes a single chirp by id.
 * Returns true when a row was actually removed.
 */
export async function deleteSingleChirp(chirpId: string) {
  const rows = await db
  .delete(chirps)
  .where(eq(chirps.id, chirpId))
  .returning();
   return rows.length > 0;
};
