import {Request, Response, NextFunction} from "express";

import {config} from "../config.js"

/**
 * Logs requests that finish with non-success status codes.
 * This keeps failures visible without logging every response body.
 */
export async function middlewareLogResponses(
    req: Request, 
    res: Response, 
    next: NextFunction
) {
    res.on("finish", () => {
        if (res.statusCode >= 300) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`);
        }
    });
    next();
}

/**
 * Measures how long each request takes to complete.
 * The duration is printed after the response finishes.
 */
export async function middlewareRequestTime(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const startTime = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - startTime;
        console.log(`${req.method} ${req.url} - ${duration}ms`)
    });
    next();
};

/**
 * Increments the in-memory file-server hit counter.
 * It is used by the admin metrics endpoint.
 */
export async function middlewareMetricsInc(
    req: Request,
    res: Response,
    next: NextFunction
){
    config.api.fileserverHits++;
    next();
}
