import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import projectsRoutes from '../src/routes/projects.ts';
import taskRoutes from '../src/routes/tasks.ts';

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

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});