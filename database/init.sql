-- ============================================================
-- CliniSign - SIAN SALUD Ambulancias
-- Script de inicialización de base de datos PostgreSQL
-- ============================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- TABLA: usuarios
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id                  BIGSERIAL PRIMARY KEY,
    nombres             VARCHAR(100) NOT NULL,
    apellidos           VARCHAR(100) NOT NULL,
    email               VARCHAR(150) NOT NULL UNIQUE,
    password            VARCHAR(255) NOT NULL,
    rol                 VARCHAR(30)  NOT NULL DEFAULT 'AUXILIAR_APH',
    -- Roles: ADMIN | COORDINADOR | AUXILIAR_APH | CONDUCTOR | MEDICO
    documento_tipo      VARCHAR(10)  DEFAULT 'CC',
    documento_numero    VARCHAR(30),
    telefono            VARCHAR(20),
    registro_profesional VARCHAR(50),
    activo              BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_rol CHECK (rol IN ('ADMIN','COORDINADOR','AUXILIAR_APH','CONDUCTOR','MEDICO'))
);

-- ============================================================
-- TABLA: pacientes
-- ============================================================
CREATE TABLE IF NOT EXISTS pacientes (
    id                  BIGSERIAL PRIMARY KEY,
    tipo_identificacion VARCHAR(5)   NOT NULL DEFAULT 'CC',
    -- RC | TI | CC | CE | PE
    numero_identificacion VARCHAR(30) NOT NULL,
    nombres             VARCHAR(100) NOT NULL,
    apellidos           VARCHAR(100) NOT NULL,
    fecha_nacimiento    DATE,
    edad                INTEGER,
    genero              CHAR(1),        -- F | M
    estado_civil        VARCHAR(20),
    direccion           VARCHAR(200),
    municipio           VARCHAR(100),
    telefono            VARCHAR(20),
    celular             VARCHAR(20),
    ocupacion           VARCHAR(100),
    -- Tipo de aseguramiento
    aseg_sisben         BOOLEAN DEFAULT FALSE,
    aseg_soat           BOOLEAN DEFAULT FALSE,
    aseg_eps            BOOLEAN DEFAULT FALSE,
    aseg_particular     BOOLEAN DEFAULT FALSE,
    aseg_arl            BOOLEAN DEFAULT FALSE,
    aseg_fosyga         BOOLEAN DEFAULT FALSE,
    aseg_prepagada      BOOLEAN DEFAULT FALSE,
    aseg_ninguno        BOOLEAN DEFAULT FALSE,
    nombre_eps          VARCHAR(100),
    activo              BOOLEAN      NOT NULL DEFAULT TRUE,
    created_by          BIGINT REFERENCES usuarios(id),
    created_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_tipo_id CHECK (tipo_identificacion IN ('RC','TI','CC','CE','PE')),
    CONSTRAINT chk_genero   CHECK (genero IN ('F','M') OR genero IS NULL)
);

CREATE INDEX idx_pacientes_numero_id ON pacientes(numero_identificacion);
CREATE INDEX idx_pacientes_nombres   ON pacientes USING gin(nombres gin_trgm_ops);

-- ============================================================
-- TABLA: historias_clinicas  (HC-FM-05)
-- ============================================================
CREATE TABLE IF NOT EXISTS historias_clinicas (
    id                  BIGSERIAL PRIMARY KEY,
    codigo              VARCHAR(20) NOT NULL DEFAULT 'HC-FM-05',
    version             VARCHAR(10) NOT NULL DEFAULT '01',

    -- 1. Información General
    fecha               DATE,
    placa_movil         VARCHAR(20),
    hora_despacho       TIME,
    hora_llegada_origen TIME,
    hora_salida_origen  TIME,
    origen              VARCHAR(200),
    ubicacion_h         VARCHAR(10),
    ubicacion_u         VARCHAR(10),
    destino1            VARCHAR(200),
    hora_llegada_d1     TIME,
    hora_salida_d1      TIME,
    destino2            VARCHAR(200),
    hora_llegada_d2     TIME,
    hora_salida_d2      TIME,
    destino_final       VARCHAR(200),
    hora_llegada_df     TIME,
    hora_salida_df      TIME,
    fin_atencion        TIME,

    -- Clasificación atención
    clasificacion       VARCHAR(20),
    -- TRASLADO | EMERGENCIA | URGENCIA | CONSULTA

    -- Personal
    conductor           VARCHAR(100),
    tripulante          VARCHAR(100),
    reg_tripulante      VARCHAR(50),
    apoyo               VARCHAR(100),

    -- 2. Identificación del Paciente
    paciente_id         BIGINT REFERENCES pacientes(id),

    -- Tipo traslado/servicio
    tipo_traslado       VARCHAR(20),
    -- TAB_SENCILLO | TAB_DOBLE | TAM_SENCILLO | TAM_DOBLE | APH

    -- Responsable
    responsable_nombre  VARCHAR(100),
    responsable_id      VARCHAR(30),
    responsable_parentesco VARCHAR(50),
    responsable_telefonos VARCHAR(50),

    -- Acompañante
    acompanante_nombre  VARCHAR(100),
    acompanante_id      VARCHAR(30),
    acompanante_parentesco VARCHAR(50),
    acompanante_telefonos  VARCHAR(50),

    -- 3. Cuidados anteriores al arribo
    cuidados_anteriores TEXT,

    -- 4. Tipo de evento - Quién reporta
    arribo_ciudadano    BOOLEAN DEFAULT FALSE,
    arribo_empleado     BOOLEAN DEFAULT FALSE,
    arribo_socorrista   BOOLEAN DEFAULT FALSE,
    arribo_medico       BOOLEAN DEFAULT FALSE,
    arribo_enfermera    BOOLEAN DEFAULT FALSE,
    arribo_nadie        BOOLEAN DEFAULT FALSE,
    arribo_policia      BOOLEAN DEFAULT FALSE,
    arribo_seguridad    BOOLEAN DEFAULT FALSE,
    arribo_familiar     BOOLEAN DEFAULT FALSE,

    -- Tipo de evento - Causa
    evento_arrollamiento     BOOLEAN DEFAULT FALSE,
    evento_acc_trabajo       BOOLEAN DEFAULT FALSE,
    evento_acc_quimico       BOOLEAN DEFAULT FALSE,
    evento_atrapamiento      BOOLEAN DEFAULT FALSE,
    evento_agresion          BOOLEAN DEFAULT FALSE,
    evento_autoinflingido    BOOLEAN DEFAULT FALSE,
    evento_caida             BOOLEAN DEFAULT FALSE,
    evento_ambiental         BOOLEAN DEFAULT FALSE,
    evento_cuerpo_extrano    BOOLEAN DEFAULT FALSE,
    evento_electrocucion     BOOLEAN DEFAULT FALSE,
    evento_explosion         BOOLEAN DEFAULT FALSE,
    evento_incendio          BOOLEAN DEFAULT FALSE,
    evento_enf_comun         BOOLEAN DEFAULT FALSE,
    evento_golpe_impacto     BOOLEAN DEFAULT FALSE,
    evento_acc_transito      BOOLEAN DEFAULT FALSE,

    -- 5. Motivo de consulta - Urgencia Médica
    mo_paro_cardio           BOOLEAN DEFAULT FALSE,
    mo_neurologica           BOOLEAN DEFAULT FALSE,
    mo_org_sentidos          BOOLEAN DEFAULT FALSE,
    mo_cardiovascular        BOOLEAN DEFAULT FALSE,
    mo_respiratorio          BOOLEAN DEFAULT FALSE,
    mo_gastrointestinal      BOOLEAN DEFAULT FALSE,
    mo_genitourinario        BOOLEAN DEFAULT FALSE,
    mo_gineco_obstetrica     BOOLEAN DEFAULT FALSE,
    mo_osteomuscular         BOOLEAN DEFAULT FALSE,
    mo_piel_anexos           BOOLEAN DEFAULT FALSE,
    mo_metabolica            BOOLEAN DEFAULT FALSE,
    mo_reaccion_alergica     BOOLEAN DEFAULT FALSE,
    mo_obstruccion_via       BOOLEAN DEFAULT FALSE,
    mo_psiquiatrica          BOOLEAN DEFAULT FALSE,
    mo_envenenamiento        BOOLEAN DEFAULT FALSE,
    mo_calor_frio            BOOLEAN DEFAULT FALSE,

    -- 5.2 Urgencia Traumática
    ut_politrauma            BOOLEAN DEFAULT FALSE,
    ut_encefalocraneal       BOOLEAN DEFAULT FALSE,
    ut_maxilofacial          BOOLEAN DEFAULT FALSE,
    ut_org_sentidos          BOOLEAN DEFAULT FALSE,
    ut_raquimedular          BOOLEAN DEFAULT FALSE,
    ut_torax                 BOOLEAN DEFAULT FALSE,
    ut_abdominal             BOOLEAN DEFAULT FALSE,
    ut_pelvico_genital       BOOLEAN DEFAULT FALSE,
    ut_tejidos_blandos       BOOLEAN DEFAULT FALSE,
    ut_osteomuscular         BOOLEAN DEFAULT FALSE,
    ut_shock                 BOOLEAN DEFAULT FALSE,
    ut_inhalacion            BOOLEAN DEFAULT FALSE,
    ut_intoxicacion          BOOLEAN DEFAULT FALSE,

    -- 6. Antecedentes
    ant_patologias           BOOLEAN DEFAULT FALSE,
    ant_patologias_cual      TEXT,
    ant_cirugias             BOOLEAN DEFAULT FALSE,
    ant_cirugias_cual        TEXT,
    ant_medicamentos         BOOLEAN DEFAULT FALSE,
    ant_medicamentos_cual    TEXT,
    ant_alergias             BOOLEAN DEFAULT FALSE,
    ant_alergias_cual        TEXT,
    ant_fumador              BOOLEAN DEFAULT FALSE,
    ant_alcohol              BOOLEAN DEFAULT FALSE,
    ant_sustancias_psicoactivas BOOLEAN DEFAULT FALSE,
    ant_otra_sustancia       VARCHAR(100),
    ant_hora_ultima_ingesta  VARCHAR(10),

    -- Localización de lesiones (1-24)
    les_fractura_abierta     BOOLEAN DEFAULT FALSE,
    les_fractura_cerrada     BOOLEAN DEFAULT FALSE,
    les_luxacion             BOOLEAN DEFAULT FALSE,
    les_trauma_penetrante    BOOLEAN DEFAULT FALSE,
    les_electrocucion        BOOLEAN DEFAULT FALSE,
    les_quemadura            BOOLEAN DEFAULT FALSE,
    les_trauma_cerrado       BOOLEAN DEFAULT FALSE,
    les_desgarro             BOOLEAN DEFAULT FALSE,
    les_esguince             BOOLEAN DEFAULT FALSE,
    les_aplastamiento        BOOLEAN DEFAULT FALSE,
    les_contusion            BOOLEAN DEFAULT FALSE,
    les_incision             BOOLEAN DEFAULT FALSE,
    les_picadura             BOOLEAN DEFAULT FALSE,
    les_herida_abierta       BOOLEAN DEFAULT FALSE,
    les_laceracion           BOOLEAN DEFAULT FALSE,
    les_abrasion             BOOLEAN DEFAULT FALSE,
    les_avulsion             BOOLEAN DEFAULT FALSE,
    les_puncion              BOOLEAN DEFAULT FALSE,
    les_amputacion           BOOLEAN DEFAULT FALSE,
    les_mordedura            BOOLEAN DEFAULT FALSE,
    les_hemorragia           BOOLEAN DEFAULT FALSE,
    les_cuerpo_extrano       BOOLEAN DEFAULT FALSE,
    les_hematoma             BOOLEAN DEFAULT FALSE,

    -- 7. Examen físico - Primera toma
    exf1_hora                TIME,
    exf1_presion_arterial    VARCHAR(20),
    exf1_frecuencia_cardiaca VARCHAR(20),
    exf1_frecuencia_resp     VARCHAR(20),
    exf1_sat_o2              VARCHAR(10),
    exf1_temperatura         VARCHAR(10),
    exf1_glucometria         VARCHAR(10),
    exf1_glasgow             SMALLINT,

    -- 7. Examen físico - Segunda toma
    exf2_hora                TIME,
    exf2_presion_arterial    VARCHAR(20),
    exf2_frecuencia_cardiaca VARCHAR(20),
    exf2_frecuencia_resp     VARCHAR(20),
    exf2_sat_o2              VARCHAR(10),
    exf2_temperatura         VARCHAR(10),
    exf2_glucometria         VARCHAR(10),
    exf2_glasgow             SMALLINT,

    -- Peso y talla
    peso                     VARCHAR(10),
    talla                    VARCHAR(10),

    -- Piel
    piel_normal              BOOLEAN DEFAULT FALSE,
    piel_humeda              BOOLEAN DEFAULT FALSE,
    piel_palida              BOOLEAN DEFAULT FALSE,
    piel_enrojecida          BOOLEAN DEFAULT FALSE,
    piel_fria                BOOLEAN DEFAULT FALSE,
    piel_icterica            BOOLEAN DEFAULT FALSE,
    piel_caliente            BOOLEAN DEFAULT FALSE,
    piel_cianotica           BOOLEAN DEFAULT FALSE,
    piel_seca                BOOLEAN DEFAULT FALSE,

    -- Estado hemodinámico
    hemo_estable             BOOLEAN DEFAULT FALSE,
    hemo_inestable           BOOLEAN DEFAULT FALSE,
    hemo_paro_resp           BOOLEAN DEFAULT FALSE,
    hemo_paro_cardio         BOOLEAN DEFAULT FALSE,

    -- Glasgow desglose
    glasgow_ocular           SMALLINT,  -- 1-4
    glasgow_verbal           SMALLINT,  -- 1-5
    glasgow_motor            SMALLINT,  -- 1-6

    -- Evolución
    evolucion                TEXT,

    -- Procedimientos (8. Tratamiento - secciones X, A, B, C, D, E, OTROS)
    procedimientos           JSONB,

    -- Diagnóstico
    diagnostico_cie10        VARCHAR(20),
    diagnostico_descripcion  TEXT,

    -- 10. Instrucciones de traslado
    instruccion_via_radio    BOOLEAN DEFAULT FALSE,
    instruccion_via_celular  BOOLEAN DEFAULT FALSE,
    instruccion_via_telefono BOOLEAN DEFAULT FALSE,
    instruccion_medico_presente BOOLEAN DEFAULT FALSE,
    instruccion_md_no_disp   BOOLEAN DEFAULT FALSE,
    instruccion_taph         BOOLEAN DEFAULT FALSE,
    instruccion_tpaph        BOOLEAN DEFAULT FALSE,
    instruccion_otro_personal BOOLEAN DEFAULT FALSE,
    instruccion_protocolo    BOOLEAN DEFAULT FALSE,

    -- 11. Resultado
    resultado_niega_atencion BOOLEAN DEFAULT FALSE,
    resultado_hospital       BOOLEAN DEFAULT FALSE,
    resultado_alta_sitio     BOOLEAN DEFAULT FALSE,
    resultado_niega_transporte BOOLEAN DEFAULT FALSE,
    resultado_reconocimiento BOOLEAN DEFAULT FALSE,
    resultado_reanimacion    BOOLEAN DEFAULT FALSE,
    resultado_muerte         BOOLEAN DEFAULT FALSE,
    resultado_cadaver        BOOLEAN DEFAULT FALSE,
    resultado_programado     BOOLEAN DEFAULT FALSE,

    nombre_asigna_traslado  VARCHAR(100),
    institucion_que_recibe  VARCHAR(100),

    -- 12. Complicaciones
    complicaciones           TEXT,

    -- 13. Entrega - Signos vitales finales
    entrega_presion_arterial VARCHAR(20),
    entrega_frec_cardiaca    VARCHAR(20),
    entrega_frec_resp        VARCHAR(20),
    entrega_sat_o2           VARCHAR(10),
    entrega_temperatura      VARCHAR(10),
    entrega_glucometria      VARCHAR(10),
    entrega_glasgow          SMALLINT,

    -- Firmas (base64)
    firma_paciente           TEXT,
    firma_acompanante        TEXT,
    firma_talento_humano     TEXT,
    cc_talento_humano        VARCHAR(30),
    firma_entidad_entrega    TEXT,
    cc_entidad_entrega       VARCHAR(30),
    firma_entidad_receptora  TEXT,
    cc_entidad_receptora     VARCHAR(30),
    fecha_firma              DATE,

    -- Metadata
    created_by               BIGINT REFERENCES usuarios(id),
    created_at               TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hc_paciente ON historias_clinicas(paciente_id);
CREATE INDEX idx_hc_fecha    ON historias_clinicas(fecha);

-- ============================================================
-- TABLA: consentimientos_informados  (HC-FM-04)
-- ============================================================
CREATE TABLE IF NOT EXISTS consentimientos_informados (
    id                      BIGSERIAL PRIMARY KEY,
    codigo                  VARCHAR(20) NOT NULL DEFAULT 'HC-FM-04',
    version                 VARCHAR(10) NOT NULL DEFAULT '01',
    fecha                   DATE,
    hora                    TIME,

    -- Datos del paciente
    paciente_id             BIGINT REFERENCES pacientes(id),
    nombre_paciente         VARCHAR(200),
    numero_identidad        VARCHAR(30),
    calidad                 VARCHAR(20) DEFAULT 'PACIENTE',
    -- PACIENTE | ACOMPANANTE | FAMILIAR | RESPONSABLE
    responsable_de          VARCHAR(100),

    -- Procedimientos autorizados
    proc_inmovilizacion     BOOLEAN DEFAULT FALSE,
    proc_oxigeno            BOOLEAN DEFAULT FALSE,
    proc_medicamentos       BOOLEAN DEFAULT FALSE,
    proc_traslado           BOOLEAN DEFAULT FALSE,
    proc_otro               VARCHAR(200),

    -- Firmas y huella
    firma_paciente          TEXT,       -- base64 canvas
    huella_digital          TEXT,       -- base64 imagen
    telefono_paciente       VARCHAR(20),

    -- Personal
    nombre_acompanante      VARCHAR(200),
    nombre_auxiliar_aph     VARCHAR(200),
    documento_auxiliar      VARCHAR(30),
    registro_auxiliar       VARCHAR(50),

    created_by              BIGINT REFERENCES usuarios(id),
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ci_paciente ON consentimientos_informados(paciente_id);

-- ============================================================
-- TABLA: desistimientos_informados  (HC-FM-06)
-- ============================================================
CREATE TABLE IF NOT EXISTS desistimientos_informados (
    id                      BIGSERIAL PRIMARY KEY,
    codigo                  VARCHAR(20) NOT NULL DEFAULT 'HC-FM-06',
    version                 VARCHAR(10) NOT NULL DEFAULT '01',
    fecha                   DATE,
    hora                    TIME,

    -- Datos del paciente
    paciente_id             BIGINT REFERENCES pacientes(id),
    nombre_personal_salud   VARCHAR(200),

    -- Procedimientos rechazados
    proc_inmovilizacion     BOOLEAN DEFAULT FALSE,
    proc_oxigeno            BOOLEAN DEFAULT FALSE,
    proc_medicamentos       BOOLEAN DEFAULT FALSE,
    proc_traslado           BOOLEAN DEFAULT FALSE,
    proc_otro               TEXT,

    -- Firmas y huella
    firma_paciente          TEXT,
    huella_digital          TEXT,
    telefono_paciente       VARCHAR(20),

    -- Personal
    nombre_acompanante      VARCHAR(200),
    nombre_auxiliar_aph     VARCHAR(200),
    documento_auxiliar      VARCHAR(30),
    registro_auxiliar       VARCHAR(50),

    created_by              BIGINT REFERENCES usuarios(id),
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_di_paciente ON desistimientos_informados(paciente_id);

-- ============================================================
-- TABLA: solicitudes
-- ============================================================
CREATE TABLE IF NOT EXISTS solicitudes (
    id                  BIGSERIAL PRIMARY KEY,
    numero_solicitud    VARCHAR(20) UNIQUE,
    tipo                VARCHAR(20) NOT NULL DEFAULT 'TRASLADO',
    -- TRASLADO | EMERGENCIA | URGENCIA | CONSULTA
    estado              VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    -- PENDIENTE | EN_PROCESO | COMPLETADA | CANCELADA
    prioridad           VARCHAR(10) NOT NULL DEFAULT 'MEDIA',
    -- ALTA | MEDIA | BAJA

    paciente_id         BIGINT REFERENCES pacientes(id),
    usuario_asignado_id BIGINT REFERENCES usuarios(id),

    descripcion         TEXT,
    origen              VARCHAR(200),
    destino             VARCHAR(200),
    municipio_origen    VARCHAR(100),
    municipio_destino   VARCHAR(100),

    fecha_solicitud     TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_asignacion    TIMESTAMP,
    fecha_inicio        TIMESTAMP,
    fecha_fin           TIMESTAMP,

    observaciones       TEXT,
    motivo_cancelacion  TEXT,

    created_by          BIGINT REFERENCES usuarios(id),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_tipo_sol    CHECK (tipo IN ('TRASLADO','EMERGENCIA','URGENCIA','CONSULTA')),
    CONSTRAINT chk_estado_sol  CHECK (estado IN ('PENDIENTE','EN_PROCESO','COMPLETADA','CANCELADA')),
    CONSTRAINT chk_prioridad   CHECK (prioridad IN ('ALTA','MEDIA','BAJA'))
);

CREATE INDEX idx_sol_estado    ON solicitudes(estado);
CREATE INDEX idx_sol_paciente  ON solicitudes(paciente_id);
CREATE INDEX idx_sol_asignado  ON solicitudes(usuario_asignado_id);

-- ============================================================
-- TABLA: refresh_tokens
-- ============================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          BIGSERIAL PRIMARY KEY,
    token       VARCHAR(500) NOT NULL UNIQUE,
    usuario_id  BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    expiry_date TIMESTAMP NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FUNCIÓN: actualizar updated_at automáticamente
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_usuarios_updated
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trig_pacientes_updated
    BEFORE UPDATE ON pacientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trig_hc_updated
    BEFORE UPDATE ON historias_clinicas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trig_ci_updated
    BEFORE UPDATE ON consentimientos_informados
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trig_di_updated
    BEFORE UPDATE ON desistimientos_informados
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trig_sol_updated
    BEFORE UPDATE ON solicitudes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- FUNCIÓN: generar número de solicitud automático
-- ============================================================
CREATE OR REPLACE FUNCTION gen_numero_solicitud()
RETURNS TRIGGER AS $$
BEGIN
    NEW.numero_solicitud = 'SOL-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEW.id::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_sol_numero
    BEFORE INSERT ON solicitudes
    FOR EACH ROW EXECUTE FUNCTION gen_numero_solicitud();

-- ============================================================
-- DATOS INICIALES
-- ============================================================

-- Usuario ADMIN por defecto
-- Password: Admin2024* (BCrypt)
INSERT INTO usuarios (nombres, apellidos, email, password, rol, documento_tipo, documento_numero, activo)
VALUES (
    'Administrador',
    'CliniSign',
    'admin@siansalud.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewWX6yHvxm4rjkEC',
    'ADMIN',
    'CC',
    '1128422718',
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- Usuario Coordinador por defecto
-- Password: Coord2024*
INSERT INTO usuarios (nombres, apellidos, email, password, rol, documento_tipo, documento_numero, activo)
VALUES (
    'Yeraldin',
    'Garay Chica',
    'coordinador@siansalud.com',
    '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWFvhLi',
    'COORDINADOR',
    'CC',
    '1020441463',
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- Usuario Auxiliar APH por defecto
-- Password: Aux2024*
INSERT INTO usuarios (nombres, apellidos, email, password, rol, activo)
VALUES (
    'Auxiliar',
    'Enfermería APH',
    'auxiliar@siansalud.com',
    '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWFvhLi',
    'AUXILIAR_APH',
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- Paciente de prueba
INSERT INTO pacientes (
    tipo_identificacion, numero_identificacion, nombres, apellidos,
    fecha_nacimiento, edad, genero, celular, municipio,
    aseg_eps, nombre_eps, activo
) VALUES (
    'CC', '1234567890', 'Juan Carlos', 'Pérez García',
    '1985-03-15', 40, 'M', '3001234567', 'Medellín',
    TRUE, 'Sura EPS', TRUE
) ON CONFLICT DO NOTHING;

-- ============================================================
-- VISTAS ÚTILES
-- ============================================================

CREATE OR REPLACE VIEW v_dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM pacientes WHERE activo = TRUE)                    AS total_pacientes,
    (SELECT COUNT(*) FROM historias_clinicas)                               AS total_historias,
    (SELECT COUNT(*) FROM solicitudes WHERE estado = 'PENDIENTE')           AS solicitudes_pendientes,
    (SELECT COUNT(*) FROM solicitudes WHERE estado = 'EN_PROCESO')          AS solicitudes_en_proceso,
    (SELECT COUNT(*) FROM solicitudes WHERE DATE(created_at) = CURRENT_DATE) AS solicitudes_hoy,
    (SELECT COUNT(*) FROM usuarios WHERE activo = TRUE)                     AS total_usuarios;

CREATE OR REPLACE VIEW v_historias_con_paciente AS
SELECT
    hc.id,
    hc.fecha,
    hc.clasificacion,
    hc.placa_movil,
    hc.diagnostico_cie10,
    hc.diagnostico_descripcion,
    hc.created_at,
    p.nombres || ' ' || p.apellidos AS nombre_paciente,
    p.numero_identificacion,
    p.tipo_identificacion,
    u.nombres || ' ' || u.apellidos AS creado_por
FROM historias_clinicas hc
LEFT JOIN pacientes p ON hc.paciente_id = p.id
LEFT JOIN usuarios u ON hc.created_by = u.id;
