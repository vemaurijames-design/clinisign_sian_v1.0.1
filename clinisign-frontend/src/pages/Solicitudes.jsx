import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { toast } from "sonner";
import { Plus, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

const TIPOS = ["TRASLADO", "EMERGENCIA", "URGENCIA", "CONSULTA"];
const PRIORIDADES = ["ALTA", "MEDIA", "BAJA"];
const ESTADOS = ["", "PENDIENTE", "EN_PROCESO", "COMPLETADA", "CANCELADA"];

function BadgeEstado({ estado }) {
  const cls = {
    PENDIENTE:   "badge-pendiente",
    EN_PROCESO:  "badge-en-proceso",
    COMPLETADA:  "badge-completada",
    CANCELADA:   "badge-cancelada",
  };
  return <span className={cls[estado] || "text-xs text-gray-500"}>{estado?.replace("_", " ")}</span>;
}

function BadgePrioridad({ prioridad }) {
  const cls = { ALTA: "text-red-600 font-bold", MEDIA: "text-yellow-600 font-semibold", BAJA: "text-gray-500" };
  return <span className={`text-xs ${cls[prioridad]}`}>{prioridad}</span>;
}

function NuevaSolicitudModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    tipo: "TRASLADO", prioridad: "MEDIA", descripcion: "",
    origen: "", destino: "", municipioOrigen: "Medellín", municipioDestino: "", observaciones: ""
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/solicitudes", form);
      toast.success("Solicitud creada");
      onSaved(); onClose();
    } catch {
      toast.error("Error al crear solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold">Nueva Solicitud</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Tipo *</label>
              <select className="input-field" value={form.tipo} onChange={e => set("tipo", e.target.value)}>
                {TIPOS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Prioridad *</label>
              <select className="input-field" value={form.prioridad} onChange={e => set("prioridad", e.target.value)}>
                {PRIORIDADES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Origen</label>
              <input className="input-field" value={form.origen} onChange={e => set("origen", e.target.value)} placeholder="Dirección de origen" />
            </div>
            <div>
              <label className="label">Destino</label>
              <input className="input-field" value={form.destino} onChange={e => set("destino", e.target.value)} placeholder="Dirección de destino" />
            </div>
            <div>
              <label className="label">Municipio Origen</label>
              <input className="input-field" value={form.municipioOrigen} onChange={e => set("municipioOrigen", e.target.value)} />
            </div>
            <div>
              <label className="label">Municipio Destino</label>
              <input className="input-field" value={form.municipioDestino} onChange={e => set("municipioDestino", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Descripción / Motivo</label>
            <textarea rows={3} className="input-field" value={form.descripcion} onChange={e => set("descripcion", e.target.value)} />
          </div>
          <div>
            <label className="label">Observaciones</label>
            <textarea rows={2} className="input-field" value={form.observaciones} onChange={e => set("observaciones", e.target.value)} />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Guardando..." : "Crear Solicitud"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, size: 15 });
      if (filtroEstado) params.append("estado", filtroEstado);
      const { data } = await api.get(`/solicitudes?${params}`);
      setSolicitudes(data.content);
      setTotalPages(data.totalPages);
    } catch { toast.error("Error cargando solicitudes"); }
    finally { setLoading(false); }
  }, [page, filtroEstado]);

  useEffect(() => { fetch(); }, [fetch]);

  const cambiarEstado = async (id, estado) => {
    try {
      await api.patch(`/solicitudes/${id}/estado`, { estado });
      toast.success(`Estado actualizado: ${estado}`);
      fetch();
    } catch { toast.error("Error al cambiar estado"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Solicitudes de Traslado</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Nueva Solicitud
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {ESTADOS.map(e => (
          <button
            key={e}
            onClick={() => { setFiltroEstado(e); setPage(0); }}
            className={clsx(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              filtroEstado === e
                ? "bg-sian-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {e || "TODAS"}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["N° Solicitud", "Tipo", "Prioridad", "Paciente", "Origen → Destino", "Estado", "Acciones"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : solicitudes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">No hay solicitudes</td>
                </tr>
              ) : (
                solicitudes.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.numeroSolicitud || `#${s.id}`}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{s.tipo}</span>
                    </td>
                    <td className="px-4 py-3"><BadgePrioridad prioridad={s.prioridad} /></td>
                    <td className="px-4 py-3 text-gray-700">{s.nombrePaciente || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      <div>{s.origen || "—"}</div>
                      <div className="text-gray-400">→ {s.destino || "—"}</div>
                    </td>
                    <td className="px-4 py-3"><BadgeEstado estado={s.estado} /></td>
                    <td className="px-4 py-3">
                      <select
                        className="text-xs border border-gray-200 rounded px-2 py-1 bg-white text-gray-600"
                        value={s.estado}
                        onChange={e => cambiarEstado(s.id, e.target.value)}
                      >
                        <option value="PENDIENTE">PENDIENTE</option>
                        <option value="EN_PROCESO">EN PROCESO</option>
                        <option value="COMPLETADA">COMPLETADA</option>
                        <option value="CANCELADA">CANCELADA</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <p className="text-sm text-gray-500">Página {page + 1} de {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn-secondary p-1.5 disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="btn-secondary p-1.5 disabled:opacity-40">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && <NuevaSolicitudModal onClose={() => setShowModal(false)} onSaved={fetch} />}
    </div>
  );
}
