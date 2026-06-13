import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import UserRouter from "./routes/UserRoutes.js";
import ProjectRouter from "./routes/ProjectRoutes.js";

const app = express();

const corsOptions = {
    origin: process.env.TRUSTED_ORIGINS,
    credentials: true
};

// 1. Middleware MUST go first
app.use(cors(corsOptions));
app.use(express.json({limit:'50mb'}));
app.use('/api/auth', toNodeHandler(auth));

app.use('/api/user', UserRouter);
app.use('/api/project', ProjectRouter);

const port = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live! Hooray');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});