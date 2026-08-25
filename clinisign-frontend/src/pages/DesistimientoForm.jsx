import { useRef, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import api from "../api/axios";
import { toast } from "sonner";
import { ArrowLeft, RotateCcw, Save } from "lucide-react";

export default function DesistimientoForm() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const firmaSigRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    pacienteId: params.get("pacienteId") || "",
    nombrePersonalSalud: "",
    procInmovilizacion: false,
    procOxigeno: false,
    procMedicamentos: false,
    procTraslado: false,
    procOtro: "",
    telefonoPaciente: "",
    nombreAcompanante: "",
    nombreAuxiliarAph: "",
    documentoAuxiliar: "",
    registroAuxiliar: "",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    const pid = params.get("pacienteId");
    if (pid) {
      api.get(`/pacientes/${pid}`).then(({ data }) => {
        set("telefonoPaciente", data.celular || "");
      }).catch(() => {});
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (firmaSigRef.current?.isEmpty()) {
      toast.error("La firma del paciente es obligatoria");
      return;
    }
    setLoading(true);
    try {
      const firmaPaciente = firmaSigRef.current.getTrimmedCanvas().toDataURL("image/png");
      await api.post("/desistimientos", { ...form, firmaPaciente });
      toast.success("Desistimiento registrado exitosamente");
      navigate(-1);
    } catch {
      toast.error("Error al guardar el desistimiento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Desistimiento Informado</h1>
          <p className="text-xs text-gray-400">HC-FM-06 · Versión 01 · Diciembre 2024</p>
        </div>
      </div>

      <div className="card space-y-6">
        {/* Encabezado */}
        <div className="flex items-start justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-sian-500 rounded-xl flex items-center justify-center text-white font-bold text-xs text-center leading-tight p-1">
              SIAN<br />SALUD<br />AMB.
            </div>
            <h2 className="text-lg font-bold">DESISTIMIENTO INFORMADO</h2>
          </div>
          <div className="text-xs text-gray-600 text-right border border-gray-300 p-2 rounded">
            <p><strong>CÓDIGO:</strong> HC-FM-06</p>
            <p><strong>VERSIÓN:</strong> 01</p>
            <p><strong>FECHA:</strong> DICIEMBRE 2024</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fecha y hora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Fecha</label>
              <input type="date" className="input-field" defaultValue={new Date().toISOString().split("T")[0]} />
            </div>
            <div>
              <label className="label">Hora</label>
              <input type="time" className="input-field" defaultValue={new Date().toTimeString().slice(0, 5)} />
            </div>
          </div>

          {/* Texto introductorio */}
          <div>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              En el presente documento manifiesto que he sido informado por parte del personal Auxiliar de Enfermería/APH de Salud:
            </p>
            <input required className="input-field" placeholder="Nombre del personal de salud" value={form.nombrePersonalSalud} onChange={e => set("nombrePersonalSalud", e.target.value)} />
            <p className="text-sm text-gray-700 mt-3 leading-relaxed">
              ...sobre mis problemas de salud, sus características y manifestaciones principales, las posibles alternativas de tratamiento, las eventuales complicaciones y riesgos del no tratamiento.
            </p>
          </div>

          {/* Procedimientos rechazados */}
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">
              Por tal motivo, <span className="uppercase font-bold">DECIDO CONSCIENTEMENTE NO SOMETERME</span> a los siguientes procedimientos:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["procInmovilizacion", "Inmovilización y traslado en camilla"],
                ["procOxigeno", "Administración de oxígeno"],
                ["procMedicamentos", "Administración de medicamentos"],
                ["procTraslado", "Atención y Traslado"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-start gap-2 text-sm cursor-pointer border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={!!form[key]}
                    onChange={e => set(key, e.target.checked)}
                    className="mt-0.5 rounded"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <div className="mt-3">
              <label className="label">Otros</label>
              <textarea rows={2} className="input-field" value={form.procOtro} onChange={e => set("procOtro", e.target.value)} />
            </div>
          </div>

          {/* Texto legal */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm text-gray-700">
            <p className="font-bold text-orange-700 mb-2">ASUMO LOS RIESGOS DE NO TRASLADO BAJO MI PROPIA RESPONSABILIDAD.</p>
            <p>Ya que la historia clínica es un documento privado, sometido a reserva, que únicamente puede ser conocido por terceros previa autorización del paciente o en los casos previstos por la ley, acepto además que el personal profesional y de auditoría acceda a la información consignada en el reporte de atención TAB.</p>
          </div>

          {/* Firma */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label">Firma (*)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white">
                <SignatureCanvas
                  ref={firmaSigRef}
                  penColor="#1a1a1a"
                  canvasProps={{ width: 300, height: 120, className: "w-full" }}
                />
              </div>
              <button type="button" onClick={() => firmaSigRef.current?.clear()}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mt-1">
                <RotateCcw className="w-3 h-3" /> Limpiar firma
              </button>
              <div className="mt-2">
                <label className="label text-xs">Teléfono del paciente</label>
                <input className="input-field text-sm" value={form.telefonoPaciente} onChange={e => set("telefonoPaciente", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Huella Digital</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg h-[120px] flex items-center justify-center bg-gray-50">
                <p className="text-xs text-gray-400 text-center">Espacio para<br />huella digital</p>
              </div>
            </div>
          </div>

          {/* Personal */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre acompañante mayor de edad (*)</label>
              <input className="input-field" value={form.nombreAcompanante} onChange={e => set("nombreAcompanante", e.target.value)} />
            </div>
            <div>
              <label className="label">Nombre Auxiliar Enfermería/APH (*)</label>
              <input required className="input-field" value={form.nombreAuxiliarAph} onChange={e => set("nombreAuxiliarAph", e.target.value)} />
            </div>
            <div>
              <label className="label">Documento de Identidad</label>
              <input className="input-field" value={form.documentoAuxiliar} onChange={e => set("documentoAuxiliar", e.target.value)} />
            </div>
            <div>
              <label className="label">Registro</label>
              <input className="input-field" value={form.registroAuxiliar} onChange={e => set("registroAuxiliar", e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              {loading ? "Guardando..." : "Guardar Desistimiento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
