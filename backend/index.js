import connectToDatabase from "./db.js";
import express from "express"; // imports express module
import authRouter from "./routes/auth.js";
import notesRouter from "./routes/notes.js";

// Connects Express server to a database
connectToDatabase();

const app = express(); // Create an instance of express server
const port = 5000;

// Middleware functions are functions that run during the request-response cycle of an Express app and are used to modify the req and res objects, end the request-response cycle, or call the next middleware in the stack.
// .use() mounts middleware in an Express app
// express.json() is a built-in middleware function in Express that parses incoming requests with JSON. It extracts the JSON data from the request body and makes it available in req.body.
app.use(express.json());

// Available Routes
app.use("/api/auth", authRouter);
app.use("/api/notes", notesRouter);

// Start the server and listen on port 5000
app.listen(port, () => {
  console.log(`Local Server is listening on port ${port}`);
});
