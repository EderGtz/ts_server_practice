import { Request, Response } from "express";

import { NewUser, UserCreated } from "../db/schema.js";
import { config } from "../config.js";
import { saveRefreshToken } from "../db/queries/tokens.js";
import { 
    createUser, 
    editUserByEmail, 
    getUserByEmail, 
    upgradeUserToChirpyRed 
} from "../db/queries/users.js";
import { 
    ensureResourceCreated, 
    getAuthenticatedUserId, 
    respondWithJSON, 
    validateRequiredFields 
} from "../utils.js";
import { 
    BadRequestError, 
    NotFoundError, 
    UserNotAuthenticatedError 
} from "./types/class_errors.js";
import { 
    checkPasswordHash, 
    hashPassword, 
    makeJWT,
    MakeJWTPayload,
    makeRefreshToken
} from "../auth.js";

export type UserResponse = Omit<UserCreated, "hashedPassword">;
type userRequest = {
        password: string;
        email: string;
    };
export type PolkaWebhook = {
    event: "user.upgraded";
    data: {
        userId: string;
    };
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
        isChirpyRed: userCreated.isChirpyRed
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
        refreshToken: refreshToken.token,
        isChirpyRed: userFromDb.isChirpyRed
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
        isChirpyRed: userUpdated.isChirpyRed
    } satisfies UserResponse; 

    respondWithJSON(res, 200, payload)
};

export async function handlerMakeUserChirpyRed(req: Request, res: Response) {
  const parameters: PolkaWebhook = req.body;

  if (parameters.event !== "user.upgraded") {
    respondWithJSON(res, 204);
    return
  };
  validateRequiredFields({userId: parameters.data?.userId});

  const userUpdated = upgradeUserToChirpyRed(parameters.data.userId);
  
  if (!userUpdated) {
    throw new NotFoundError("Could not upgrade the user to chirp red")
  };

  respondWithJSON(res, 204);
};