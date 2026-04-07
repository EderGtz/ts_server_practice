import type { Request, Response } from "express";

import { InternalServerError, NotFoundError, UserForbiddenError } from "./types/class_errors.js";
import { createChirp, deleteSingleChirp, getAllChirps, getChirpsByAuthor, getSingleChirp } from "../db/queries/chirps.js";
import { 
  getAuthenticatedUserId, 
  respondWithJSON, 
  validateChirp, 
  validateRequiredFields 
} from "../utils.js";

interface params {
  body: string;
}

/**
 * Returns the chirp feed, optionally filtered by author or sort order.
 * Query params control whether the full feed or one author's chirps are returned.
 */
export async function handlerGetChirps(req: Request, res: Response) {
  
  let chirpsToReturn; 
  let authorId = "";
  let sortOrder = req.query.sort;
  let authorIdQuery = req.query.authorId;
  if (typeof authorIdQuery === "string") {
    authorId = authorIdQuery;
  };

  if (authorId) {
    chirpsToReturn = await getChirpsByAuthor(authorId);
  } else if (typeof sortOrder === "string") {
    chirpsToReturn = await getAllChirps(sortOrder);
  } else {
    chirpsToReturn = await getAllChirps();
  };

  respondWithJSON(res, 200, chirpsToReturn)
};

/**
 * Looks up a single chirp by id.
 * A missing chirp is converted into a 404 response.
 */
export async function handlerGetSingleChirp(req: Request, res: Response, chirpId: string[]) {

  const chirp = await getSingleChirp(chirpId[0])
  if (!chirp) {
    throw new NotFoundError(`Chirp with ID ${chirpId} not found`);
  };

  respondWithJSON(res, 200, chirp);
};

/**
 * Creates a chirp for the authenticated user.
 * The body is validated and sanitized before insertion.
 */
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

/**
 * Deletes a chirp only if the caller owns it.
 * This protects chirps from being removed by other users.
 */
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
