import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import { successResponse } from './utils/response.js';
import projectsRoutes from '../src/routes/projects.js';
dotenv.config();

const app: Express = express();

const PORT = process.env.PORT;

app.use(express.json());

app.use(cors());

app.use((req, res, next) => {
    const waktu = new Date().toISOString();
    console.log(`[${waktu}] ${req.method} ${req.path}`);
    next();
});

app.get("/",(req: Request, res: Response) => {
    res.status(200).json({
        message: "Succes"
    });
});



// Menjalankan Server
app.listen(PORT, () => {
    console.log(`Server manajemen project berjalan di http://localhost:${PORT}`);
});