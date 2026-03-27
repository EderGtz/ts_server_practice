import type { Request, Response } from "express";

import { BadRequestError, InternalServerError, NotFoundError } from "./types/class_errors.js";
import { createChirp, getAllChirps, getSingleChirp } from "../db/queries/chirps.js";
import { 
  getAuthenticatedUserId, 
  respondWithJSON, 
  validateRequiredFields 
} from "../utils.js";

interface params {
  body: string;
}

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

const notAdmitedWords = ["kerfuffle", "sharbert", "fornax"]

function validateChirp(chirpString: string) {
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

export async function handlerGetChirps(req: Request, res: Response) {
  respondWithJSON(res, 200, await getAllChirps())
};

export async function handlerGetSingleChirp(req: Request, res: Response, chirpId: string[]) {

  const chirp = await getSingleChirp(chirpId[0])
  if (!chirp) {
    throw new NotFoundError(`Chirp with ID ${chirpId} not found`);
  };

  respondWithJSON(res, 200, chirp);
};