import {NextFunction, Request, Response} from "express";

import {config} from "../config.js"

/**
 * Returns a simple health response for uptime checks.
 * Useful for verifying the server is up and reachable.
 */
export async function handlerReadiness(req: Request, res: Response) {
    res.set('Content-Type', 'text/plain; charset=utf-8',);
    res.status(200).send("OK");
}

/**
 * Shows a tiny HTML admin page with the file-server hit count.
 * This is mainly used for the learning and admin flow of the app.
 */
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
