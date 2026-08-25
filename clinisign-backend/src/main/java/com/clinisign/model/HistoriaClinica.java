package com.clinisign.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Map;

@Entity
@Table(name = "historias_clinicas")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoriaClinica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 20) @Builder.Default private String codigo = "HC-FM-05";
    @Column(length = 10) @Builder.Default private String version = "01";

    // 1. Información General
    private LocalDate fecha;
    @Column(name = "placa_movil", length = 20) private String placaMovil;
    @Column(name = "hora_despacho") private LocalTime horaDespacho;
    @Column(name = "hora_llegada_origen") private LocalTime horaLlegadaOrigen;
    @Column(name = "hora_salida_origen")  private LocalTime horaSalidaOrigen;
    @Column(length = 200) private String origen;
    @Column(name = "ubicacion_h", length = 10) private String ubicacionH;
    @Column(name = "ubicacion_u", length = 10) private String ubicacionU;
    @Column(name = "destino1", length = 200) private String destino1;
    @Column(name = "hora_llegada_d1") private LocalTime horaLlegadaD1;
    @Column(name = "hora_salida_d1")  private LocalTime horaSalidaD1;
    @Column(name = "destino2", length = 200) private String destino2;
    @Column(name = "hora_llegada_d2") private LocalTime horaLlegadaD2;
    @Column(name = "hora_salida_d2")  private LocalTime horaSalidaD2;
    @Column(name = "destino_final", length = 200) private String destinoFinal;
    @Column(name = "hora_llegada_df") private LocalTime horaLlegadaDf;
    @Column(name = "hora_salida_df")  private LocalTime horaSalidaDf;
    @Column(name = "fin_atencion") private LocalTime finAtencion;
    @Column(length = 20) private String clasificacion;
    @Column(length = 100) private String conductor;
    @Column(length = 100) private String tripulante;
    @Column(name = "reg_tripulante", length = 50) private String regTripulante;
    @Column(length = 100) private String apoyo;

    // 2. Paciente
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id")
    private Paciente paciente;

    @Column(name = "tipo_traslado", length = 20) private String tipoTraslado;

    // Responsable / Acompañante
    @Column(name = "responsable_nombre", length = 100) private String responsableNombre;
    @Column(name = "responsable_id", length = 30)     private String responsableId;
    @Column(name = "responsable_parentesco", length = 50) private String responsableParentesco;
    @Column(name = "responsable_telefonos", length = 50)  private String responsableTelefonos;
    @Column(name = "acompanante_nombre", length = 100) private String acompananteNombre;
    @Column(name = "acompanante_id", length = 30)     private String acompananteId;
    @Column(name = "acompanante_parentesco", length = 50) private String acompananteParentesco;
    @Column(name = "acompanante_telefonos", length = 50)  private String acompananteTelefonos;

    // 3. Cuidados anteriores
    @Column(name = "cuidados_anteriores", columnDefinition = "TEXT") private String cuidadosAnteriores;

    // 4. Tipo de evento - Quién reporta
    @Builder.Default @Column(name = "arribo_ciudadano")  private Boolean arriboCiudadano  = false;
    @Builder.Default @Column(name = "arribo_empleado")   private Boolean arriboEmpleado   = false;
    @Builder.Default @Column(name = "arribo_socorrista") private Boolean arriboSocorrista = false;
    @Builder.Default @Column(name = "arribo_medico")     private Boolean arriboMedico     = false;
    @Builder.Default @Column(name = "arribo_enfermera")  private Boolean arriboEnfermera  = false;
    @Builder.Default @Column(name = "arribo_nadie")      private Boolean arriboNadie      = false;
    @Builder.Default @Column(name = "arribo_policia")    private Boolean arriboPolicia    = false;
    @Builder.Default @Column(name = "arribo_seguridad")  private Boolean arriboSeguridad  = false;
    @Builder.Default @Column(name = "arribo_familiar")   private Boolean arriboFamiliar   = false;

    // 4. Tipo de evento - Causa
    @Builder.Default @Column(name = "evento_arrollamiento")  private Boolean eventoArrollamiento  = false;
    @Builder.Default @Column(name = "evento_acc_trabajo")    private Boolean eventoAccTrabajo    = false;
    @Builder.Default @Column(name = "evento_acc_quimico")    private Boolean eventoAccQuimico    = false;
    @Builder.Default @Column(name = "evento_atrapamiento")   private Boolean eventoAtrapamiento   = false;
    @Builder.Default @Column(name = "evento_agresion")       private Boolean eventoAgresion       = false;
    @Builder.Default @Column(name = "evento_autoinflingido") private Boolean eventoAutoinflingido = false;
    @Builder.Default @Column(name = "evento_caida")          private Boolean eventoCaida          = false;
    @Builder.Default @Column(name = "evento_ambiental")      private Boolean eventoAmbiental      = false;
    @Builder.Default @Column(name = "evento_cuerpo_extrano") private Boolean eventoCuerpoExtrano  = false;
    @Builder.Default @Column(name = "evento_electrocucion")  private Boolean eventoElectrocucion  = false;
    @Builder.Default @Column(name = "evento_explosion")      private Boolean eventoExplosion      = false;
    @Builder.Default @Column(name = "evento_incendio")       private Boolean eventoIncendio       = false;
    @Builder.Default @Column(name = "evento_enf_comun")      private Boolean eventoEnfComun       = false;
    @Builder.Default @Column(name = "evento_golpe_impacto")  private Boolean eventoGolpeImpacto  = false;
    @Builder.Default @Column(name = "evento_acc_transito")   private Boolean eventoAccTransito    = false;

    // 5. Motivo - Urgencia Médica
    @Builder.Default @Column(name = "mo_paro_cardio")       private Boolean moParoCardio      = false;
    @Builder.Default @Column(name = "mo_neurologica")        private Boolean moNeurologica     = false;
    @Builder.Default @Column(name = "mo_org_sentidos")       private Boolean moOrgSentidos     = false;
    @Builder.Default @Column(name = "mo_cardiovascular")     private Boolean moCardiovascular  = false;
    @Builder.Default @Column(name = "mo_respiratorio")       private Boolean moRespiratorio    = false;
    @Builder.Default @Column(name = "mo_gastrointestinal")   private Boolean moGastrointestinal= false;
    @Builder.Default @Column(name = "mo_genitourinario")     private Boolean moGenitourinario  = false;
    @Builder.Default @Column(name = "mo_gineco_obstetrica")  private Boolean moGinecoObstetrica= false;
    @Builder.Default @Column(name = "mo_osteomuscular")      private Boolean moOsteomuscular   = false;
    @Builder.Default @Column(name = "mo_piel_anexos")        private Boolean moPielAnexos      = false;
    @Builder.Default @Column(name = "mo_metabolica")         private Boolean moMetabolica      = false;
    @Builder.Default @Column(name = "mo_reaccion_alergica")  private Boolean moReaccionAlergica= false;
    @Builder.Default @Column(name = "mo_obstruccion_via")    private Boolean moObstruccionVia  = false;
    @Builder.Default @Column(name = "mo_psiquiatrica")       private Boolean moPsiquiatrica    = false;
    @Builder.Default @Column(name = "mo_envenenamiento")     private Boolean moEnvenenamiento  = false;
    @Builder.Default @Column(name = "mo_calor_frio")         private Boolean moCalorFrio       = false;

    // 5.2 Urgencia Traumática
    @Builder.Default @Column(name = "ut_politrauma")     private Boolean utPolitrauma    = false;
    @Builder.Default @Column(name = "ut_encefalocraneal")private Boolean utEncefalocraneal= false;
    @Builder.Default @Column(name = "ut_maxilofacial")   private Boolean utMaxilofacial  = false;
    @Builder.Default @Column(name = "ut_org_sentidos")   private Boolean utOrgSentidos   = false;
    @Builder.Default @Column(name = "ut_raquimedular")   private Boolean utRaquimedular  = false;
    @Builder.Default @Column(name = "ut_torax")          private Boolean utTorax         = false;
    @Builder.Default @Column(name = "ut_abdominal")      private Boolean utAbdominal     = false;
    @Builder.Default @Column(name = "ut_pelvico_genital") private Boolean utPelvicoGenital= false;
    @Builder.Default @Column(name = "ut_tejidos_blandos") private Boolean utTejidosBlandos= false;
    @Builder.Default @Column(name = "ut_osteomuscular")  private Boolean utOsteomuscular = false;
    @Builder.Default @Column(name = "ut_shock")          private Boolean utShock         = false;
    @Builder.Default @Column(name = "ut_inhalacion")     private Boolean utInhalacion    = false;
    @Builder.Default @Column(name = "ut_intoxicacion")   private Boolean utIntoxicacion  = false;

    // 6. Antecedentes
    @Builder.Default @Column(name = "ant_patologias")   private Boolean antPatologias  = false;
    @Column(name = "ant_patologias_cual", columnDefinition = "TEXT") private String antPatologiasCual;
    @Builder.Default @Column(name = "ant_cirugias")     private Boolean antCirugias    = false;
    @Column(name = "ant_cirugias_cual", columnDefinition = "TEXT")  private String antCirugiasCual;
    @Builder.Default @Column(name = "ant_medicamentos") private Boolean antMedicamentos= false;
    @Column(name = "ant_medicamentos_cual", columnDefinition = "TEXT") private String antMedicamentosCual;
    @Builder.Default @Column(name = "ant_alergias")     private Boolean antAlergias    = false;
    @Column(name = "ant_alergias_cual", columnDefinition = "TEXT")  private String antAlergiasCual;
    @Builder.Default @Column(name = "ant_fumador")      private Boolean antFumador     = false;
    @Builder.Default @Column(name = "ant_alcohol")      private Boolean antAlcohol     = false;
    @Builder.Default @Column(name = "ant_sustancias_psicoactivas") private Boolean antSustanciasPsicoactivas = false;
    @Column(name = "ant_otra_sustancia", length = 100) private String antOtraSustancia;
    @Column(name = "ant_hora_ultima_ingesta", length = 10) private String antHoraUltimaIngesta;

    // Localización lesiones
    @Builder.Default @Column(name = "les_fractura_abierta")  private Boolean lesFracturaAbierta  = false;
    @Builder.Default @Column(name = "les_fractura_cerrada")  private Boolean lesFracturaCerrada  = false;
    @Builder.Default @Column(name = "les_luxacion")          private Boolean lesLuxacion         = false;
    @Builder.Default @Column(name = "les_trauma_penetrante") private Boolean lesTraumaPenetrante = false;
    @Builder.Default @Column(name = "les_electrocucion")     private Boolean lesElectrocucion    = false;
    @Builder.Default @Column(name = "les_quemadura")         private Boolean lesQuemadura        = false;
    @Builder.Default @Column(name = "les_trauma_cerrado")    private Boolean lesTraumaCerrado    = false;
    @Builder.Default @Column(name = "les_desgarro")          private Boolean lesDesgarro         = false;
    @Builder.Default @Column(name = "les_esguince")          private Boolean lesEsguince         = false;
    @Builder.Default @Column(name = "les_aplastamiento")     private Boolean lesAplastamiento    = false;
    @Builder.Default @Column(name = "les_contusion")         private Boolean lesContusion        = false;
    @Builder.Default @Column(name = "les_incision")          private Boolean lesIncision         = false;
    @Builder.Default @Column(name = "les_picadura")          private Boolean lesPicadura         = false;
    @Builder.Default @Column(name = "les_herida_abierta")    private Boolean lesHerida           = false;
    @Builder.Default @Column(name = "les_laceracion")        private Boolean lesLaceracion       = false;
    @Builder.Default @Column(name = "les_abrasion")          private Boolean lesAbrasion         = false;
    @Builder.Default @Column(name = "les_avulsion")          private Boolean lesAvulsion         = false;
    @Builder.Default @Column(name = "les_puncion")           private Boolean lesPuncion          = false;
    @Builder.Default @Column(name = "les_amputacion")        private Boolean lesAmputacion       = false;
    @Builder.Default @Column(name = "les_mordedura")         private Boolean lesMordedura        = false;
    @Builder.Default @Column(name = "les_hemorragia")        private Boolean lesHemorragia       = false;
    @Builder.Default @Column(name = "les_cuerpo_extrano")    private Boolean lesCuerpoExtrano    = false;
    @Builder.Default @Column(name = "les_hematoma")          private Boolean lesHematoma         = false;

    // 7. Examen físico 1
    @Column(name = "exf1_hora") private LocalTime exf1Hora;
    @Column(name = "exf1_presion_arterial", length = 20)    private String exf1PresionArterial;
    @Column(name = "exf1_frecuencia_cardiaca", length = 20) private String exf1FrecuenciaCardiaca;
    @Column(name = "exf1_frecuencia_resp", length = 20)     private String exf1FrecuenciaResp;
    @Column(name = "exf1_sat_o2", length = 10)              private String exf1SatO2;
    @Column(name = "exf1_temperatura", length = 10)         private String exf1Temperatura;
    @Column(name = "exf1_glucometria", length = 10)         private String exf1Glucometria;
    @Column(name = "exf1_glasgow")                          private Short  exf1Glasgow;

    // 7. Examen físico 2
    @Column(name = "exf2_hora") private LocalTime exf2Hora;
    @Column(name = "exf2_presion_arterial", length = 20)    private String exf2PresionArterial;
    @Column(name = "exf2_frecuencia_cardiaca", length = 20) private String exf2FrecuenciaCardiaca;
    @Column(name = "exf2_frecuencia_resp", length = 20)     private String exf2FrecuenciaResp;
    @Column(name = "exf2_sat_o2", length = 10)              private String exf2SatO2;
    @Column(name = "exf2_temperatura", length = 10)         private String exf2Temperatura;
    @Column(name = "exf2_glucometria", length = 10)         private String exf2Glucometria;
    @Column(name = "exf2_glasgow")                          private Short  exf2Glasgow;

    @Column(length = 10) private String peso;
    @Column(length = 10) private String talla;

    // Piel
    @Builder.Default @Column(name = "piel_normal")    private Boolean pielNormal    = false;
    @Builder.Default @Column(name = "piel_humeda")    private Boolean pielHumeda    = false;
    @Builder.Default @Column(name = "piel_palida")    private Boolean pielPalida    = false;
    @Builder.Default @Column(name = "piel_enrojecida")private Boolean pielEnrojecida= false;
    @Builder.Default @Column(name = "piel_fria")      private Boolean pielFria      = false;
    @Builder.Default @Column(name = "piel_icterica")  private Boolean pielIcterica  = false;
    @Builder.Default @Column(name = "piel_caliente")  private Boolean pielCaliente  = false;
    @Builder.Default @Column(name = "piel_cianotica") private Boolean pielCianotica = false;
    @Builder.Default @Column(name = "piel_seca")      private Boolean pielSeca      = false;

    // Estado hemodinámico
    @Builder.Default @Column(name = "hemo_estable")   private Boolean hemoEstable   = false;
    @Builder.Default @Column(name = "hemo_inestable") private Boolean hemoInestable = false;
    @Builder.Default @Column(name = "hemo_paro_resp") private Boolean hemoParoResp  = false;
    @Builder.Default @Column(name = "hemo_paro_cardio")private Boolean hemoParoCardio= false;

    @Column(name = "glasgow_ocular")  private Short glasgowOcular;
    @Column(name = "glasgow_verbal")  private Short glasgowVerbal;
    @Column(name = "glasgow_motor")   private Short glasgowMotor;

    @Column(columnDefinition = "TEXT") private String evolucion;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> procedimientos;

    @Column(name = "diagnostico_cie10", length = 20) private String diagnosticoCie10;
    @Column(name = "diagnostico_descripcion", columnDefinition = "TEXT") private String diagnosticoDescripcion;

    // 10. Instrucciones
    @Builder.Default @Column(name = "instruccion_via_radio")    private Boolean instruccionViaRadio    = false;
    @Builder.Default @Column(name = "instruccion_via_celular")  private Boolean instruccionViaCelular  = false;
    @Builder.Default @Column(name = "instruccion_via_telefono") private Boolean instruccionViaTelefono = false;
    @Builder.Default @Column(name = "instruccion_medico_presente") private Boolean instruccionMedicoPresente = false;
    @Builder.Default @Column(name = "instruccion_md_no_disp")   private Boolean instruccionMdNoDisp   = false;
    @Builder.Default @Column(name = "instruccion_taph")         private Boolean instruccionTaph       = false;
    @Builder.Default @Column(name = "instruccion_tpaph")        private Boolean instruccionTpaph      = false;
    @Builder.Default @Column(name = "instruccion_otro_personal")private Boolean instruccionOtroPersonal=false;
    @Builder.Default @Column(name = "instruccion_protocolo")    private Boolean instruccionProtocolo  = false;

    // 11. Resultado
    @Builder.Default @Column(name = "resultado_niega_atencion")   private Boolean resultadoNiegaAtencion  = false;
    @Builder.Default @Column(name = "resultado_hospital")          private Boolean resultadoHospital       = false;
    @Builder.Default @Column(name = "resultado_alta_sitio")        private Boolean resultadoAltaSitio      = false;
    @Builder.Default @Column(name = "resultado_niega_transporte")  private Boolean resultadoNiegaTransporte= false;
    @Builder.Default @Column(name = "resultado_reconocimiento")    private Boolean resultadoReconocimiento = false;
    @Builder.Default @Column(name = "resultado_reanimacion")       private Boolean resultadoReanimacion    = false;
    @Builder.Default @Column(name = "resultado_muerte")            private Boolean resultadoMuerte         = false;
    @Builder.Default @Column(name = "resultado_cadaver")           private Boolean resultadoCadaver        = false;
    @Builder.Default @Column(name = "resultado_programado")        private Boolean resultadoProgramado     = false;

    @Column(name = "nombre_asigna_traslado", length = 100) private String nombreAsignaTraslado;
    @Column(name = "institucion_que_recibe", length = 100) private String institucionQueRecibe;

    @Column(name = "complicaciones", columnDefinition = "TEXT") private String complicaciones;

    // 13. Entrega
    @Column(name = "entrega_presion_arterial", length = 20) private String entregaPresionArterial;
    @Column(name = "entrega_frec_cardiaca", length = 20)    private String entregaFrecCardiaca;
    @Column(name = "entrega_frec_resp", length = 20)        private String entregaFrecResp;
    @Column(name = "entrega_sat_o2", length = 10)           private String entregaSatO2;
    @Column(name = "entrega_temperatura", length = 10)      private String entregaTemperatura;
    @Column(name = "entrega_glucometria", length = 10)      private String entregaGlucometria;
    @Column(name = "entrega_glasgow")                       private Short  entregaGlasgow;

    // Firmas
    @Column(name = "firma_paciente",        columnDefinition = "TEXT") private String firmaPaciente;
    @Column(name = "firma_acompanante",     columnDefinition = "TEXT") private String firmaAcompanante;
    @Column(name = "firma_talento_humano",  columnDefinition = "TEXT") private String firmaTalentoHumano;
    @Column(name = "cc_talento_humano", length = 30)                   private String ccTalentoHumano;
    @Column(name = "firma_entidad_entrega", columnDefinition = "TEXT") private String firmaEntidadEntrega;
    @Column(name = "cc_entidad_entrega", length = 30)                  private String ccEntidadEntrega;
    @Column(name = "firma_entidad_receptora", columnDefinition = "TEXT") private String firmaEntidadReceptora;
    @Column(name = "cc_entidad_receptora", length = 30)                private String ccEntidadReceptora;
    @Column(name = "fecha_firma") private LocalDate fechaFirma;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private Usuario createdBy;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
