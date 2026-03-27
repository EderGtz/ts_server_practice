import { hash, verify } from "argon2";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { UserNotAuthenticatedError } from "./api/types/class_errors.js";
import { randomBytes } from "node:crypto";

const TOKEN_ISSUER = "chirpy";
type Payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;
export type MakeJWTPayload = {
    userId: string;
    expiresInSeconds: number, 
    secretKey: string
};
/**
 * iss - issuer of the token (chirpy)
 * sub - subjet of the token (user id)
 * iat - time token was issued in seconds
 * exp - time the token expires
 */

export async function hashPassword(password: string): Promise<string> {
    return await hash(password)
}

export async function checkPasswordHash(password: string, hash: string): Promise <boolean> {
    return await verify(hash, password)
}


export function makeJWT(payload: MakeJWTPayload): string {

    const createdAtSeconds = Math.floor(Date.now() / 1000);
    const expiresAtSeconds = createdAtSeconds + payload.expiresInSeconds;
    const jwtPayload: Payload = {
        iss: TOKEN_ISSUER,
        sub: payload.userId,
        iat: createdAtSeconds,
        exp: expiresAtSeconds
    };

    return jwt.sign(jwtPayload, payload.secretKey)
}

/**
 * Returns user ID stored in the JWT token given if exist
 */
export function validateJWT(
    tokenString: string, 
    secretKey: string
): string {
    let decoded: Payload;
    try{
        decoded =  jwt.verify(tokenString, secretKey) as Payload;
    } catch (error: any) {
        throw new UserNotAuthenticatedError("Token has expired or is invalid")
    };

    if (decoded.iss !== TOKEN_ISSUER) {
        throw new UserNotAuthenticatedError(`Invalid Issuer: ${decoded.iss}`);
    }

    if (!decoded.sub) {
        throw new UserNotAuthenticatedError("No user ID in token");
    };

    return decoded.sub 
}

/**
 * Generate a random 256-bit (32-byte) hex-encoded string
 */
export function makeRefreshToken(): string {
    return randomBytes(32).toString('hex')
};