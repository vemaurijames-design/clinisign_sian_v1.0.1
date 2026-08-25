package com.clinisign.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "desistimientos_informados")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DesistimientoInformado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 20)
    @Builder.Default
    private String codigo = "HC-FM-06";

    @Column(length = 10)
    @Builder.Default
    private String version = "01";

    private LocalDate fecha;
    private LocalTime hora;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id")
    private Paciente paciente;

    @Column(name = "nombre_personal_salud", length = 200)
    private String nombrePersonalSalud;

    // Procedimientos rechazados
    @Column(name = "proc_inmovilizacion") @Builder.Default private Boolean procInmovilizacion = false;
    @Column(name = "proc_oxigeno")        @Builder.Default private Boolean procOxigeno        = false;
    @Column(name = "proc_medicamentos")   @Builder.Default private Boolean procMedicamentos   = false;
    @Column(name = "proc_traslado")       @Builder.Default private Boolean procTraslado       = false;
    @Column(name = "proc_otro", columnDefinition = "TEXT") private String procOtro;

    // Firmas
    @Column(name = "firma_paciente", columnDefinition = "TEXT")
    private String firmaPaciente;

    @Column(name = "huella_digital", columnDefinition = "TEXT")
    private String huellaDigital;

    @Column(name = "telefono_paciente", length = 20)
    private String telefonoPaciente;

    @Column(name = "nombre_acompanante", length = 200)
    private String nombreAcompanante;

    @Column(name = "nombre_auxiliar_aph", length = 200)
    private String nombreAuxiliarAph;

    @Column(name = "documento_auxiliar", length = 30)
    private String documentoAuxiliar;

    @Column(name = "registro_auxiliar", length = 50)
    private String registroAuxiliar;

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
