import { useRef, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import api from "../api/axios";
import { toast } from "sonner";
import { ArrowLeft, RotateCcw, Save, Printer } from "lucide-react";

const CALIDADES = ["PACIENTE", "ACOMPAÑANTE", "FAMILIAR", "RESPONSABLE"];

export default function ConsentimientoForm() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const firmaSigRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [paciente, setPaciente] = useState(null);

  const [form, setForm] = useState({
    pacienteId: params.get("pacienteId") || "",
    nombrePaciente: "",
    numeroIdentidad: "",
    calidad: "PACIENTE",
    responsableDe: "",
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
        setPaciente(data);
        set("pacienteId", pid);
        set("nombrePaciente", data.nombreCompleto);
        set("numeroIdentidad", data.numeroIdentificacion);
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
      await api.post("/consentimientos", { ...form, firmaPaciente });
      toast.success("Consentimiento registrado exitosamente");
      navigate(-1);
    } catch {
      toast.error("Error al guardar el consentimiento");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 print:hidden">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Consentimiento Informado</h1>
          <p className="text-xs text-gray-400">HC-FM-04 · Versión 01 · Diciembre 2024</p>
        </div>
        <button onClick={handlePrint} className="ml-auto btn-secondary flex items-center gap-2 text-sm print:hidden">
          <Printer className="w-4 h-4" /> Imprimir
        </button>
      </div>

      {/* Documento */}
      <div className="card space-y-6">
        {/* Encabezado clínica */}
        <div className="flex items-start justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-sian-500 rounded-xl flex items-center justify-center text-white font-bold text-xs text-center leading-tight p-1">
              SIAN<br />SALUD<br />AMB.
            </div>
            <div>
              <h2 className="text-lg font-bold">CONSENTIMIENTO INFORMADO</h2>
              <p className="text-xs text-gray-500">AMBULANCIAS SIAN SALUD S.A.S.</p>
            </div>
          </div>
          <div className="text-xs text-gray-600 text-right border border-gray-300 p-2 rounded">
            <p><strong>CÓDIGO:</strong> HC-FM-04</p>
            <p><strong>VERSIÓN:</strong> 01</p>
            <p><strong>FECHA:</strong> DICIEMBRE 2024</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fecha y hora */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="label">Fecha</label>
              <input type="date" className="input-field" defaultValue={new Date().toISOString().split("T")[0]} />
            </div>
            <div>
              <label className="label">Hora</label>
              <input type="time" className="input-field" defaultValue={new Date().toTimeString().slice(0, 5)} />
            </div>
          </div>

          {/* Datos paciente */}
          <div className="space-y-4">
            <div>
              <label className="label">Yo (nombre completo del paciente)</label>
              <input required className="input-field" value={form.nombrePaciente} onChange={e => set("nombrePaciente", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Documento de Identidad No.</label>
                <input required className="input-field" value={form.numeroIdentidad} onChange={e => set("numeroIdentidad", e.target.value)} />
              </div>
              <div>
                <label className="label">En calidad de</label>
                <select className="input-field" value={form.calidad} onChange={e => set("calidad", e.target.value)}>
                  {CALIDADES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            {form.calidad !== "PACIENTE" && (
              <div>
                <label className="label">Responsable de</label>
                <input className="input-field" value={form.responsableDe} onChange={e => set("responsableDe", e.target.value)} />
              </div>
            )}
          </div>

          {/* Procedimientos */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">
              Con el presente documento doy fe que he sido informado por el Auxiliar de Enfermería/APH de <strong>Sian Salud SAS</strong> sobre los procedimientos requeridos para mi atención:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["procInmovilizacion", "Inmovilización y traslado en camilla"],
                ["procOxigeno", "Administración de oxígeno"],
                ["procMedicamentos", "Administración de medicamentos (líquidos endovenosos, entre otros)"],
                ["procTraslado", "Traslado y transporte"],
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
              <label className="label">Otro procedimiento</label>
              <input className="input-field" placeholder="Especificar..." value={form.procOtro} onChange={e => set("procOtro", e.target.value)} />
            </div>
          </div>

          {/* Texto legal */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-2 leading-relaxed">
            <p><strong>Beneficios:</strong> El traslado se hace en ambulancia de transporte asistencial baja complejidad, acompañado por personal Auxiliar de enfermería/APH y un conductor debidamente entrenado. El vehículo dispone del material y medicación necesaria...</p>
            <p><strong>Riesgos:</strong> Durante el traslado pueden surgir complicaciones. Aunque la conducción se hace acorde a la patología del paciente, existen riesgos debidos al propio transporte (vibraciones, aceleración, desaceleración, accidente, avería, etc.)</p>
            <p className="font-medium">Dejo constancia de haber comprendido la información que he recibido y acepto que dichos procedimientos o tratamientos se realicen por parte del personal Auxiliar de Enfermería/APH de Sian Salud SAS, acorde a la resolución 3100 de 2019.</p>
          </div>

          {/* Firma digital */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label">Firma del Paciente (*)</label>
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

            {/* Huella digital placeholder */}
            <div>
              <label className="label">Huella Digital</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg h-[120px] flex items-center justify-center bg-gray-50">
                <p className="text-xs text-gray-400 text-center">
                  Espacio para<br />huella digital
                </p>
              </div>
              <p className="text-xs text-gray-400 mt-1">Captura biométrica disponible con dispositivo externo</p>
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
              {loading ? "Guardando..." : "Guardar Consentimiento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
