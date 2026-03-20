import {NextFunction, Request, Response } from "express";

import { respondWithError } from "./responses.js";
import { BadRequestError, NotFoundError, UserForbiddenError, UserNotAuthenticatedError } from "./types/class_errors.js";

export async function errorHandler(
  err: Error,
  _: Request,
  res: Response,
  __: NextFunction
) {
  console.log("Error type:", err.constructor.name);
  console.log("Is BadRequestError?", err instanceof BadRequestError);
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
    statusCode = 403;
    errMessage = err.message;
  } else if (err instanceof NotFoundError) {
    statusCode = 404
    errMessage = err.message;
  };
  
  respondWithError(res, statusCode, errMessage)
};