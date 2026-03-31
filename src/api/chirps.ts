import type { Request, Response } from "express";

import { InternalServerError, NotFoundError, UserForbiddenError } from "./types/class_errors.js";
import { createChirp, deleteSingleChirp, getAllChirps, getChirpsByAuthor, getSingleChirp } from "../db/queries/chirps.js";
import { 
  getAuthenticatedUserId, 
  respondWithJSON, 
  validateChirp, 
  validateRequiredFields 
} from "../utils.js";
import { ChirpCreated } from "src/db/schema.js";

interface params {
  body: string;
}

export async function handlerGetChirps(req: Request, res: Response) {
  
  let chirpsToReturn; 
  let authorId = "";
  let authorIdQuery = req.query.authorId;
  if (typeof authorIdQuery === "string") {
    authorId = authorIdQuery;
  };

  if (authorId) {
    chirpsToReturn = await getChirpsByAuthor(authorId);
  } else {
    chirpsToReturn = await getAllChirps()
  };

  respondWithJSON(res, 200, chirpsToReturn)
};

export async function handlerGetSingleChirp(req: Request, res: Response, chirpId: string[]) {

  const chirp = await getSingleChirp(chirpId[0])
  if (!chirp) {
    throw new NotFoundError(`Chirp with ID ${chirpId} not found`);
  };

  respondWithJSON(res, 200, chirp);
};

export async function handlerCreateChirp(req: Request, res: Response) {
  const parameters: params = req.body
  validateRequiredFields({ body: parameters.body });
  const userId = getAuthenticatedUserId(req);

  const chirp = parameters.body;
  const validChirp = validateChirp(chirp);
  const chirpCreated = await createChirp({
    body: validChirp, 
    user_id: userId
  });

  if (!chirpCreated) {
    throw new InternalServerError("Could not create chirp");
  };

  const payload = {
    id: chirpCreated.id,
    body: chirpCreated.body,
    userId: chirpCreated.user_id,
    createdAt: chirpCreated.createdAt,
    updatedAt: chirpCreated.updatedAt
  }
  respondWithJSON(res, 201, payload)
};

export async function handlerDeleteChirp(req: Request, res: Response) {
  const chirpId = req.params.chirpId as string;
  const userId = getAuthenticatedUserId(req);

  const chirp = await getSingleChirp(chirpId)
  if (!chirp) {
    throw new NotFoundError(`Chirp with ID ${chirpId} not found`);
  };

  if (chirp.user_id !== userId) {
    throw new UserForbiddenError("Given user is not the author of the chirp");
  };

  const deleted = await deleteSingleChirp(chirpId);
  if (!deleted) {
    throw new Error(`Failed to delete chirp with chirpId: ${chirpId}`);
  }

  respondWithJSON(res, 204)
};