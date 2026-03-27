import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "../index.js";
import { NewRefreshToken, refreshTokens, users } from "../schema.js";
import { NotFoundError } from "../../api/types/class_errors.js";


export async function saveRefreshToken(newRefreshToken: NewRefreshToken) {
    const [result] = await db
      .insert(refreshTokens)
      .values(newRefreshToken)
      .onConflictDoNothing()
      .returning()
    return result
};

export async function getUserForRefreshToken(token: string) {
  const [result] = await db
  .select({ user: users})
  .from(users)
  .innerJoin(refreshTokens,  eq(users.id, refreshTokens.userId))
  .where(
    and(
      eq(refreshTokens.token, token),
      isNull(refreshTokens.revokedAt),
      gt(refreshTokens.expiresAt, new Date()),
    ),
  )
  .limit(1);
  
  return result
};

export async function revokeRefreshToken(refreshTokenToRevoke: string) {
  const tokenModified = await db
  .update(refreshTokens)
  .set({ 
    revokedAt: new Date(Date.now()) 
  })
  .where(eq(refreshTokens.token, refreshTokenToRevoke))
  .returning()
  if (tokenModified.length === 0) {
    throw new NotFoundError("Could not revoke token: not found");
  };
}