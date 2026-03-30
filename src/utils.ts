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
    return extractAuthToken(tokenHeader, "Bearer");
};

export function getAPIKey(req: Request) {
    const apiTokenHeader = req.get("Authorization");
    if (!apiTokenHeader) {
        throw new UserNotAuthenticatedError("Malformed authorization header");
    };
    return extractAuthToken(apiTokenHeader, "ApiKey")
};

export function extractAuthToken(header: string, tokenString: string) {
    const splitHeader = header.split(" ");
    if (splitHeader.length < 2 || splitHeader[0] !== tokenString) {
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
        throw new BadRequestError("Missing required fields");
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

const notAdmitedWords = ["kerfuffle", "sharbert", "fornax"]

export function validateChirp(chirpString: string) {
  const maxChirpLength = 140;
  if (chirpString.length > maxChirpLength) {
    throw new BadRequestError("Chirp is too long. Max length is 140");
  }

  const splittedBody = chirpString.split(" ")
  let final = [];
  for (let word of splittedBody) {
    if (notAdmitedWords.includes(word.toLocaleLowerCase())) {
      word = "****"
    }; 
    final.push(word)
  };
  return final.join(" ")
};