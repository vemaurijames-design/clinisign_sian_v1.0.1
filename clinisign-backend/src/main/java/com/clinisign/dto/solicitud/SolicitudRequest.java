package com.clinisign.dto.solicitud;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SolicitudRequest {
    @NotBlank private String tipo;
    @NotBlank private String prioridad;
    private Long pacienteId;
    private String descripcion;
    private String origen;
    private String destino;
    private String municipioOrigen;
    private String municipioDestino;
    private String observaciones;
}
