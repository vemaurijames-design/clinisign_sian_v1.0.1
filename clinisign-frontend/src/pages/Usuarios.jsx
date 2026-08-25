import { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "sonner";
import { Plus, Edit, Trash2, X, ShieldCheck } from "lucide-react";

const ROLES = ["ADMIN", "COORDINADOR", "AUXILIAR_APH", "CONDUCTOR", "MEDICO"];
const TIPO_DOC = ["CC", "TI", "CE", "PE"];

function UsuarioModal({ usuario, onClose, onSaved }) {
  const [form, setForm] = useState(usuario || {
    nombres: "", apellidos: "", email: "", password: "",
    rol: "AUXILIAR_APH", documentoTipo: "CC", documentoNumero: "",
    telefono: "", registroProfesional: ""
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (usuario?.id) {
        await api.put(`/usuarios/${usuario.id}`, form);
        toast.success("Usuario actualizado");
      } else {
        await api.post("/usuarios", form);
        toast.success("Usuario creado");
      }
      onSaved(); onClose();
    } catch (err) {
      toast.error(err.response?.status === 409 ? "El email ya está registrado" : "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold">{usuario?.id ? "Editar Usuario" : "Nuevo Usuario"}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nombres *</label>
              <input required className="input-field" value={form.nombres} onChange={e => set("nombres", e.target.value)} />
            </div>
            <div>
              <label className="label">Apellidos *</label>
              <input required className="input-field" value={form.apellidos} onChange={e => set("apellidos", e.target.value)} />
            </div>
            <div>
              <label className="label">Email *</label>
              <input required type="email" className="input-field" value={form.email} onChange={e => set("email", e.target.value)} disabled={!!usuario?.id} />
            </div>
            <div>
              <label className="label">{usuario?.id ? "Nueva Contraseña (opcional)" : "Contraseña *"}</label>
              <input
                type="password"
                required={!usuario?.id}
                className="input-field"
                value={form.password || ""}
                onChange={e => set("password", e.target.value)}
                placeholder={usuario?.id ? "Dejar vacío para no cambiar" : ""}
              />
            </div>
            <div>
              <label className="label">Rol *</label>
              <select className="input-field" value={form.rol} onChange={e => set("rol", e.target.value)}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Tipo Documento</label>
              <select className="input-field" value={form.documentoTipo || "CC"} onChange={e => set("documentoTipo", e.target.value)}>
                {TIPO_DOC.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Número Documento</label>
              <input className="input-field" value={form.documentoNumero || ""} onChange={e => set("documentoNumero", e.target.value)} />
            </div>
            <div>
              <label className="label">Teléfono</label>
              <input type="tel" className="input-field" value={form.telefono || ""} onChange={e => set("telefono", e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="label">Registro Profesional</label>
              <input className="input-field" value={form.registroProfesional || ""} onChange={e => set("registroProfesional", e.target.value)} placeholder="RET, REG, etc." />
            </div>
          </div>
          <div className="flex justify-end gap-3">
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

const BADGE_ROL = {
  ADMIN:         "bg-purple-100 text-purple-700",
  COORDINADOR:   "bg-blue-100 text-blue-700",
  AUXILIAR_APH:  "bg-green-100 text-green-700",
  CONDUCTOR:     "bg-yellow-100 text-yellow-700",
  MEDICO:        "bg-red-100 text-red-700",
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/usuarios");
      setUsuarios(data);
    } catch { toast.error("Error cargando usuarios"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsuarios(); }, []);

  const handleDelete = async (id, nombre) => {
    if (!confirm(`¿Eliminar usuario ${nombre}?`)) return;
    try {
      await api.delete(`/usuarios/${id}`);
      toast.success("Usuario eliminado");
      fetchUsuarios();
    } catch { toast.error("Error al eliminar"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-sian-500" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-sm text-gray-500">Solo administradores · {usuarios.length} usuarios activos</p>
          </div>
        </div>
        <button onClick={() => setModal("new")} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Nuevo Usuario
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Nombre", "Email", "Rol", "Documento", "Teléfono", "Registro Prof.", "Acciones"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                  <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                ))}</tr>
              ))
            ) : usuarios.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{u.nombres} {u.apellidos}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${BADGE_ROL[u.rol] || "bg-gray-100 text-gray-700"}`}>
                    {u.rol}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {u.documentoTipo} {u.documentoNumero}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{u.telefono || "—"}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{u.registroProfesional || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setModal(u)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(u.id, `${u.nombres} ${u.apellidos}`)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <UsuarioModal
          usuario={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchUsuarios}
        />
      )}
    </div>
  );
}
