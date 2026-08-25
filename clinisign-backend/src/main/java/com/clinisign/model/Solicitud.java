package com.clinisign.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "solicitudes")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Solicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_solicitud", unique = true, length = 20)
    private String numeroSolicitud;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Tipo tipo = Tipo.TRASLADO;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Estado estado = Estado.PENDIENTE;

    @Column(nullable = false, length = 10)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Prioridad prioridad = Prioridad.MEDIA;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id")
    private Paciente paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_asignado_id")
    private Usuario usuarioAsignado;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(length = 200)
    private String origen;

    @Column(length = 200)
    private String destino;

    @Column(name = "municipio_origen", length = 100)
    private String municipioOrigen;

    @Column(name = "municipio_destino", length = 100)
    private String municipioDestino;

    @Column(name = "fecha_solicitud", nullable = false)
    @Builder.Default
    private LocalDateTime fechaSolicitud = LocalDateTime.now();

    @Column(name = "fecha_asignacion")
    private LocalDateTime fechaAsignacion;

    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "motivo_cancelacion", columnDefinition = "TEXT")
    private String motivoCancelacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private Usuario createdBy;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Tipo { TRASLADO, EMERGENCIA, URGENCIA, CONSULTA }
    public enum Estado { PENDIENTE, EN_PROCESO, COMPLETADA, CANCELADA }
    public enum Prioridad { ALTA, MEDIA, BAJA }
}
