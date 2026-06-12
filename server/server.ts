import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";

const app = express();

const corsOptions = {
    origin: process.env.TRUSTED_ORIGINS,
    credentials: true
};

// 1. Middleware MUST go first
app.use(cors(corsOptions));
app.use(express.json());
app.all('/api/auth/{*any}', toNodeHandler(auth));

const port = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live! Hooray');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});