import express, {Request, Response, Application} from 'express';
import dotenv from 'dotenv';

import connectDB from './config/connectDB';
import apiRoute from './routes/apiRoute';

const app : Application = express();

const PORT: Number = 8000;

dotenv.config()
connectDB()

app.use(express.json())
app.use("/api", apiRoute)

app.get("/", (req: Request, res: Response) => {
    res.json({message: "test message form the mybus server"})
})

app.listen(PORT, () => {
    console.log(`Server starts running at PORT ${PORT}`)
})