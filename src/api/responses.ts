import { Response } from "express";

export async function respondWithError(res: Response, errorCode: number, errorMsg: string) {
    respondWithJSON(res, errorCode, { error: errorMsg })
}

export async function respondWithJSON(res: Response, code: number, payload: any) {
    res.header("Content-Type", "application/json");
    const body = JSON.stringify(payload);
    res.status(code).send(body)
}