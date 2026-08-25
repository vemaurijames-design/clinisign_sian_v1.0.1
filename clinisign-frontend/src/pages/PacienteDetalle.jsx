import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { toast } from "sonner";
import { ArrowLeft, FileText, FileSignature, FileMinus, Plus } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

function DocCard({ title, icon: Icon, items, color }) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`w-5 h-5 ${color}`} />
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <span className="ml-auto text-xs text-gray-400">{items.length} registros</span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Sin registros</p>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 5).map(item => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 text-sm">
              <span className="text-gray-600">
                {item.createdAt ? format(new Date(item.createdAt), "dd/MM/yyyy HH:mm", { locale: es }) : "—"}
              </span>
              <span className="text-gray-500 text-xs">{item.codigo}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PacienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [historias, setHistorias] = useState([]);
  const [consentimientos, setConsentimientos] = useState([]);
  const [desistimientos, setDesistimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/pacientes/${id}`),
      api.get(`/historias-clinicas?pacienteId=${id}&size=10`),
      api.get(`/consentimientos?pacienteId=${id}&size=10`),
      api.get(`/desistimientos?pacienteId=${id}&size=10`),
    ]).then(([p, h, c, d]) => {
      setPaciente(p.data);
      setHistorias(h.data.content || []);
      setConsentimientos(c.data.content || []);
      setDesistimientos(d.data.content || []);
    }).catch(() => toast.error("Error cargando datos")).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="animate-pulse p-6"><div className="h-8 bg-gray-200 rounded w-64 mb-4" /></div>;
  if (!paciente) return <div className="text-center py-20 text-gray-400">Paciente no encontrado</div>;

  const getAseguramiento = () => {
    const tipos = [];
    if (paciente.asegEps) tipos.push("EPS");
    if (paciente.asegSisben) tipos.push("SISBEN");
    if (paciente.asegSoat) tipos.push("SOAT");
    if (paciente.asegArl) tipos.push("ARL");
    if (paciente.asegFosyga) tipos.push("FOSYGA");
    if (paciente.asegPrepagada) tipos.push("PREPAGADA");
    if (paciente.asegParticular) tipos.push("PARTICULAR");
    if (paciente.asegNinguno) tipos.push("NINGUNO");
    return tipos.join(", ") || "—";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/pacientes")} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{paciente.nombreCompleto}</h1>
          <p className="text-sm text-gray-500">{paciente.tipoIdentificacion} {paciente.numeroIdentificacion}</p>
        </div>
      </div>

      {/* Info del paciente */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Información del Paciente</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {[
            ["Nombres", paciente.nombres],
            ["Apellidos", paciente.apellidos],
            ["Documento", `${paciente.tipoIdentificacion} ${paciente.numeroIdentificacion}`],
            ["Fecha Nacimiento", paciente.fechaNacimiento || "—"],
            ["Edad", paciente.edad ? `${paciente.edad} años` : "—"],
            ["Género", paciente.genero === "F" ? "Femenino" : paciente.genero === "M" ? "Masculino" : "—"],
            ["Estado Civil", paciente.estadoCivil || "—"],
            ["Municipio", paciente.municipio || "—"],
            ["Celular", paciente.celular || "—"],
            ["Teléfono", paciente.telefono || "—"],
            ["Ocupación", paciente.ocupacion || "—"],
            ["Aseguramiento", getAseguramiento()],
            ["EPS", paciente.nombreEps || "—"],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-gray-500 text-xs mb-0.5">{label}</p>
              <p className="text-gray-800 font-medium">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="flex gap-3 flex-wrap">
        <Link
          to={`/historias-clinicas/nueva?pacienteId=${id}`}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Nueva Historia Clínica
        </Link>
        <Link
          to={`/consentimientos/nuevo?pacienteId=${id}`}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <FileSignature className="w-4 h-4" /> Nuevo Consentimiento
        </Link>
        <Link
          to={`/desistimientos/nuevo?pacienteId=${id}`}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <FileMinus className="w-4 h-4" /> Nuevo Desistimiento
        </Link>
      </div>

      {/* Documentos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DocCard title="Historias Clínicas" icon={FileText} items={historias} color="text-blue-500" />
        <DocCard title="Consentimientos Informados" icon={FileSignature} items={consentimientos} color="text-green-500" />
        <DocCard title="Desistimientos Informados" icon={FileMinus} items={desistimientos} color="text-orange-500" />
      </div>
    </div>
  );
}
