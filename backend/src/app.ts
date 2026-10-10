import express from "express";
import { healthRouter } from "./routes/health";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/health", healthRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
