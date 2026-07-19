import { Router, type Request, type Response, } from 'express';
import { successResponse, errorResponse } from '../utils/response.ts';

const router = Router();

let tasks = [
    { id: 1, judul: "Desain Database", pic: "Hammam", tenggal: "2026-07-25", status: "Progress" },
    { id: 2, judul: "Setup Environment Production", pic: "Amam", tenggat: "2026-07-30", status: "Selesai" }
];

let nextId = 3

router.get("/", (req: Request, res: Response) => {
    const { judul } = req.query;
    if (judul) {
        const filteredTasks = tasks.filter((task) => task.judul === judul);

        res.status(200).json(successResponse(filteredTasks, "Data task berhasil diambil"));
        return;
    }
    res.status(200).json(successResponse(tasks, "Data task berhasil diambil"));
});

router.get("/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    const parsedId = parseInt(id as string, 10);

    const tasksByID = tasks.find((task) => task.id === parsedId);
    if (!tasksByID) {
        res.status(404).json(errorResponse("Data task tidak ditemukan"));
        return;
    }

    res.status(200).json(successResponse(tasksByID, `Data task dengan id ${id} berhasil diambil`));
});

router.post("/", (req: Request, res: Response) => {
    const { judul, pic, tenggal, status } = req.body;

    if (!judul || !pic || !tenggal || !status) {
        res.status(400).json(errorResponse("Data tidak lengkap"));
        return;
    }


    const isEmailExist = tasks.some((task) => task.judul === judul);
    if (isEmailExist) {
        res.status(409).json({
            message: "Judul sudah terdaftar"
        });
        return;
    }

    const newTask = {
        id: nextId++,
        judul,
        pic,
        tenggal,
        status,
    };

    tasks.push(newTask);

    res.status(201).json(successResponse(newTask, "Data task berhasil ditambahkan"));
});

router.put("/:id", (req: Request, res: Response): void => {
    const { id } = req.params;
    const parsedId = parseInt(id as string, 10);

    const tasksIndex = tasks.findIndex((task) => task.id === parsedId);

    if (tasksIndex === -1) {
        res.status(404).json(errorResponse(`Data task dengan id ${id} tidak ditemukan`));
        return;
    }
    const { judul, pic, tenggal, status } = req.body;

    if (!judul || !pic || !tenggal || !status) {
        res.status(400).json(errorResponse("Data tidak lengkap"));
        return;
    }

    tasks[tasksIndex] = {
        id: parsedId,
        judul,
        pic,
        tenggal,
        status,
    };

    res.status(200).json(successResponse(tasks[tasksIndex], `Data task dengan id ${id} berhasil diperbarui`));
});

router.patch("/:id", (req: Request, res: Response): void => {
    const { id } = req.params;
    const parsedId = parseInt(id as string, 10);

    const tasksIndex = tasks.findIndex((task) => task.id === parsedId);

    if (tasksIndex === -1) {
        res.status(404).json(errorResponse(`Data task dengan id ${id} tidak ditemukan`));
        return;
    }
    const { id: _, ...updates } = req.body;
    tasks[tasksIndex] = {
        ...tasks[tasksIndex],
        ...updates,
        id: parsedId,
    };

    res.status(200).json(successResponse(tasks[tasksIndex], `Data task dengan id ${id} berhasil diperbarui sebagian (PATCH)`));
});

router.delete("/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    const parsedId = parseInt(id as string, 10);

    const tasksIndex = tasks.findIndex((task) => task.id === parsedId);

    if (tasksIndex === -1) {
        res.status(404).json(errorResponse(`Data task dengan id ${id} tidak ditemukan`));
        return;
    }

    tasks.splice(tasksIndex, 1)[0];

    res.status(200).json(successResponse(tasks[tasksIndex], `Data task dengan id ${id} berhasil dihapus`));
});

export default router;