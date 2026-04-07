import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "../index.js";
import { NewRefreshToken, refreshTokens, users } from "../schema.js";
import { NotFoundError } from "../../api/types/class_errors.js";


/**
 * Stores a refresh token linked to a user.
 * The created token row is returned for the login response.
 */
export async function saveRefreshToken(newRefreshToken: NewRefreshToken) {
    const [result] = await db
      .insert(refreshTokens)
      .values(newRefreshToken)
      .onConflictDoNothing()
      .returning()
    return result
};

/**
 * Resolves the user behind a refresh token when it is still valid.
 * Revoked or expired tokens are filtered out at query time.
 */
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

/**
 * Marks a refresh token as revoked.
 * A missing token becomes a not-found error for the caller.
 */
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
