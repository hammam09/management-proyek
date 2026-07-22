import { Router, type Request, type Response, type NextFunction} from 'express';
import { successResponse, errorResponse } from '../utils/response.js';

const router = Router();

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

// router.get("/", (req: Request, res: Response, next: NextFunction) => {
//     try {
//         // Picu eror tiruan
//         throw new Error("Koneksi database gagal!"); 
//     } catch (error) {
//         next(error); // Melempar ke Global Error Handler
//     }
// });

router.get("/", (req: Request, res: Response, next: NextFunction) => {
    const { klien } = req.query;
    if (klien) {
        const filteredProjects = projects.filter((pro) => pro.klien === klien);

        res.status(200).json(successResponse(filteredProjects, "Data projek berhasil diambil"));
        return;
    }
    res.status(200).json(successResponse(projects, "Data projek berhasil diambil"));
});

router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const parsedId = parseInt(id as string, 10);

    const proyekByID = projects.find((pro) => pro.id === parsedId);
    if (!proyekByID){
        res.status(404).json(errorResponse("Data projek tidak ditemukan"));
        return;
    }

    res.status(200).json(successResponse(proyekByID, `Data projek dengan id ${id} berhasil diambil`));
});

router.post("/", (req: Request, res: Response, next: NextFunction) => {
    const { nama, klien, status, tanggalMulai, tanggalSelesai } = req.body;

    if(!nama || !klien || !status || !tanggalMulai || !tanggalSelesai){
        res.status(400).json(errorResponse("Data tidak lengkap"));
        return;
    }


    const isNameExist = projects.some((pro) => pro.nama === nama);
    if (isNameExist){
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

    res.status(201).json(successResponse(newProject, "Data projek berhasil ditambahkan"));
});

router.put("/:id", (req: Request, res: Response, next: NextFunction): void => {
    const { id } = req.params;
    const parsedId = parseInt(id as string, 10);

    const projectIndex = projects.findIndex((pro) => pro.id === parsedId);

    if (projectIndex === -1) {
        res.status(404).json(errorResponse(`Data projek dengan id ${id} tidak ditemukan`));
        return;
    }
    const { nama, klien, status, tanggalMulai, tanggalSelesai } = req.body;

    if (!nama || !klien || !status || !tanggalMulai || !tanggalSelesai) {
        res.status(400).json(errorResponse("Data tidak lengkap"));
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

    res.status(200).json(successResponse(projects[projectIndex], `Data projek dengan id ${id} berhasil diperbarui`));
});

router.patch("/:id", (req: Request, res: Response, next: NextFunction): void => {
    const { id } = req.params;
    const parsedId = parseInt(id as string, 10);

    const projectIndex = projects.findIndex((pro) => pro.id === parsedId);

    if (projectIndex === -1) {
        res.status(404).json(errorResponse(`Data projek dengan id ${id} tidak ditemukan`));
        return;
    }
    const { id: _, ...updates } = req.body; 
    projects[projectIndex] = {
        ...projects[projectIndex],
        ...updates,                
        id: parsedId,              
    };

    res.status(200).json(successResponse(projects[projectIndex], `Data proyek dengan id ${id} berhasil diperbarui sebagian (PATCH)`));
});

router.delete("/:id", (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const parsedId = parseInt(id as string, 10);

    const projectsIndex = projects.findIndex((pro) => pro.id === parsedId);

    if (projectsIndex === -1) {
        res.status(404).json(errorResponse(`Data projek dengan id ${id} tidak ditemukan`));
        return;
    }

    const removedProject = projects.splice(projectsIndex, 1)[0];

    res.status(200).json(successResponse(removedProject, `Data proyek dengan id ${id} berhasil dihapus`));
});

export default router;