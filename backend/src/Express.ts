import cors from "cors";
import express from "express";
import { createServer } from "http";
import router from "./routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use(router);

const server = createServer(app);

export { server };
