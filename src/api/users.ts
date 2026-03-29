import type { Request, Response } from "express";

import { createUser, editUserByEmail, getUserByEmail } from "../db/queries/users.js";
import { ensureResourceCreated, getAuthenticatedUserId, respondWithError, respondWithJSON, validateRequiredFields } from "../utils.js";
import { BadRequestError, UserNotAuthenticatedError } from "./types/class_errors.js";
import { NewUser, UserCreated } from "../db/schema.js";
import { 
    checkPasswordHash, 
    hashPassword, 
    makeJWT,
    MakeJWTPayload,
    makeRefreshToken
} from "../auth.js";
import { config } from "../config.js";
import { saveRefreshToken } from "../db/queries/tokens.js";

export type UserResponse = Omit<UserCreated, "hashedPassword">;
type userRequest = {
        password: string;
        email: string;
    };

export async function handlerUsersCreate(req: Request, res: Response) {
    type createUserParams = {
        email: string;
        password: string;
    };
    const parameters: createUserParams = req.body;
    validateRequiredFields(parameters);

    const hashedPassword = await hashPassword(parameters.password);
    
    const userCreated = await createUser({
         email: parameters.email,
         hashedPassword: hashedPassword
        } satisfies NewUser);

    if (!userCreated) {
        throw new BadRequestError("Email already in use");
    }

    const payload = {
        id: userCreated.id,
        email: userCreated.email,
        createdAt: userCreated.createdAt,
        updatedAt: userCreated.updatedAt,
    } satisfies UserResponse; 
    respondWithJSON(res, 201, payload)
}

export async function handlerUserLogin(req: Request, res: Response) {

    const parameters: userRequest = req.body;
    validateRequiredFields(parameters)

    const userFromDb = await getUserByEmail(parameters.email);
    if (!userFromDb) {
        throw new UserNotAuthenticatedError("incorrect email or password");
    }

    const passwordVerified = await checkPasswordHash(
        parameters.password, 
        userFromDb.hashedPassword
    );
    if (!passwordVerified) {
        throw new UserNotAuthenticatedError("incorrect email or password");
    }

    const jwtPayload: MakeJWTPayload = {
        userId: userFromDb.id,
        expiresInSeconds: config.jwt.defaultDuration,
        secretKey: config.jwt.secret
    };
    const jwtToken = makeJWT(jwtPayload);

    const randomBufToken = makeRefreshToken();
    const refreshToken = ensureResourceCreated( await saveRefreshToken({
        token: randomBufToken,
        userId: userFromDb.id,
        expiresAt: config.jwt.defaultDurationRefreshToken,
        revokedAt: null
    }), "Could not save refresh token" );

    const payload = {
        id: userFromDb.id,
        email: userFromDb.email,
        createdAt: userFromDb.createdAt,
        updatedAt: userFromDb.updatedAt,
        token: jwtToken,
        refreshToken: refreshToken.token
    }; 
    respondWithJSON(res, 200, payload);
}

export async function handlerUserUpdate(req: Request, res: Response) {
    const parameters: userRequest = req.body;
    validateRequiredFields(parameters);

    const userId = getAuthenticatedUserId(req);
    const hashedPassword = await hashPassword(parameters.password);

    const userUpdated = await editUserByEmail(userId, hashedPassword, parameters.email);

    const payload = {
        id: userUpdated.id,
        email: userUpdated.email,
        createdAt: userUpdated.createdAt,
        updatedAt: userUpdated.updatedAt,
    } satisfies UserResponse; 

    respondWithJSON(res, 200, payload)
};