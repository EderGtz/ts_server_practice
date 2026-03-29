import { Response, Request } from "express";

import { BadRequestError, InternalServerError, UserNotAuthenticatedError } from "./api/types/class_errors.js";
import { validateJWT } from "./auth.js";
import { config } from "./config.js";

export async function respondWithError(res: Response, errorCode: number, errorMsg: string) {
    respondWithJSON(res, errorCode, { error: errorMsg })
}

export async function respondWithJSON(res: Response, code: number, payload?: any) {
    res.header("Content-Type", "application/json");
    const body = JSON.stringify(payload);
    res.status(code).send(body)
}

/**
 * Verify auth information coming in the header, like this
 * 
 * Bearer TOKEN_STRING
 */
export function getBearerToken(req: Request): string {
    const tokenHeader = req.get("Authorization");
    if (!tokenHeader) {
        throw new UserNotAuthenticatedError("Malformed authorization header");
    };
    return extractBearerToken(tokenHeader);
};

export function extractBearerToken(header: string) {
    const splitHeader = header.split(" ");
    if (splitHeader.length < 2 || splitHeader[0] !== "Bearer") {
        throw new UserNotAuthenticatedError("Malformed authorization header");
    };
    return splitHeader[1];
};

export function getAuthenticatedUserId(req: Request): string {
    return validateJWT(getBearerToken(req), config.jwt.secret)
};

export function validateRequiredFields(fields: Record<string, unknown>) {
    const hasMissingField = Object.values(fields).some(
        (value) => value === undefined || value === null
    );
    if (hasMissingField) {
        throw new BadRequestError("Missing requiered fields");
    };
};

export function ensureResourceCreated<T>(
    resource: T | undefined,
    message: string
): T {
    if (!resource) {
        throw new InternalServerError(message);
    }

    return resource;
}