import express from "express";

import {
    handlerReadiness, 
    handlerMetrics,
    handlerResetMetrics,
    handlerStringsLenghtChecker
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

app.get("/admin/healthz", handlerReadiness)
app.get("/admin/metrics", handlerMetrics)

app.post("/admin/reset", handlerResetMetrics)
app.post("/api/validate_chirp", handlerStringsLenghtChecker)

app.listen(PORT, () => { //Starts server and listen for connections on the port
    console.log(`Server is running at http://localhost:${PORT}`);
});