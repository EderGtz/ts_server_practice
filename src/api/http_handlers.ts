import {NextFunction, Request, Response} from "express";

import {config} from "../config.js"

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