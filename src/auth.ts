import { Request } from "express";
import { hash, verify } from "argon2";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { BadRequestError, UserNotAuthenticatedError } from "./api/types/class_errors.js";

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
 * Verify auth information coming in the header, like this
 * 
 * Bearer TOKEN_STRING
 */
export function getBearerToken(req: Request): string {
    const tokenHeader = req.get("Authorization");
    if (!tokenHeader) {
        throw new BadRequestError("Malformed authorization header");
    };
    return extractBearerToken(tokenHeader);
};

export function extractBearerToken(header: string) {
    const splitHeader = header.split(" ");
    if (splitHeader.length < 2 || splitHeader[0] !== "Bearer") {
        throw new BadRequestError("Malforme authorization header");
    };
    return splitHeader[1];
};