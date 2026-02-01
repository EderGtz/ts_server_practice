import express from "express";

import {
    handlerReadiness, 
    handlerMetrics,
    handlerResetMetrics
    } from "./api/handlers.js";

import {
    middlewareLogResponses,
     middlewareRequestTime,
     middlewareMetricsInc
    } from "./api/middlewares.js"

const app = express();
const PORT = 8080;

app.use("/app",  middlewareMetricsInc, express.static("./src/app")); //relative to the process cwd
app.use(middlewareLogResponses);
app.use(middlewareRequestTime);

app.get("/healthz", handlerReadiness)
app.get("/metrics", handlerMetrics)
app.get("/reset", handlerResetMetrics)

app.listen(PORT, () => { //Starts server and listen for connections on the port
    console.log(`Server is running at http://localhost${PORT}`);
});