import {NextFunction, Request, Response } from "express";

import { respondWithError } from "../utils.js";
import { AppError } from "./types/class_errors.js";

/**
 * Centralizes Express error responses for the API.
 * Known app errors keep their status code, and unknown ones become 500s.
 */
export async function errorHandler(
  err: Error,
  _: Request,
  res: Response,
  __: NextFunction
) {
  console.log("Error type:", err.constructor.name);
  console.log(err.message);

  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const errMessage = err instanceof AppError 
  ? err.message 
  : "Something went wrong on our end"
  
  respondWithError(res, statusCode, errMessage)
};
