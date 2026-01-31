import express from "express";

import {handlerReadiness} from "./api/readiness.js";
import {middlewareLogResponses} from "./api/middleLogResponses.js"

const app = express();
const PORT = 8080;

app.use("/app", express.static("./src/app")); //relative to the process cwd
app.use(middlewareLogResponses)

app.get("/healthz", handlerReadiness)

app.listen(PORT, () => { //Starts server and listen for connections on the port
    console.log(`Server is running at http://localhost${PORT}`);
});