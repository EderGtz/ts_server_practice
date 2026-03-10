import {NextFunction, Request, Response} from "express";

import {config} from "../config.js"
import { respondWithError, respondWithJSON } from "./responses.js";
import { BadRequestError, NotFoundError, UserForbiddenError, UserNotAuthenticatedError } from "./types/class_errors.js";

//Handler used to give information about the state of the server
export async function handlerReadiness(req: Request, res: Response) {
    res.set('Content-Type', 'text/plain; charset=utf-8',);
    res.status(200).send("OK");
}

//Handler to show the number of times the app has been requested
export async function handlerMetrics(req: Request, res: Response) {
    res.set('Content-Type', 'text/html; charset=utf-8')
    res.send(`<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${config.fileserverHits} times!</p>
  </body>
</html>
`);
} 

//Handler to reset the metrics of the app
export async function handlerResetMetrics(req: Request, res: Response) {
    config.fileserverHits = 0
    res.write("Hits reset to 0")
    res.end()
}

interface params {
  body: string
}

export async function handlerValidateChirp(req: Request, res: Response) {

  const params: params = req.body;
  const textBody = params.body
  const maxChirpLength = 140;

  if (textBody.length > maxChirpLength) {
    throw new BadRequestError("Chirp is too long. Max length is 140");
  }
  const cleanedBodyText = badWordsDetector(textBody)

  respondWithJSON(res, 200, {
    cleanedBody: cleanedBodyText
  });
};

const notAdmitedWords = ["kerfuffle", "sharbert", "fornax"]

function badWordsDetector(body: string) {
  const splittedBody = body.split(" ")
  let final = [];
  for (let word of splittedBody) {
    if (notAdmitedWords.includes(word.toLocaleLowerCase())) {
      word = "****"
    }; 
    final.push(word)
  };
  return final.join(" ")
}

export async function errorHandler(
  err: Error,
  _: Request,
  res: Response,
  __: NextFunction
) {
  let statusCode = 500;
  let errMessage = "Something went wrong on our end";
  console.log(err.message);

  if (err instanceof BadRequestError) {
    statusCode = 400;
    errMessage = err.message;
  } else if (err instanceof UserNotAuthenticatedError) {
    statusCode = 401;
    errMessage = err.message;
  } else if (err instanceof UserForbiddenError) {
    statusCode = 402;
    errMessage = err.message;
  } else if (err instanceof NotFoundError) {
    statusCode = 404
    errMessage = err.message;
  } else {
    respondWithError(res, 500, "Internal Server Error")
  }
  
  respondWithError(res, statusCode, errMessage)
};