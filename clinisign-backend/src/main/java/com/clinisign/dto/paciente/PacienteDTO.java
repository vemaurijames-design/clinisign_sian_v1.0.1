package com.clinisign.dto.paciente;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class PacienteDTO {
    private Long id;
    private String tipoIdentificacion;
    private String numeroIdentificacion;
    private String nombres;
    private String apellidos;
    private String nombreCompleto;
    private LocalDate fechaNacimiento;
    private Integer edad;
    private String genero;
    private String estadoCivil;
    private String direccion;
    private String municipio;
    private String telefono;
    private String celular;
    private String ocupacion;
    private Boolean asegSisben;
    private Boolean asegSoat;
    private Boolean asegEps;
    private Boolean asegParticular;
    private Boolean asegArl;
    private Boolean asegFosyga;
    private Boolean asegPrepagada;
    private Boolean asegNinguno;
    private String nombreEps;
    private Boolean activo;
    private LocalDateTime createdAt;
}
