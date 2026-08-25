package com.clinisign.dto.solicitud;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SolicitudDTO {
    private Long id;
    private String numeroSolicitud;
    private String tipo;
    private String estado;
    private String prioridad;
    private Long pacienteId;
    private String nombrePaciente;
    private Long usuarioAsignadoId;
    private String nombreAsignado;
    private String descripcion;
    private String origen;
    private String destino;
    private String municipioOrigen;
    private String municipioDestino;
    private LocalDateTime fechaSolicitud;
    private LocalDateTime fechaAsignacion;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private String observaciones;
    private LocalDateTime createdAt;
}
