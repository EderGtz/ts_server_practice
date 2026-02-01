import {Request, Response, NextFunction} from "express";

import {config} from "../config.js"

//Middleware that register the non ok responses
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

//Middleware to register the time the time to resolve the petition
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

//Middleware to track the number of times the app is called
export async function middlewareMetricsInc(
    req: Request,
    res: Response,
    next: NextFunction
){
    config.fileserverHits++;
    next();
}