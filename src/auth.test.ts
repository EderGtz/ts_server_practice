import { describe, it, expect, beforeAll } from "vitest";
import { checkPasswordHash, hashPassword, makeJWT, MakeJWTPayload, validateJWT } from "./auth";
import { BadRequestError, UserNotAuthenticatedError } from "./api/types/class_errors";
import { extractAuthToken } from "./utils";

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  }); 

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });

  it("should return false for an incorrect password", async () => {
    const result = await checkPasswordHash("wrongPassword", hash1);
    expect(result).toBe(false);
  });

  it("should return false when password doesn't match a different hash", async () => {
    const result = await checkPasswordHash(password1, hash2);
    expect(result).toBe(false);
  });

  it("should return false for an empty password", async () => {
    const result = await checkPasswordHash("", hash1);
    expect(result).toBe(false);
  });
});

describe("JWT Generation and Verification", () => {

  const payloadCreationJwt: MakeJWTPayload = {
    userId: "25",
    expiresInSeconds: 10,
    secretKey: "Garbage-Myspace-Sagging-Rambling-Unpainted"
  };
  let validJwtToken: string;

  beforeAll(() => {
    validJwtToken = makeJWT(payloadCreationJwt);
  });


  it("Should varify a valid JWT string key", () => {
    expect(validJwtToken).toBeTypeOf("string");
    expect(validJwtToken.length).toBeGreaterThan(0);
  });

  it("Should return user ID 25, validating the JWT just created", () => {
    const result = validateJWT(validJwtToken, payloadCreationJwt.secretKey);
    console.log(result);
    expect(result).toBeTypeOf("string");
    expect(result).toBe(payloadCreationJwt.userId);
  });

  it("Should throw an error for an invalid token string", () => {
    expect(() => validateJWT("invalid.token.string", payloadCreationJwt.secretKey)).toThrow(
      UserNotAuthenticatedError,
    );
  });

  it("Should throw an error when the token is signed with a wrong secret", () => {
    expect(() => validateJWT(validJwtToken, "wrong_secret")).toThrow(
      UserNotAuthenticatedError,
    );
  });

});

describe("Extract bearer token from headers", () => {
  it("Should extract the token from a valid header", () => {
    const token = "secretToken";
    const header = `Bearer ${token}`;
    expect(extractAuthToken(header, "Bearer")).toBe(token);
  });

  it("should extract the token even if there are extra parts", () => {
    const token = "mySecretToken";
    const header = `Bearer ${token} extra-data`;
    expect(extractAuthToken(header, "Bearer")).toBe(token);
  });

  it("should throw a UserNotAuthenticatedError if the header does not contain at least two parts", () => {
    const header = "Bearer";
    expect(() => extractAuthToken(header, "Bearer")).toThrow(UserNotAuthenticatedError);
  });

  it('should throw a UserNotAuthenticatedError if the header does not start with "Bearer"', () => {
    const header = "Basic mySecretToken";
    expect(() => extractAuthToken(header, "Bearer")).toThrow(UserNotAuthenticatedError);
  });

  it("should throw a UserNotAuthenticatedError if the header is an empty string", () => {
    const header = "";
    expect(() => extractAuthToken(header, "Bearer")).toThrow(UserNotAuthenticatedError);
  });

});