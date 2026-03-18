import {NextFunction, Request, Response} from "express";

import {config} from "../config.js"
import { respondWithError } from "./responses.js";
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
    <p>Chirpy has been visited ${config.api.fileserverHits} times!</p>
  </body>
</html>
`);
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