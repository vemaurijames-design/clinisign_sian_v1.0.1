import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { toast } from "sonner";
import {
  Plus, Search, Download, Upload, Edit, Trash2, Eye,
  Users, ChevronLeft, ChevronRight, X
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const TIPO_IDS = ["CC", "TI", "RC", "CE", "PE"];

function PacienteModal({ paciente, onClose, onSaved }) {
  const [form, setForm] = useState(paciente || {
    tipoIdentificacion: "CC", numeroIdentificacion: "", nombres: "",
    apellidos: "", fechaNacimiento: "", edad: "", genero: "", estadoCivil: "",
    municipio: "Medellín", celular: "", telefono: "", ocupacion: "",
    asegEps: false, asegSisben: false, asegSoat: false, asegArl: false,
    asegFosyga: false, asegPrepagada: false, asegParticular: false, asegNinguno: false,
    nombreEps: ""
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (paciente?.id) {
        await api.put(`/pacientes/${paciente.id}`, form);
        toast.success("Paciente actualizado");
      } else {
        await api.post("/pacientes", form);
        toast.success("Paciente creado");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">{paciente?.id ? "Editar Paciente" : "Nuevo Paciente"}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Tipo de ID</label>
              <select className="input-field" value={form.tipoIdentificacion} onChange={e => set("tipoIdentificacion", e.target.value)}>
                {TIPO_IDS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Número de Identificación *</label>
              <input required className="input-field" value={form.numeroIdentificacion} onChange={e => set("numeroIdentificacion", e.target.value)} />
            </div>
            <div>
              <label className="label">Nombres *</label>
              <input required className="input-field" value={form.nombres} onChange={e => set("nombres", e.target.value)} />
            </div>
            <div>
              <label className="label">Apellidos *</label>
              <input required className="input-field" value={form.apellidos} onChange={e => set("apellidos", e.target.value)} />
            </div>
            <div>
              <label className="label">Fecha de Nacimiento</label>
              <input type="date" className="input-field" value={form.fechaNacimiento || ""} onChange={e => set("fechaNacimiento", e.target.value)} />
            </div>
            <div>
              <label className="label">Edad</label>
              <input type="number" min="0" max="120" className="input-field" value={form.edad || ""} onChange={e => set("edad", e.target.value)} />
            </div>
            <div>
              <label className="label">Género</label>
              <select className="input-field" value={form.genero || ""} onChange={e => set("genero", e.target.value)}>
                <option value="">Seleccionar</option>
                <option value="F">Femenino</option>
                <option value="M">Masculino</option>
              </select>
            </div>
            <div>
              <label className="label">Estado Civil</label>
              <select className="input-field" value={form.estadoCivil || ""} onChange={e => set("estadoCivil", e.target.value)}>
                <option value="">Seleccionar</option>
                {["Soltero/a", "Casado/a", "Unión libre", "Divorciado/a", "Viudo/a"].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Municipio</label>
              <input className="input-field" value={form.municipio || ""} onChange={e => set("municipio", e.target.value)} />
            </div>
            <div>
              <label className="label">Celular</label>
              <input type="tel" className="input-field" value={form.celular || ""} onChange={e => set("celular", e.target.value)} />
            </div>
            <div>
              <label className="label">Teléfono</label>
              <input type="tel" className="input-field" value={form.telefono || ""} onChange={e => set("telefono", e.target.value)} />
            </div>
            <div>
              <label className="label">Ocupación</label>
              <input className="input-field" value={form.ocupacion || ""} onChange={e => set("ocupacion", e.target.value)} />
            </div>
          </div>

          {/* Aseguramiento */}
          <div>
            <label className="label">Tipo de Aseguramiento</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                ["asegEps", "EPS"], ["asegSisben", "SISBEN"], ["asegSoat", "SOAT"],
                ["asegArl", "ARL"], ["asegFosyga", "FOSYGA"], ["asegPrepagada", "PREPAGADA"],
                ["asegParticular", "PARTICULAR"], ["asegNinguno", "NINGUNO"]
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={!!form[key]} onChange={e => set(key, e.target.checked)} className="rounded" />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {form.asegEps && (
            <div>
              <label className="label">Nombre EPS</label>
              <input className="input-field" value={form.nombreEps || ""} onChange={e => set("nombreEps", e.target.value)} />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Pacientes() {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [modal, setModal] = useState(null); // null | "new" | paciente

  const fetchPacientes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, size: 15 });
      if (search) params.append("q", search);
      const { data } = await api.get(`/pacientes?${params}`);
      setPacientes(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch {
      toast.error("Error cargando pacientes");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchPacientes(); }, [fetchPacientes]);

  const handleDelete = async (id, nombre) => {
    if (!confirm(`¿Eliminar paciente ${nombre}?`)) return;
    try {
      await api.delete(`/pacientes/${id}`);
      toast.success("Paciente eliminado");
      fetchPacientes();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const handleExport = async () => {
    try {
      const res = await api.get("/pacientes/export-excel", { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pacientes_siansalud.xlsx";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Excel descargado");
    } catch {
      toast.error("Error al exportar");
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const { data } = await api.post("/pacientes/import-excel", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success(`${data.length} pacientes importados`);
      fetchPacientes();
    } catch {
      toast.error("Error al importar. Verifica el formato del Excel");
    }
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-sm text-gray-500">{totalElements} pacientes registrados</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> Excel
          </button>
          <label className="btn-secondary flex items-center gap-2 text-sm cursor-pointer">
            <Upload className="w-4 h-4" /> Importar
            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
          </label>
          <button onClick={() => setModal("new")} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Nuevo Paciente
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          className="input-field pl-9"
          placeholder="Buscar por nombre o documento..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
        />
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Documento", "Nombre", "Género", "Municipio", "Celular", "Aseguramiento", "Acciones"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : pacientes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    No hay pacientes registrados
                  </td>
                </tr>
              ) : (
                pacientes.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{p.tipoIdentificacion}</span>
                      <span className="ml-1">{p.numeroIdentificacion}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{p.nombreCompleto}</td>
                    <td className="px-4 py-3 text-gray-500">{p.genero === "F" ? "Femenino" : p.genero === "M" ? "Masculino" : "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{p.municipio || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{p.celular || "—"}</td>
                    <td className="px-4 py-3">
                      {p.asegEps && <span className="badge-completada">EPS</span>}
                      {p.asegSisben && <span className="badge-pendiente">SISBEN</span>}
                      {p.asegSoat && <span className="badge-en-proceso">SOAT</span>}
                      {p.asegParticular && <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">PARTICULAR</span>}
                      {p.asegNinguno && <span className="badge-cancelada">NINGUNO</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/pacientes/${p.id}`)} className="p-1.5 text-gray-400 hover:text-sian-600 hover:bg-sian-50 rounded-lg transition-colors" title="Ver detalle">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => setModal(p)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p.id, p.nombreCompleto)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <p className="text-sm text-gray-500">Página {page + 1} de {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="btn-secondary p-1.5 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="btn-secondary p-1.5 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <PacienteModal
          paciente={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchPacientes}
        />
      )}
    </div>
  );
}
