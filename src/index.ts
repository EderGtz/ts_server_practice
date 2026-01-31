import express from "express";

const app = express();
const PORT = 8080;

app.use(express.static(".")); //relative to the process cwd

app.listen(PORT, () => { //Starts server and listen for connections on the port
    console.log(`Server is running at http://localhost${PORT}`);
});