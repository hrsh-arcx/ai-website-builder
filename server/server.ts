import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";

const app = express();

const corsOptions = {
    origin : process.env.TRUSTED_ORIINS?.split(',') || [],
    credentials : true
}
// Middleware
app.use(cors(corsOptions))
app.use(express.json());

const port = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live! Hooray');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});