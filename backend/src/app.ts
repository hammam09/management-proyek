import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app: Express = express();

const PORT = process.env.PORT;

let projects = [
    {
        id: 1,
        nama: "Website E-Commerce",
        klien: "PT Maju Mapan",
        status: "Progress",
        tanggalMulai: "2026-01-01",
        tanggalSelesai: "2026-06-01"
    },
    {
        id: 2,
        nama: "Aplikasi Mobile Kasir",
        klien: "Toko Berkah",
        status: "Selesai",
        tanggalMulai: "2025-10-10",
        tanggalSelesai: "2025-12-25"
    }
];

let nextId = 3

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

app.get("/projects", (req: Request, res: Response) => {
    const { klien } = req.query;
    if (klien) {
        const filteredProjects = projects.filter((pro) => pro.klien === klien);

        res.status(200).json({
            message: `Data projek dengan klien ${klien} berhasil diambil`,
            data: filteredProjects,
        })
        return;
    }
    res.status(200).json({
        message: "Data projek berhasil diambil",      
        data: projects,
    });
});

app.get("/projects/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    const parsedId = parseInt(id as string, 10);

    const proyekByID = projects.find((pro) => pro.id === parsedId);
    if (!proyekByID){
        res.status(404).json({
            message: "Data projek tidak ditemukan",
        });
        return;
    }

    res.status(200).json({
        message: `Data proyek dengan id ${id} berhasil diambil`,
        data: proyekByID,
    });
});

app.post("/projects", (req: Request, res: Response) => {
    const { nama, klien, status, tanggalMulai, tanggalSelesai } = req.body;

    if(!nama || !klien || !status || !tanggalMulai || !tanggalSelesai){
        res.status(400).json({
            message: "Data tidak lengkap"
        })
        return;
    }


    const isEmailExist = projects.some((pro) => pro.nama === nama);
    if (isEmailExist){
        res.status(409).json({
            message: "Nama sudah terdaftar"
        });
        return;
    }

    const newProject = {
        id: nextId++,
        nama,
        klien,
        status,
        tanggalMulai,
        tanggalSelesai,
    };

    projects.push(newProject);

    res.status(201).json({
        message: "Data proyek berhasil ditambahkan",
        data: newProject,
    });
});

app.put("/projects/:id", (req: Request, res: Response): void => {
    const { id } = req.params;
    const parsedId = parseInt(id as string, 10);

    const projectIndex = projects.findIndex((pro) => pro.id === parsedId);

    if (projectIndex === -1) {
        res.status(404).json({
            message: `Data proyek dengan id ${id} tidak ditemukan`,
        });
        return;
    }
    const { nama, klien, status, tanggalMulai, tanggalSelesai } = req.body;

    if (!nama || !klien || !status || !tanggalMulai || !tanggalSelesai) {
        res.status(400).json({
            message: "Data tidak lengkap. Membutuhkan semua field untuk diperbarui.",
        });
        return;
    }

    projects[projectIndex] = {
        id: parsedId,
        nama,
        klien,
        status,
        tanggalMulai,
        tanggalSelesai,
    };

    res.status(200).json({
        message: `Data proyek dengan id ${id} berhasil diperbarui`,
        data: projects[projectIndex],
    });
});

app.patch("/projects/:id", (req: Request, res: Response): void => {
    const { id } = req.params;
    const parsedId = parseInt(id as string, 10);

    const projectIndex = projects.findIndex((pro) => pro.id === parsedId);

    if (projectIndex === -1) {
        res.status(404).json({
            message: `Data proyek dengan id ${id} tidak ditemukan`,
        });
        return;
    }
    const { id: _, ...updates } = req.body; 
    projects[projectIndex] = {
        ...projects[projectIndex],
        ...updates,                
        id: parsedId,              
    };

    res.status(200).json({
        message: `Data proyek dengan id ${id} berhasil diperbarui sebagian (PATCH)`,
        data: projects[projectIndex],
    });
});

app.delete("/projects/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    const parsedId = parseInt(id as string, 10);

    const projectsIndex = projects.findIndex((pro) => pro.id === parsedId);

    if (projectsIndex === -1) {
        res.status(404).json({
            message: `Data proyek dengan id ${id} tidak ditemukan`,
        });
        return;
    }

    projects.splice(projectsIndex, 1)[0];

    res.status(200).json({
        message: `Data proyek dengan id ${id} berhasil dihapus`,
    });
});

// Menjalankan Server
app.listen(PORT, () => {
    console.log(`Server manajemen project berjalan di http://localhost:${PORT}`);
});