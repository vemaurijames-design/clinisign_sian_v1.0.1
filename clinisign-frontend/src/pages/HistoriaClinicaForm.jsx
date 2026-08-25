import { useRef, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import api from "../api/axios";
import { toast } from "sonner";
import { ArrowLeft, Save, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

// Secciones colapsables
function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span className="font-semibold text-sm text-gray-700">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="p-5 space-y-4">{children}</div>}
    </div>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input type="checkbox" checked={!!checked} onChange={e => onChange(e.target.checked)} className="rounded" />
      {label}
    </label>
  );
}

export default function HistoriaClinicaForm() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const firmaRef  = useRef(null);
  const firma2Ref = useRef(null);
  const firmaTHRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [paciente, setPaciente] = useState(null);

  const [form, setForm] = useState({
    pacienteId: params.get("pacienteId") || "",
    // 1. Info general
    placaMovil: "", conductor: "", tripulante: "", regTripulante: "", apoyo: "",
    origen: "", destino1: "", destino2: "", destinoFinal: "",
    clasificacion: "TRASLADO", tipoTraslado: "TAB_SENCILLO",
    // Responsable / Acompañante
    responsableNombre: "", responsableId: "", responsableParentesco: "", responsableTelefonos: "",
    acompananteNombre: "", acompananteId: "", acompananteParentesco: "", acompananteTelefonos: "",
    // 3. Cuidados
    cuidadosAnteriores: "",
    // 4. Arribo
    arriboCiudadano: false, arriboEmpleado: false, arriboSocorrista: false, arriboMedico: false,
    arriboEnfermera: false, arriboNadie: false, arriboPolicia: false, arriboSeguridad: false, arriboFamiliar: false,
    // 4. Evento
    eventoArrollamiento: false, eventoAccTrabajo: false, eventoAccQuimico: false, eventoAtrapamiento: false,
    eventoAgresion: false, eventoAutoinflingido: false, eventoCaida: false, eventoAmbiental: false,
    eventoCuerpoExtrano: false, eventoElectrocucion: false, eventoExplosion: false, eventoIncendio: false,
    eventoEnfComun: false, eventoGolpeImpacto: false, eventoAccTransito: false,
    // 5. Urgencia médica
    moParoCardio: false, moNeurologica: false, moOrgSentidos: false, moCardiovascular: false,
    moRespiratorio: false, moGastrointestinal: false, moGenitourinario: false, moGinecoObstetrica: false,
    moOsteomuscular: false, moPielAnexos: false, moMetabolica: false, moReaccionAlergica: false,
    moObstruccionVia: false, moPsiquiatrica: false, moEnvenenamiento: false, moCalorFrio: false,
    // 5.2 Trauma
    utPolitrauma: false, utEncefalocraneal: false, utMaxilofacial: false, utOrgSentidos: false,
    utRaquimedular: false, utTorax: false, utAbdominal: false, utPelvicoGenital: false,
    utTejidosBlandos: false, utOsteomuscular: false, utShock: false, utInhalacion: false, utIntoxicacion: false,
    // 6. Antecedentes
    antPatologias: false, antPatologiasCual: "", antCirugias: false, antCirugiasCual: "",
    antMedicamentos: false, antMedicamentosCual: "", antAlergias: false, antAlergiasCual: "",
    antFumador: false, antAlcohol: false, antSustanciasPsicoactivas: false,
    antOtraSustancia: "", antHoraUltimaIngesta: "",
    // 7. Examen
    exf1PresionArterial: "", exf1FrecuenciaCardiaca: "", exf1FrecuenciaResp: "", exf1SatO2: "",
    exf1Temperatura: "", exf1Glucometria: "", exf1Glasgow: "",
    exf2PresionArterial: "", exf2FrecuenciaCardiaca: "", exf2FrecuenciaResp: "", exf2SatO2: "",
    exf2Temperatura: "", exf2Glucometria: "", exf2Glasgow: "",
    peso: "", talla: "",
    // Piel
    pielNormal: false, pielHumeda: false, pielPalida: false, pielEnrojecida: false, pielFria: false,
    pielIcterica: false, pielCaliente: false, pielCianotica: false, pielSeca: false,
    // Estado hemodinámico
    hemoEstable: false, hemoInestable: false, hemoParoResp: false, hemoParoCardio: false,
    // Glasgow
    glasgowOcular: "", glasgowVerbal: "", glasgowMotor: "",
    // Diagnóstico
    evolucion: "", diagnosticoCie10: "", diagnosticoDescripcion: "", complicaciones: "",
    // Personal de entrega
    ccTalentoHumano: "",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    const pid = params.get("pacienteId");
    if (pid) {
      api.get(`/pacientes/${pid}`).then(({ data }) => {
        setPaciente(data);
        set("pacienteId", pid);
      }).catch(() => {});
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (!firmaSigRef?.current?.isEmpty()) payload.firmaPaciente = firmaSigRef.current?.getTrimmedCanvas().toDataURL();
      if (!firma2Ref?.current?.isEmpty()) payload.firmaAcompanante = firma2Ref.current?.getTrimmedCanvas().toDataURL();
      if (!firmaTHRef?.current?.isEmpty()) payload.firmaTalentoHumano = firmaTHRef.current?.getTrimmedCanvas().toDataURL();

      await api.post("/historias-clinicas", payload);
      toast.success("Historia Clínica guardada exitosamente");
      navigate(-1);
    } catch {
      toast.error("Error al guardar la Historia Clínica");
    } finally {
      setLoading(false);
    }
  };

  const firmaSigRef = firmaRef;

  const SigPad = ({ ref: r, label }) => (
    <div>
      <label className="label">{label}</label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white">
        <SignatureCanvas ref={r} penColor="#1a1a1a" canvasProps={{ width: 280, height: 100, className: "w-full" }} />
      </div>
      <button type="button" onClick={() => r.current?.clear()} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mt-1">
        <RotateCcw className="w-3 h-3" /> Limpiar
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Historia Clínica</h1>
          <p className="text-xs text-gray-400">HC-FM-05 · Versión 01 · Enero 2024</p>
        </div>
      </div>

      {/* Encabezado del documento */}
      <div className="card">
        <div className="flex items-start justify-between border-b pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-sian-500 rounded-xl flex items-center justify-center text-white font-bold text-xs text-center leading-tight p-1">
              SIAN<br />SALUD<br />AMB.
            </div>
            <div>
              <h2 className="text-xl font-bold">HISTORIA CLÍNICA</h2>
              <p className="text-xs text-gray-500">AMBULANCIAS SIAN SALUD S.A.S.</p>
            </div>
          </div>
          <div className="text-xs text-gray-600 text-right border border-gray-300 p-2 rounded">
            <p><strong>CÓDIGO:</strong> HC-FM-05</p>
            <p><strong>VERSIÓN:</strong> 01</p>
            <p><strong>FECHA:</strong> ENERO 2024</p>
          </div>
        </div>

        {paciente && (
          <div className="bg-sian-50 rounded-lg p-3 text-sm mb-4">
            <p className="font-semibold text-sian-700">Paciente: {paciente.nombreCompleto}</p>
            <p className="text-sian-600 text-xs">{paciente.tipoIdentificacion} {paciente.numeroIdentificacion}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Información General */}
        <Section title="1. Información General">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Fecha</label>
              <input type="date" className="input-field" defaultValue={new Date().toISOString().split("T")[0]} />
            </div>
            <div>
              <label className="label">Placa Móvil</label>
              <input className="input-field" value={form.placaMovil} onChange={e => set("placaMovil", e.target.value)} />
            </div>
            <div>
              <label className="label">Hora Despacho</label>
              <input type="time" className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Origen</label>
              <input className="input-field" value={form.origen} onChange={e => set("origen", e.target.value)} />
            </div>
            <div>
              <label className="label">Destino 1</label>
              <input className="input-field" value={form.destino1} onChange={e => set("destino1", e.target.value)} />
            </div>
            <div>
              <label className="label">Destino 2</label>
              <input className="input-field" value={form.destino2} onChange={e => set("destino2", e.target.value)} />
            </div>
            <div>
              <label className="label">Destino Final</label>
              <input className="input-field" value={form.destinoFinal} onChange={e => set("destinoFinal", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Clasificación de la Atención</label>
            <div className="flex gap-4">
              {["TRASLADO", "EMERGENCIA", "URGENCIA", "CONSULTA"].map(c => (
                <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="clasificacion" value={c} checked={form.clasificacion === c} onChange={() => set("clasificacion", c)} />
                  {c}
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Conductor</label>
              <input className="input-field" value={form.conductor} onChange={e => set("conductor", e.target.value)} />
            </div>
            <div>
              <label className="label">Tripulante</label>
              <input className="input-field" value={form.tripulante} onChange={e => set("tripulante", e.target.value)} />
            </div>
            <div>
              <label className="label">Reg. Tripulante</label>
              <input className="input-field" value={form.regTripulante} onChange={e => set("regTripulante", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Tipo de Traslado/Servicio</label>
            <div className="flex gap-4 flex-wrap">
              {["TAB_SENCILLO", "TAB_DOBLE", "TAM_SENCILLO", "TAM_DOBLE", "APH"].map(t => (
                <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="tipoTraslado" value={t} checked={form.tipoTraslado === t} onChange={() => set("tipoTraslado", t)} />
                  {t.replace("_", " ")}
                </label>
              ))}
            </div>
          </div>
        </Section>

        {/* 2. Identificación del Paciente */}
        <Section title="2. Identificación del Paciente">
          {paciente ? (
            <div className="grid grid-cols-3 gap-3 text-sm">
              {[
                ["Nombre", paciente.nombreCompleto],
                ["Documento", `${paciente.tipoIdentificacion} ${paciente.numeroIdentificacion}`],
                ["Municipio", paciente.municipio],
                ["Celular", paciente.celular],
                ["EPS", paciente.nombreEps],
              ].map(([l, v]) => v ? (
                <div key={l}><span className="text-gray-500">{l}:</span> <strong>{v}</strong></div>
              ) : null)}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Selecciona un paciente desde la ficha del paciente para autocompletar.</p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Responsable</label>
              <input className="input-field" value={form.responsableNombre} onChange={e => set("responsableNombre", e.target.value)} />
            </div>
            <div>
              <label className="label">Parentesco</label>
              <input className="input-field" value={form.responsableParentesco} onChange={e => set("responsableParentesco", e.target.value)} />
            </div>
            <div>
              <label className="label">Acompañante</label>
              <input className="input-field" value={form.acompananteNombre} onChange={e => set("acompananteNombre", e.target.value)} />
            </div>
            <div>
              <label className="label">Parentesco</label>
              <input className="input-field" value={form.acompananteParentesco} onChange={e => set("acompananteParentesco", e.target.value)} />
            </div>
          </div>
        </Section>

        {/* 3. Cuidados anteriores */}
        <Section title="3. Cuidados Anteriores al Arribo" defaultOpen={false}>
          <textarea rows={3} className="input-field" value={form.cuidadosAnteriores} onChange={e => set("cuidadosAnteriores", e.target.value)} placeholder="Describe los cuidados anteriores..." />
        </Section>

        {/* 4. Tipo de evento */}
        <Section title="4. Tipo de Evento" defaultOpen={false}>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Arribo - Quién reporta</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                ["arriboCiudadano","Ciudadano"], ["arriboEmpleado","Empleado"], ["arriboSocorrista","Socorrista"],
                ["arriboMedico","Médico"], ["arriboEnfermera","Enfermera"], ["arriboNadie","Nadie"],
                ["arriboPolicia","Policía"], ["arriboSeguridad","Seguridad"], ["arriboFamiliar","Familiar"],
              ].map(([k, l]) => <Checkbox key={k} label={l} checked={form[k]} onChange={v => set(k, v)} />)}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Causa del Evento</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                ["eventoArrollamiento","Arrollamiento"], ["eventoAccTrabajo","Acc. de trabajo"],
                ["eventoAccQuimico","Acc. Químico"], ["eventoAtrapamiento","Atrapamiento"],
                ["eventoAgresion","Agresión"], ["eventoAutoinflingido","Autoinflingido"],
                ["eventoCaida","Caída"], ["eventoAmbiental","Ambiental"],
                ["eventoCuerpoExtrano","Cuerpo extraño"], ["eventoElectrocucion","Electrocución"],
                ["eventoExplosion","Explosión"], ["eventoIncendio","Incendio"],
                ["eventoEnfComun","Enfermedad común"], ["eventoGolpeImpacto","Golpe/impacto"],
                ["eventoAccTransito","Acc. de tránsito"],
              ].map(([k, l]) => <Checkbox key={k} label={l} checked={form[k]} onChange={v => set(k, v)} />)}
            </div>
          </div>
        </Section>

        {/* 5. Motivo de consulta */}
        <Section title="5. Motivo de Consulta / Traslado" defaultOpen={false}>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">5.1 Urgencia Médica</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                ["moParoCardio","Paro cardio resp."], ["moNeurologica","Neurológica"], ["moOrgSentidos","Org. sentidos"],
                ["moCardiovascular","Cardiovascular"], ["moRespiratorio","Respiratorio"], ["moGastrointestinal","Gastrointestinal"],
                ["moGenitourinario","Genitourinario"], ["moGinecoObstetrica","Gineco-Obstétrica"], ["moOsteomuscular","Osteomuscular"],
                ["moPielAnexos","Piel y anexos"], ["moMetabolica","Metabólica"], ["moReaccionAlergica","Reacción alérgica"],
                ["moObstruccionVia","Obstrucción vía aérea"], ["moPsiquiatrica","Psiquiátrica"],
                ["moEnvenenamiento","Envenenamiento"], ["moCalorFrio","Calor/Frío"],
              ].map(([k, l]) => <Checkbox key={k} label={l} checked={form[k]} onChange={v => set(k, v)} />)}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">5.2 Urgencia Traumática</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                ["utPolitrauma","Politrauma"], ["utEncefalocraneal","Encefalocraneal"], ["utMaxilofacial","Maxilofacial"],
                ["utOrgSentidos","Org. sentidos"], ["utRaquimedular","Raquimedular"], ["utTorax","Tórax"],
                ["utAbdominal","Abdominal"], ["utPelvicoGenital","Pélvico/Genital"], ["utTejidosBlandos","Tejidos blandos"],
                ["utOsteomuscular","Osteomuscular"], ["utShock","Shock"], ["utInhalacion","Inhalación"],
                ["utIntoxicacion","Intoxicación"],
              ].map(([k, l]) => <Checkbox key={k} label={l} checked={form[k]} onChange={v => set(k, v)} />)}
            </div>
          </div>
        </Section>

        {/* 6. Antecedentes */}
        <Section title="6. Antecedentes" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-4">
            {[
              ["antPatologias","antPatologiasCual","Patologías"],
              ["antCirugias","antCirugiasCual","Cirugías"],
              ["antMedicamentos","antMedicamentosCual","Medicamentos"],
              ["antAlergias","antAlergiasCual","Alergias"],
            ].map(([bk, tk, label]) => (
              <div key={bk} className="space-y-1">
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name={bk} checked={!form[bk]} onChange={() => set(bk, false)} /> No
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name={bk} checked={!!form[bk]} onChange={() => set(bk, true)} /> Sí
                  </label>
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </div>
                {form[bk] && (
                  <input className="input-field text-sm" placeholder="¿Cuál?" value={form[tk]} onChange={e => set(tk, e.target.value)} />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-6">
            {[["antFumador","¿Fumador?"], ["antAlcohol","¿Alcohol?"], ["antSustanciasPsicoactivas","¿Sustancias psicoactivas?"]].map(([k, l]) => (
              <div key={k} className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{l}</span>
                <label className="flex items-center gap-1 text-sm"><input type="radio" checked={!form[k]} onChange={() => set(k, false)} /> No</label>
                <label className="flex items-center gap-1 text-sm"><input type="radio" checked={!!form[k]} onChange={() => set(k, true)} /> Sí</label>
              </div>
            ))}
          </div>
          <div>
            <label className="label">Hora última ingesta</label>
            <input type="time" className="input-field max-w-xs" value={form.antHoraUltimaIngesta} onChange={e => set("antHoraUltimaIngesta", e.target.value)} />
          </div>
        </Section>

        {/* 7. Examen Físico */}
        <Section title="7. Examen Físico" defaultOpen={false}>
          {[["Primera", "exf1"], ["Segunda", "exf2"]].map(([label, prefix]) => (
            <div key={prefix}>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Toma {label}</p>
              <div className="grid grid-cols-4 gap-3">
                {[
                  [`${prefix}PresionArterial`, "P. Arterial"],
                  [`${prefix}FrecuenciaCardiaca`, "F. Cardiaca"],
                  [`${prefix}FrecuenciaResp`, "F. Resp."],
                  [`${prefix}SatO2`, "Sat O2%"],
                  [`${prefix}Temperatura`, "Temperatura"],
                  [`${prefix}Glucometria`, "Glucometría"],
                  [`${prefix}Glasgow`, "Glasgow"],
                ].map(([k, l]) => (
                  <div key={k}>
                    <label className="label text-xs">{l}</label>
                    <input className="input-field text-sm" value={form[k] || ""} onChange={e => set(k, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4 max-w-xs">
            <div>
              <label className="label">Peso (kg)</label>
              <input className="input-field" value={form.peso} onChange={e => set("peso", e.target.value)} />
            </div>
            <div>
              <label className="label">Talla (cm)</label>
              <input className="input-field" value={form.talla} onChange={e => set("talla", e.target.value)} />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Piel</p>
            <div className="grid grid-cols-3 gap-2">
              {[["pielNormal","Normal"], ["pielHumeda","Húmeda"], ["pielPalida","Pálida"],
                ["pielEnrojecida","Enrojecida"], ["pielFria","Fría"], ["pielIcterica","Ictérica"],
                ["pielCaliente","Caliente"], ["pielCianotica","Cianótica"], ["pielSeca","Seca"]
              ].map(([k, l]) => <Checkbox key={k} label={l} checked={form[k]} onChange={v => set(k, v)} />)}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Estado Hemodinámico</p>
            <div className="grid grid-cols-2 gap-2">
              {[["hemoEstable","Hemodinámicamente Estable"], ["hemoInestable","Hemodinámicamente Inestable"],
                ["hemoParoResp","Paro Respiratorio"], ["hemoParoCardio","Paro Cardiorespiratorio"]
              ].map(([k, l]) => <Checkbox key={k} label={l} checked={form[k]} onChange={v => set(k, v)} />)}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Glasgow Detallado</p>
            <div className="grid grid-cols-3 gap-4">
              {[["glasgowOcular","Ocular (1-4)","4"],["glasgowVerbal","Verbal (1-5)","5"],["glasgowMotor","Motor (1-6)","6"]].map(([k, l, max]) => (
                <div key={k}>
                  <label className="label text-xs">{l}</label>
                  <select className="input-field" value={form[k]} onChange={e => set(k, e.target.value)}>
                    <option value="">—</option>
                    {Array.from({ length: parseInt(max) }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Evolución y Diagnóstico */}
        <Section title="Evolución y Diagnóstico" defaultOpen={false}>
          <div>
            <label className="label">Evolución del Paciente</label>
            <textarea rows={4} className="input-field" value={form.evolucion} onChange={e => set("evolucion", e.target.value)} placeholder="Describe la evolución clínica del paciente..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Código CIE-10</label>
              <input className="input-field" placeholder="Ej: S00.0" value={form.diagnosticoCie10} onChange={e => set("diagnosticoCie10", e.target.value)} />
            </div>
            <div>
              <label className="label">Descripción del Diagnóstico</label>
              <input className="input-field" value={form.diagnosticoDescripcion} onChange={e => set("diagnosticoDescripcion", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Complicaciones durante el traslado</label>
            <textarea rows={2} className="input-field" value={form.complicaciones} onChange={e => set("complicaciones", e.target.value)} />
          </div>
        </Section>

        {/* Firmas */}
        <Section title="Firmas y Entrega">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="label">Firma del Paciente</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white">
                <SignatureCanvas ref={firmaRef} penColor="#1a1a1a" canvasProps={{ width: 240, height: 90, className: "w-full" }} />
              </div>
              <button type="button" onClick={() => firmaRef.current?.clear()} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mt-1">
                <RotateCcw className="w-3 h-3" /> Limpiar
              </button>
            </div>
            <div>
              <label className="label">Firma del Acompañante/Responsable</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white">
                <SignatureCanvas ref={firma2Ref} penColor="#1a1a1a" canvasProps={{ width: 240, height: 90, className: "w-full" }} />
              </div>
              <button type="button" onClick={() => firma2Ref.current?.clear()} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mt-1">
                <RotateCcw className="w-3 h-3" /> Limpiar
              </button>
            </div>
            <div>
              <label className="label">Firma Talento Humano</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white">
                <SignatureCanvas ref={firmaTHRef} penColor="#1a1a1a" canvasProps={{ width: 240, height: 90, className: "w-full" }} />
              </div>
              <button type="button" onClick={() => firmaTHRef.current?.clear()} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mt-1">
                <RotateCcw className="w-3 h-3" /> Limpiar
              </button>
              <div className="mt-2">
                <label className="label text-xs">CC del Talento Humano</label>
                <input className="input-field text-sm" value={form.ccTalentoHumano} onChange={e => set("ccTalentoHumano", e.target.value)} />
              </div>
            </div>
          </div>
        </Section>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancelar</button>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            {loading ? "Guardando..." : "Guardar Historia Clínica"}
          </button>
        </div>
      </form>
    </div>
  );
}
