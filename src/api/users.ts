import type { Request, Response } from "express";

import { createUser } from "../db/queries/users.js";
import { respondWithJSON } from "./responses.js";
import { BadRequestError } from "./types/class_errors.js";


export async function handlerCreateUser(req: Request, res: Response) {
    type params = {
        email: string;
    };
    const parameters: params = req.body;

    if (!parameters.email) {
        throw new BadRequestError("Missing required fields");
    };
    const userMail = parameters.email;
    
    const userCreated = await createUser({ email: userMail });
    
    if (!userCreated) {
        throw new Error("Could not create user");
    };

    const payload = {

        id: userCreated.id,
        email: userCreated.email,
        createdAt: userCreated.createdAt,
        updatedAt: userCreated.updatedAt,
    }; 
    respondWithJSON(res, 201, payload)
}