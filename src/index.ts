import express from "express";
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
    handlerCreateUser, 
    handlerUserLogin 
} from "./api/users.js";
import { 
    handlerCreateChirp, 
    handlerGetChirps, 
    handlerGetSingleChirp 
} from "./api/chirps.js";
import { handlerMetrics, handlerReadiness } from "./api/http_handlers.js";

//Connects to db
const migrationClient = postgres(config.db.dbConnectionUrl, { max: 1 });
//Reads migrations files and apply them to the db
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();
const PORT = 8080;

app.use("/app",  middlewareMetricsInc, express.static("./src/app"));
app.use(express.json())
app.use(middlewareLogResponses);
app.use(middlewareRequestTime);

/**
 * ----------------------
 * POST METHOD
 * ----------------------
 */
app.get("/", (req, res) => {
    res.redirect("/app/")
});

app.get("/admin/healthz", (req, res, next) => {
    Promise
    .resolve(handlerReadiness(req, res))
    .catch(next);
});

app.get("/admin/metrics", (req, res, next) => { 
    Promise
    .resolve(handlerMetrics(req, res))
    .catch(next);
});

app.get("/api/chirps", (req, res, next) => {
    Promise
    .resolve(handlerGetChirps(req, res))
    .catch(next);
});

app.get("/api/chirps/*chirpId", (req, res, next) => {
    Promise
    .resolve(handlerGetSingleChirp(req, res, req.params.chirpId))
    .catch(next);
});

/**
 * ----------------------
 * POST METHOD
 * ----------------------
 */
app.post("/api/chirps", (req, res, next) => {
    Promise
    .resolve(handlerCreateChirp(req, res))
    .catch(next);
});

app.post("/api/users", (req, res, next) => {
    Promise
    .resolve(handlerCreateUser(req, res))
    .catch(next);
});

app.post("/api/login/", (req, res, next) => {
    Promise
    .resolve(handlerUserLogin(req, res))
    .catch(next);
});

app.post("/admin/reset", (req, res, next) => { 
    Promise
    .resolve(handlerReset(req, res))
    .catch(next);
});

app.use(errorHandler)

app.listen(config.api.port, () => { //Starts server and listen for connections on the port
    console.log(`Server is running at http://localhost:${config.api.port}`);
});