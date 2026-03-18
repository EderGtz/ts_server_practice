import type { Request, Response } from "express";

import { BadRequestError, NotFoundError } from "./types/class_errors.js";
import { createChirp, selectAllChirps, selectSingleChirp } from "../db/queries/chirps.js";
import { respondWithJSON } from "./responses.js";

interface params {
  body: string,
  userId: string
}

export async function handlerCreateChirp(req: Request, res: Response) {
  const parameters: params = req.body
  if (!parameters.body || !parameters.userId) {
    throw new BadRequestError("Missing requiered fields");
  };

  const chirp = parameters.body;
  const validChirp = await validateChirp(chirp);
  const chirpCreated = await createChirp( {body: validChirp, user_id: parameters.userId} );

  if (!chirpCreated) {
    throw new Error("Could not create chirp");
  };

  const payload = {
    id: chirpCreated.id,
    body: chirpCreated.body,
    userId: chirpCreated.user_id,
    createdAt: chirpCreated.created_at,
    updatedAt: chirpCreated.updated_at
  }
  respondWithJSON(res, 201, payload)
};

const notAdmitedWords = ["kerfuffle", "sharbert", "fornax"]

async function validateChirp(chirpString: string) {
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

export async function handlerSelectChirps(req: Request, res: Response) {
  respondWithJSON(res, 200, await selectAllChirps())
};

export async function handlerSelectSingleChirp(req: Request, res: Response, chirpId: string[]) {

  const chirp = await selectSingleChirp(chirpId[0])
  if (!chirp) {
    throw new NotFoundError(`Chirp with ID ${chirpId} not found`);
  };

  respondWithJSON(res, 200, chirp);
};