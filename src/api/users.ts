import type { Request, Response } from "express";

import { createUser, getUserByEmail } from "../db/queries/users.js";
import { respondWithError, respondWithJSON } from "./responses.js";
import { BadRequestError, UserNotAuthenticatedError } from "./types/class_errors.js";
import { checkPasswordHash, hashPassword } from "../auth.js";
import { NewUser } from "src/db/schema.js";


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
        throw new Error("Could not create user");
    };

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
    };
    const parameters: loginUserParams = req.body;

    if (!parameters.password || !parameters.email) {
        throw new BadRequestError("Missing required fields");
    }

    const userFromDb = await getUserByEmail(parameters.email);
    if (!userFromDb) {
        throw new UserNotAuthenticatedError("incorrect email or password");
    }

    const passwordVerified = await checkPasswordHash(
        parameters.password, 
        userFromDb!.hashed_password
    );
    if (!passwordVerified) {
        throw new UserNotAuthenticatedError("incorrect email or password");
    }
    const payload = {
        id: userFromDb!.id,
        email: userFromDb!.email,
        createdAt: userFromDb!.created_at,
        updatedAt: userFromDb!.updated_at,
    }; 
    respondWithJSON(res, 200, payload)
}