import express from "express";
import type { Request, Response } from "express";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "./config.js"
import { errorHandler } from "./api/error_handler.js";
import {
    middlewareLogResponses,
     middlewareRequestTime,
     middlewareMetricsInc
    } from "./api/middlewares.js"
import { handlerReset } from "./api/resets.js";
import { 
    handlerUsersCreate, 
    handlerUserLogin, 
    handlerUserUpdate
} from "./api/users.js";
import { 
    handlerCreateChirp, 
    handlerGetChirps, 
    handlerGetSingleChirp 
} from "./api/chirps.js";
import { handlerMetrics, handlerReadiness } from "./api/http_handlers.js";
import { handlerRefreshToken, handlerRevokeRefreshToken } from "./api/refresh_token.js";

//Connects to db
const migrationClient = postgres(config.db.dbConnectionUrl, { max: 1 });
//Reads migrations files and apply them to the db
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();
const PORT = 8080;

app.use("/app",  middlewareMetricsInc, express.static("./src/app"));
app.use(middlewareLogResponses);
app.use(middlewareRequestTime);
app.use(express.json());

/**
 * ----------------------
 * ADMIN METHODS
 * ----------------------
 */
app.get("/", (req: Request, res: Response) => {
    res.redirect("/app/")
});

app.get("/admin/healthz", (req: Request, res: Response, next) => {
    Promise
    .resolve(handlerReadiness(req, res))
    .catch(next);
});

app.get("/admin/metrics", (req: Request, res: Response, next) => { 
    Promise
    .resolve(handlerMetrics(req, res))
    .catch(next);
});

app.post("/admin/reset", (req: Request, res: Response, next) => { 
    Promise
    .resolve(handlerReset(req, res))
    .catch(next);
});

/**
 * ----------------------
 * CHIRPS METHODS
 * ----------------------
 */

app.get("/api/chirps", (req: Request, res: Response, next) => {
    Promise
    .resolve(handlerGetChirps(req, res))
    .catch(next);
});

app.get("/api/chirps/*chirpId", (req, res, next) => {
    Promise
    .resolve(handlerGetSingleChirp(req, res, req.params.chirpId))
    .catch(next);
});

app.post("/api/chirps", (req: Request, res: Response, next) => {
    Promise
    .resolve(handlerCreateChirp(req, res))
    .catch(next);
});

/**
 * ----------------------
 * USERS METHODS
 * ----------------------
 */

app.post("/api/users", (req: Request, res: Response, next) => {
    Promise
    .resolve(handlerUsersCreate(req, res))
    .catch(next);
});

app.put("/api/users", (req: Request, res: Response, next) => {
    Promise 
    .resolve(handlerUserUpdate(req, res))
    .catch(next);
});

/**
 * ----------------------
 * CREDENTIALS METHODS
 * ----------------------
 */

app.post("/api/login", (req: Request, res: Response, next) => {
    Promise
    .resolve(handlerUserLogin(req, res))
    .catch(next);
});

app.post("/api/refresh", (req: Request, res: Response, next) => {
    Promise
    .resolve(handlerRefreshToken(req, res))
    .catch(next);
});

app.post("/api/revoke", (req: Request, res: Response, next) => {
    Promise
    .resolve(handlerRevokeRefreshToken(req, res))
    .catch(next)
});

app.use(errorHandler)
app.listen(config.api.port, () => { //Starts server and listen for connections on the port
    console.log(`Server is running at http://localhost:${config.api.port}`);
});