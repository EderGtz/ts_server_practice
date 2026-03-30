import type { Request, Response } from "express";
import { UserNotAuthenticatedError } from "./types/class_errors.js";
import { extractAuthToken, getBearerToken, respondWithJSON } from "../utils.js";
import { getUserForRefreshToken, revokeRefreshToken } from "../db/queries/tokens.js";
import { makeJWT, MakeJWTPayload } from "../auth.js";
import { config } from "../config.js";

export async function handlerRefreshToken(req: Request, res: Response) {
    const tokenExtracted = getBearerToken(req);
    const userForRefreshToken = await getUserForRefreshToken(tokenExtracted);
    if (!userForRefreshToken) {
        throw new UserNotAuthenticatedError("Invalid refresh token");
    };
    const jwtPayload: MakeJWTPayload = {
        userId: userForRefreshToken.user.id,
        expiresInSeconds: config.jwt.defaultDuration,
        secretKey: config.jwt.secret
    }
    const newJwtToken = makeJWT(jwtPayload)
    respondWithJSON(res, 200, { token: newJwtToken });
};

export async function handlerRevokeRefreshToken(req: Request, res: Response) {
    const tokenHeader = req.get("Authorization");
    if (!tokenHeader) {
        throw new UserNotAuthenticatedError("Malformed authorization header");
    };
    const tokenExtracted = extractAuthToken(tokenHeader, "Bearer");
    await revokeRefreshToken(tokenExtracted);
    respondWithJSON(res, 204)
};