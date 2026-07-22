import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import projectsRoutes from '../src/routes/projects.ts';
import taskRoutes from '../src/routes/tasks.ts';
import { errorResponse } from './utils/response.ts';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT

app.use(express.json());
app.use(cors());

// Logger Middleware
app.use((req, res, next) => {
    const waktu = new Date().toISOString();
    console.log(`[${waktu}] ${req.method} ${req.path}`);
    next();
});

// --- HUBUNGKAN FILE ROUTER KE APP ---

app.use("/projects", projectsRoutes);
app.use("/tasks", taskRoutes)

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({ message: "Success" });
});

app.use((req: Request, res: Response, next: NextFunction) => {
    const error: any = new Error(`Endpoint tidak ditemukan`);
    error.statusCode = 404;
    next(error); // Oper eror ini ke Global Error Handler di bawahnya
});

app.use((err:any,req: Request, res: Response, next: NextFunction) => {
    // Log eror asli di terminal server untuk kebutuhan debugging kita
    console.error("Terjadi Error:", err);

    const statusCode = err.statusCode || 500;
    const isDevelopment = process.env.NODE_ENV;
    
    // Sensor pesan eror jika di mode production agar tidak bocor ke publik
    let message = err.message || "Terjadi kesalahan internal pada server";
    if (statusCode === 500 && isDevelopment) {
        message = "Terjadi kesalahan pada server. Silakan hubungi admin atau coba lagi nanti.";
    }

    res.status(statusCode).json(errorResponse(message));
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});