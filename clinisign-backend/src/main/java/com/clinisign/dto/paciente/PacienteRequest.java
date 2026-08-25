package com.clinisign.dto.paciente;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PacienteRequest {

    @NotBlank private String tipoIdentificacion;
    @NotBlank private String numeroIdentificacion;
    @NotBlank private String nombres;
    @NotBlank private String apellidos;

    private LocalDate fechaNacimiento;
    private Integer edad;
    private String genero;
    private String estadoCivil;
    private String direccion;
    private String municipio;
    private String telefono;
    private String celular;
    private String ocupacion;

    private boolean asegSisben;
    private boolean asegSoat;
    private boolean asegEps;
    private boolean asegParticular;
    private boolean asegArl;
    private boolean asegFosyga;
    private boolean asegPrepagada;
    private boolean asegNinguno;

    private String nombreEps;
}
