import React, { useState, useEffect } from "react";
import {
  FolderKanban,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Building2,
  Search,
  CheckCircle2,
  Clock,
  PlayCircle,
  AlertCircle,
  RefreshCw,
  X,
  Briefcase
} from "lucide-react";

// 1. Definition of Project Interface (TypeScript strict types)
interface Project {
  id: number;
  nama: string;
  klien: string;
  status: string; // 'aktif', 'selesai', or 'Progress'
  tanggalMulai: string;
  tanggalSelesai: string;
}

interface ProjectFormInput {
  nama: string;
  klien: string;
  status: string;
  tanggalMulai: string;
  tanggalSelesai: string;
}

// Helper to construct API URL robustly
// Uses window.location.origin to match the current deployment/dev server on port 3000
const API_URL = typeof window !== "undefined"
  ? (window.location.hostname === "localhost"
      ? "http://localhost:3000/projects"
      : `${window.location.origin}/projects`)
  : "http://localhost:3000/projects";

export default function App() {
  // --- React State ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("semua");

  // Form State
  const [formInput, setFormInput] = useState<ProjectFormInput>({
    nama: "",
    klien: "",
    status: "Progress",
    tanggalMulai: "",
    tanggalSelesai: "",
  });

  // Edit Mode State
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form Validation Errors State
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ProjectFormInput, string>>>({});

  // Loading state for individual button actions to show micro-interactions
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // --- Fetch Projects from Backend ---
  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`Gagal memuat data dari server (Status: ${response.status})`);
      }
      const data = await response.json();
      setProjects(data);
    } catch (err: any) {
      console.error("Error fetching projects:", err);
      setError("Tidak dapat terhubung ke server backend. Pastikan server Node.js Express berjalan di port 3000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // --- Show Auto-dismissing Notification helper ---
  const triggerNotification = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  // --- Form Handlers ---
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormInput((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field-specific error when user types
    if (formErrors[name as keyof ProjectFormInput]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // --- Form Validation ---
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ProjectFormInput, string>> = {};
    if (!formInput.nama.trim()) errors.nama = "Nama proyek wajib diisi.";
    if (!formInput.klien.trim()) errors.klien = "Nama klien wajib diisi.";
    if (!formInput.status) errors.status = "Pilih status proyek.";
    if (!formInput.tanggalMulai) errors.tanggalMulai = "Tanggal mulai wajib diisi.";
    if (!formInput.tanggalSelesai) errors.tanggalSelesai = "Tanggal selesai wajib diisi.";

    if (formInput.tanggalMulai && formInput.tanggalSelesai) {
      const start = new Date(formInput.tanggalMulai);
      const end = new Date(formInput.tanggalSelesai);
      if (end < start) {
        errors.tanggalSelesai = "Tanggal selesai tidak boleh sebelum tanggal mulai.";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- Reset Form State ---
  const resetForm = () => {
    setFormInput({
      nama: "",
      klien: "",
      status: "Progress",
      tanggalMulai: "",
      tanggalSelesai: "",
    });
    setFormErrors({});
    setIsEditMode(false);
    setEditingId(null);
  };

  // --- CREATE or UPDATE Project ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setActionLoadingId("submit");
    try {
      if (isEditMode && editingId !== null) {
        // HTTP PUT to update project
        const response = await fetch(`${API_URL}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formInput),
        });

        if (!response.ok) {
          throw new Error("Gagal memperbarui data proyek di backend.");
        }

        const updatedProject = await response.json();
        setProjects((prev) =>
          prev.map((p) => (p.id === editingId ? updatedProject : p))
        );
        triggerNotification(`Proyek "${formInput.nama}" berhasil diperbarui!`);
      } else {
        // HTTP POST to create project
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formInput),
        });

        if (!response.ok) {
          throw new Error("Gagal menyimpan proyek baru di backend.");
        }

        const newProject = await response.json();
        setProjects((prev) => [...prev, newProject]);
        triggerNotification(`Proyek baru "${formInput.nama}" berhasil disimpan!`);
      }
      resetForm();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat memproses data.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // --- DELETE Project ---
  const handleDelete = async (id: number, nama: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus proyek "${nama}"?`)) {
      return;
    }

    setActionLoadingId(`delete-${id}`);
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus proyek dari backend.");
      }

      setProjects((prev) => prev.filter((p) => p.id !== id));
      triggerNotification(`Proyek "${nama}" berhasil dihapus.`);
      
      // If we are currently editing this project, cancel edit mode
      if (editingId === id) {
        resetForm();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal menghapus proyek.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // --- PATCH Status Project Quick Update ---
  const handleStatusPatch = async (id: number, currentStatus: string) => {
    // Define the next status in rotation: 'Progress' -> 'aktif' -> 'selesai' -> 'Progress'
    let nextStatus = "Progress";
    if (currentStatus === "Progress") nextStatus = "aktif";
    else if (currentStatus === "aktif") nextStatus = "selesai";

    setActionLoadingId(`patch-${id}`);
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        throw new Error("Gagal memperbarui status proyek.");
      }

      const updatedProject = await response.json();
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: updatedProject.status } : p))
      );

      // Also update formInput status if we are currently editing this project
      if (editingId === id) {
        setFormInput((prev) => ({ ...prev, status: updatedProject.status }));
      }

      triggerNotification(`Status proyek berhasil diubah menjadi "${nextStatus}"`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal mengubah status proyek.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // --- Populate Form for EDIT Mode ---
  const handleEditClick = (project: Project) => {
    setIsEditMode(true);
    setEditingId(project.id);
    setFormInput({
      nama: project.nama,
      klien: project.klien,
      status: project.status,
      tanggalMulai: project.tanggalMulai,
      tanggalSelesai: project.tanggalSelesai,
    });
    setFormErrors({});
    
    // Smooth scroll to form on mobile view
    const formElement = document.getElementById("project-form-container");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  // --- Helper to render Status badges with precise visual matches ---
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "aktif":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Aktif
          </span>
        );
      case "selesai":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
            Selesai
          </span>
        );
      case "progress":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Progress
          </span>
        );
    }
  };

  // --- Filter and Search Logic ---
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.klien.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter =
      statusFilter === "semua" ||
      project.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans antialiased">
      {/* 1. Header Area with Premium Clean Typography */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-200">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Manajemen Proyek
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Sistem Pemantauan Status & Klien Proyek Real-time
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-mono bg-slate-100 px-3 py-1.5 rounded-lg text-slate-600 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            PORT: 3000 (Connected)
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Toast / Success Notification Alert */}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-start gap-3 shadow-lg shadow-emerald-50 max-w-2xl mx-auto animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold">{successMessage}</p>
            </div>
            <button 
              onClick={() => setSuccessMessage(null)} 
              className="text-emerald-500 hover:text-emerald-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl flex items-start justify-between gap-3 shadow-sm max-w-3xl mx-auto">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">Koneksi Error / Kegagalan Sistem</p>
                <p className="text-xs mt-1 text-rose-700">{error}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchProjects}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Hubungkan Ulang
              </button>
              <button 
                onClick={() => setError(null)} 
                className="text-rose-500 hover:text-rose-700 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Responsive Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMN 1: FORM (Left Column) - Occupies 4 out of 12 cols */}
          <div 
            id="project-form-container"
            className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm sticky top-24"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg text-white ${isEditMode ? "bg-amber-500" : "bg-indigo-600"}`}>
                  {isEditMode ? <Edit2 className="w-4.5 h-4.5" /> : <Plus className="w-4.5 h-4.5" />}
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 tracking-tight">
                    {isEditMode ? "Edit Detail Proyek" : "Tambah Proyek Baru"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isEditMode ? "Modifikasi data proyek yang terdaftar" : "Daftarkan proyek baru ke sistem"}
                  </p>
                </div>
              </div>
              
              {isEditMode && (
                <button
                  onClick={resetForm}
                  className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-semibold flex items-center gap-1 transition"
                >
                  <X className="w-3.5 h-3.5" />
                  Batal
                </button>
              )}
            </div>

            {/* Project Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* ID Field (Hidden/Disabled Indicator for Auto-Increment assurance) */}
              {isEditMode && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    ID Proyek (Auto)
                  </label>
                  <input
                    type="text"
                    value={`# ${editingId}`}
                    disabled
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl text-sm font-semibold select-none cursor-not-allowed"
                  />
                </div>
              )}

              {/* 1. Nama Proyek Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Proyek
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formInput.nama}
                  onChange={handleInputChange}
                  placeholder="Contoh: Website Kemakmuran Desa"
                  className={`w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 border rounded-xl text-sm transition focus:outline-none focus:ring-2 focus:bg-white ${
                    formErrors.nama
                      ? "border-rose-300 focus:ring-rose-200 focus:border-rose-500"
                      : "border-slate-200/80 focus:ring-indigo-100 focus:border-indigo-500"
                  }`}
                />
                {formErrors.nama && (
                  <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.nama}
                  </p>
                )}
              </div>

              {/* 2. Nama Klien Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Klien / Instansi
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="klien"
                    value={formInput.klien}
                    onChange={handleInputChange}
                    placeholder="Contoh: PT Harapan Jaya"
                    className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 border rounded-xl text-sm transition focus:outline-none focus:ring-2 focus:bg-white ${
                      formErrors.klien
                        ? "border-rose-300 focus:ring-rose-200 focus:border-rose-500"
                        : "border-slate-200/80 focus:ring-indigo-100 focus:border-indigo-500"
                    }`}
                  />
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
                {formErrors.klien && (
                  <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.klien}
                  </p>
                )}
              </div>

              {/* 3. Status Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Status Saat Ini
                </label>
                <select
                  name="status"
                  value={formInput.status}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 rounded-xl text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:bg-white font-medium"
                >
                  <option value="Progress">Progress</option>
                  <option value="aktif">Aktif</option>
                  <option value="selesai">Selesai</option>
                </select>
                {formErrors.status && (
                  <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.status}
                  </p>
                )}
              </div>

              {/* 4. Dates Inputs (Start & End Dates) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Mulai
                  </label>
                  <input
                    type="date"
                    name="tanggalMulai"
                    value={formInput.tanggalMulai}
                    onChange={handleInputChange}
                    className={`w-full px-3.5 py-2 bg-slate-50/50 hover:bg-slate-50 border rounded-xl text-sm transition focus:outline-none focus:ring-2 focus:bg-white ${
                      formErrors.tanggalMulai
                        ? "border-rose-300 focus:ring-rose-200 focus:border-rose-500"
                        : "border-slate-200/80 focus:ring-indigo-100 focus:border-indigo-500"
                    }`}
                  />
                  {formErrors.tanggalMulai && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">
                      {formErrors.tanggalMulai}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Selesai
                  </label>
                  <input
                    type="date"
                    name="tanggalSelesai"
                    value={formInput.tanggalSelesai}
                    onChange={handleInputChange}
                    className={`w-full px-3.5 py-2 bg-slate-50/50 hover:bg-slate-50 border rounded-xl text-sm transition focus:outline-none focus:ring-2 focus:bg-white ${
                      formErrors.tanggalSelesai
                        ? "border-rose-300 focus:ring-rose-200 focus:border-rose-500"
                        : "border-slate-200/80 focus:ring-indigo-100 focus:border-indigo-500"
                    }`}
                  />
                  {formErrors.tanggalSelesai && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">
                      {formErrors.tanggalSelesai}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Submit Button */}
              <button
                type="submit"
                disabled={actionLoadingId === "submit"}
                className={`w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white shadow-md flex items-center justify-center gap-2 transition-all ${
                  isEditMode
                    ? "bg-amber-500 hover:bg-amber-600 shadow-amber-100 active:bg-amber-700"
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100 active:bg-indigo-800"
                } disabled:opacity-75 disabled:cursor-wait`}
              >
                {actionLoadingId === "submit" ? (
                  <>
                    <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                    Menyimpan...
                  </>
                ) : isEditMode ? (
                  <>
                    <CheckCircle2 className="w-4.5 h-4.5" />
                    Perbarui Proyek
                  </>
                ) : (
                  <>
                    <Plus className="w-4.5 h-4.5" />
                    Daftarkan Proyek
                  </>
                )}
              </button>

              {isEditMode && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  Batalkan Pengeditan
                </button>
              )}
            </form>
          </div>

          {/* COLUMN 2: LIST / CARDS (Right Column) - Occupies 7 out of 12 cols */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Control Panel: Search & Filter Grid */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-800 tracking-tight text-base">
                    Daftar Proyek Terdaftar
                  </h3>
                  <p className="text-xs text-slate-400">
                    Saring dan cari proyek dengan cepat
                  </p>
                </div>

                <div className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                  Total: <span className="text-indigo-600 font-bold">{filteredProjects.length}</span> / {projects.length} Proyek
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Search Input Box */}
                <div className="sm:col-span-7 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama proyek atau klien..."
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                  />
                  <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3.5" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Status Filter Dropdown */}
                <div className="sm:col-span-5">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl text-sm font-medium text-slate-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                  >
                    <option value="semua">Semua Status</option>
                    <option value="Progress">Status: Progress</option>
                    <option value="aktif">Status: Aktif</option>
                    <option value="selesai">Status: Selesai</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Project Cards Section */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
                <div className="text-center">
                  <p className="font-semibold text-slate-700">Memuat Data Proyek</p>
                  <p className="text-xs text-slate-400">Sinkronisasi data dengan server backend...</p>
                </div>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="py-20 px-6 flex flex-col items-center justify-center text-center bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                <div className="p-4 bg-slate-50 rounded-full text-slate-400 mb-4 border border-slate-100">
                  <Briefcase className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-800 text-lg mb-1">
                  Tidak Ada Proyek Ditemukan
                </h4>
                <p className="text-sm text-slate-400 max-w-sm">
                  {projects.length === 0
                    ? "Belum ada proyek yang terdaftar. Gunakan formulir di sebelah kiri untuk menambahkan proyek pertama Anda!"
                    : "Tidak ada proyek yang sesuai dengan kata kunci pencarian atau filter status Anda."}
                </p>
                {(searchQuery || statusFilter !== "semua") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("semua");
                    }}
                    className="mt-4 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition"
                  >
                    Bersihkan Filter
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {filteredProjects.map((project) => {
                  const isCurrentEditing = editingId === project.id;
                  return (
                    <div
                      key={project.id}
                      className={`group bg-white border rounded-2xl p-5 shadow-sm transition-all duration-300 relative flex flex-col justify-between ${
                        isCurrentEditing
                          ? "border-amber-400 ring-2 ring-amber-100 shadow-md shadow-amber-50"
                          : "border-slate-200/80 hover:border-slate-300 hover:shadow-md"
                      }`}
                    >
                      {/* Top Header Row of the Card */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase bg-slate-100 px-2 py-0.5 rounded">
                              ID: #{project.id}
                            </span>
                            {getStatusBadge(project.status)}
                          </div>
                          <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition text-base leading-tight mt-1.5">
                            {project.nama}
                          </h3>
                        </div>
                      </div>

                      {/* Card Meta Content */}
                      <div className="space-y-2.5 border-t border-slate-100 pt-3 mb-5 text-xs text-slate-600">
                        {/* Klien / Instansi */}
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                              Klien
                            </span>
                            <span className="font-semibold text-slate-800">{project.klien}</span>
                          </div>
                        </div>

                        {/* Rentang Waktu (Dates) */}
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                            <Calendar className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                              Waktu
                            </span>
                            <span className="font-medium text-slate-700">
                              {project.tanggalMulai} - {project.tanggalSelesai}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Actions Row of the Card */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                        
                        {/* 1. Quick Ubah Status Button (PATCH) */}
                        <button
                          disabled={actionLoadingId === `patch-${project.id}`}
                          onClick={() => handleStatusPatch(project.id, project.status)}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-70 disabled:cursor-wait"
                        >
                          {actionLoadingId === `patch-${project.id}` ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <PlayCircle className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-500" />
                          )}
                          Ubah Status
                        </button>

                        {/* Edit & Delete Action Buttons Row */}
                        <div className="flex items-center gap-2">
                          
                          {/* Edit Button (PUT load) */}
                          <button
                            onClick={() => handleEditClick(project)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 ${
                              isCurrentEditing
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200/80 hover:border-amber-200"
                            }`}
                          >
                            <Edit2 className="w-3 h-3" />
                            Edit
                          </button>

                          {/* Delete Button (DELETE request) */}
                          <button
                            disabled={actionLoadingId === `delete-${project.id}`}
                            onClick={() => handleDelete(project.id, project.nama)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-100 hover:border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-70 disabled:cursor-wait"
                          >
                            {actionLoadingId === `delete-${project.id}` ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                            Hapus
                          </button>

                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Modern Compact Footer */}
      <footer className="mt-20 border-t border-slate-200/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            &copy; 2026 Aplikasi Manajemen Proyek. All rights reserved.
          </div>
          <div>
            Sistem Administrasi Dashboard Modern &bull; Full-Stack React + Express + Tailwind
          </div>
        </div>
      </footer>
    </div>
  );
}
