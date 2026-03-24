import type { Request, Response } from "express";

import { createUser, getUserByEmail } from "../db/queries/users.js";
import { respondWithJSON } from "./responses.js";
import { BadRequestError, UserNotAuthenticatedError } from "./types/class_errors.js";
import { NewUser } from "../db/schema.js";
import { 
    checkPasswordHash, 
    hashPassword, 
    makeJWT,
    MakeJWTPayload
} from "../auth.js";
import { config } from "../config.js";

export async function handlerCreateUser(req: Request, res: Response) {
    type createUserParams = {
        email: string;
        password: string;
    };
    const parameters: createUserParams = req.body;

    if (!parameters.email || !parameters.password) {
        throw new BadRequestError("Missing required fields");
    };

    const hashedPassword = await hashPassword(parameters.password);
    
    const userCreated = await createUser({
         email: parameters.email,
         hashed_password: hashedPassword
        } satisfies NewUser);

    if (!userCreated) {
        throw new BadRequestError("Email already in use");
    }

    const payload = {
        id: userCreated.id,
        email: userCreated.email,
        createdAt: userCreated.created_at,
        updatedAt: userCreated.updated_at,
    }; 
    respondWithJSON(res, 201, payload)
}

export async function handlerUserLogin(req: Request, res: Response) {
    type loginUserParams = {
        password: string;
        email: string;
        expiresInSeconds?: number;
    };
    const parameters: loginUserParams = req.body;
    
    const userFromDb = await getUserByEmail(parameters.email);
    if (!userFromDb) {
        throw new UserNotAuthenticatedError("incorrect email or password");
    }
    let duration = config.jwt.defaultDuration;
    if (parameters.expiresInSeconds && parameters.expiresInSeconds < duration) {
        duration = parameters.expiresInSeconds;
    };
    if (!parameters.password || !parameters.email) {
        throw new BadRequestError("Missing required fields");
    }

    const passwordVerified = await checkPasswordHash(
        parameters.password, 
        userFromDb!.hashed_password
    );
    if (!passwordVerified) {
        throw new UserNotAuthenticatedError("incorrect email or password");
    }

    const jwtPayload: MakeJWTPayload = {
        userId: userFromDb.id,
        expiresInSeconds: duration,
        secretKey: config.jwt.secret
    };
    const jwtToken = makeJWT(jwtPayload);

    const payload = {
        id: userFromDb!.id,
        email: userFromDb!.email,
        createdAt: userFromDb!.created_at,
        updatedAt: userFromDb!.updated_at,
        token: jwtToken
    }; 
    respondWithJSON(res, 200, payload);
}