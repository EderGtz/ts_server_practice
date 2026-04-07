import { Response, Request } from "express";

import { BadRequestError, InternalServerError, UserNotAuthenticatedError } from "./api/types/class_errors.js";
import { validateJWT } from "./auth.js";
import { config } from "./config.js";

/**
 * Sends a JSON error response with a consistent `{ error }` shape.
 * This keeps error payloads uniform across the API.
 */
export async function respondWithError(res: Response, errorCode: number, errorMsg: string) {
    respondWithJSON(res, errorCode, { error: errorMsg })
}

/**
 * Serializes a payload as JSON and writes it to the response.
 * All successful handlers use this helper for consistent output.
 */
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

/**
 * Reads an API key from the Authorization header.
 * The expected format is `ApiKey <token>`.
 */
export function getAPIKey(req: Request) {
    const apiTokenHeader = req.get("Authorization");
    if (!apiTokenHeader) {
        throw new UserNotAuthenticatedError("Malformed authorization header");
    };
    return extractAuthToken(apiTokenHeader, "ApiKey")
};

/**
 * Extracts the token value from an authorization header.
 * It also validates the expected auth scheme prefix.
 */
export function extractAuthToken(header: string, tokenString: string) {
    const splitHeader = header.split(" ");
    if (splitHeader.length < 2 || splitHeader[0] !== tokenString) {
        throw new UserNotAuthenticatedError("Malformed authorization header");
    };
    return splitHeader[1];
};

/**
 * Resolves the current user id from a bearer token.
 * This is the shared auth gate for protected endpoints.
 */
export function getAuthenticatedUserId(req: Request): string {
    return validateJWT(getBearerToken(req), config.jwt.secret)
};

/**
 * Ensures a request body includes every required field.
 * Missing or null values are rejected as bad requests.
 */
export function validateRequiredFields(fields: Record<string, unknown>) {
    const hasMissingField = Object.values(fields).some(
        (value) => value === undefined || value === null
    );
    if (hasMissingField) {
        throw new BadRequestError("Missing required fields");
    };
};

/**
 * Guarantees a created resource exists before continuing.
 * If a write returned nothing, this converts it into a server error.
 */
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

/**
 * Validates chirp length and replaces banned words.
 * The sanitized chirp is returned for storage and response payloads.
 */
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
