import express from "express";

import {
    handlerReadiness, 
    handlerMetrics,
    handlerResetMetrics,
    handlerValidateChirp,
    errorHandler
    } from "./api/handlers.js";

import {
    middlewareLogResponses,
     middlewareRequestTime,
     middlewareMetricsInc
    } from "./api/middlewares.js"

const app = express();
const PORT = 8080;

app.use("/app",  middlewareMetricsInc, express.static("./src/app"));
app.use(express.json())
app.use(middlewareLogResponses);
app.use(middlewareRequestTime);

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

app.post("/admin/reset", (req, res, next) => { 
    Promise
    .resolve(handlerResetMetrics(req, res))
    .catch(next);
});

app.post("/api/validate_chirp", (req, res, next) => { 
    Promise
    .resolve(handlerValidateChirp(req, res))
    .catch(next);
});

app.use(errorHandler)

app.listen(PORT, () => { //Starts server and listen for connections on the port
    console.log(`Server is running at http://localhost:${PORT}`);
});