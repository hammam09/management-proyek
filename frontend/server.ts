import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

interface Project {
  id: number;
  nama: string;
  klien: string;
  status: string; // 'aktif', 'selesai', 'Progress'
  tanggalMulai: string;
  tanggalSelesai: string;
}

const app = express();
const PORT = 3000;

// Enable JSON parser middleware
app.use(express.json());

// Enable CORS middleware so external local requests can succeed if necessary
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

// In-memory data store for projects
let projects: Project[] = [
  {
    id: 1,
    nama: "Revitalisasi Website E-Commerce",
    klien: "PT Nusantara Jaya",
    status: "Progress",
    tanggalMulai: "2026-06-01",
    tanggalSelesai: "2026-08-31"
  },
  {
    id: 2,
    nama: "Aplikasi Pelaporan Keuangan",
    klien: "Koperasi Karya Makmur",
    status: "aktif",
    tanggalMulai: "2026-05-15",
    tanggalSelesai: "2026-11-15"
  },
  {
    id: 3,
    nama: "Sistem Manajemen Inventaris Gudang",
    klien: "CV Logistik Prima",
    status: "selesai",
    tanggalMulai: "2026-01-10",
    tanggalSelesai: "2026-04-15"
  }
];

let nextId = 4;

// 1. GET all projects
app.get("/projects", (req, res) => {
  res.json(projects);
});

// 2. GET single project by ID (optional, useful helper)
app.get("/projects/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const project = projects.find((p) => p.id === id);
  if (!project) {
    res.status(404).json({ message: `Proyek dengan ID ${id} tidak ditemukan.` });
    return;
  }
  res.json(project);
});

// 3. POST - Create new project
app.post("/projects", (req, res) => {
  const { nama, klien, status, tanggalMulai, tanggalSelesai } = req.body;

  if (!nama || !klien || !status || !tanggalMulai || !tanggalSelesai) {
    res.status(400).json({ message: "Semua data proyek harus diisi lengkap." });
    return;
  }

  const newProject: Project = {
    id: nextId++,
    nama,
    klien,
    status,
    tanggalMulai,
    tanggalSelesai,
  };

  projects.push(newProject);
  res.status(201).json(newProject);
});

// 4. PUT - Update full project by ID
app.put("/projects/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { nama, klien, status, tanggalMulai, tanggalSelesai } = req.body;

  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) {
    res.status(404).json({ message: `Proyek dengan ID ${id} tidak ditemukan.` });
    return;
  }

  if (!nama || !klien || !status || !tanggalMulai || !tanggalSelesai) {
    res.status(400).json({ message: "Semua data proyek harus diisi lengkap." });
    return;
  }

  projects[index] = {
    id,
    nama,
    klien,
    status,
    tanggalMulai,
    tanggalSelesai,
  };

  res.json(projects[index]);
});

// 5. PATCH - Quick update status
app.patch("/projects/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;

  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) {
    res.status(404).json({ message: `Proyek dengan ID ${id} tidak ditemukan.` });
    return;
  }

  if (!status) {
    res.status(400).json({ message: "Status proyek harus ditentukan." });
    return;
  }

  projects[index].status = status;
  res.json(projects[index]);
});

// 6. DELETE - Remove project by ID
app.delete("/projects/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = projects.findIndex((p) => p.id === id);

  if (index === -1) {
    res.status(404).json({ message: `Proyek dengan ID ${id} tidak ditemukan.` });
    return;
  }

  const deletedProject = projects.splice(index, 1)[0];
  res.json({ message: "Proyek berhasil dihapus.", deletedProject });
});

// Integrate Vite middleware or serve static files
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // For single page application fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error("Gagal memulai server:", err);
});
