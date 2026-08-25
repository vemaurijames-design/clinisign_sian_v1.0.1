package com.clinisign.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pacientes")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Paciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tipo_identificacion", nullable = false, length = 5)
    @Builder.Default
    private String tipoIdentificacion = "CC";

    @Column(name = "numero_identificacion", nullable = false, length = 30)
    private String numeroIdentificacion;

    @Column(nullable = false, length = 100)
    private String nombres;

    @Column(nullable = false, length = 100)
    private String apellidos;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    private Integer edad;

    @Column(length = 1)
    private String genero;   // F | M

    @Column(name = "estado_civil", length = 20)
    private String estadoCivil;

    @Column(length = 200)
    private String direccion;

    @Column(length = 100)
    private String municipio;

    @Column(length = 20)
    private String telefono;

    @Column(length = 20)
    private String celular;

    @Column(length = 100)
    private String ocupacion;

    // Tipo de aseguramiento
    @Column(name = "aseg_sisben") @Builder.Default private Boolean asegSisben = false;
    @Column(name = "aseg_soat")   @Builder.Default private Boolean asegSoat   = false;
    @Column(name = "aseg_eps")    @Builder.Default private Boolean asegEps    = false;
    @Column(name = "aseg_particular") @Builder.Default private Boolean asegParticular = false;
    @Column(name = "aseg_arl")    @Builder.Default private Boolean asegArl    = false;
    @Column(name = "aseg_fosyga") @Builder.Default private Boolean asegFosyga = false;
    @Column(name = "aseg_prepagada") @Builder.Default private Boolean asegPrepagada = false;
    @Column(name = "aseg_ninguno") @Builder.Default private Boolean asegNinguno = false;

    @Column(name = "nombre_eps", length = 100)
    private String nombreEps;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;

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
