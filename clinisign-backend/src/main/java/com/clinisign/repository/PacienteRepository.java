package com.clinisign.repository;

import com.clinisign.model.Paciente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PacienteRepository extends JpaRepository<Paciente, Long> {

    Optional<Paciente> findByNumeroIdentificacionAndActivoTrue(String numeroIdentificacion);

    boolean existsByNumeroIdentificacion(String numeroIdentificacion);

    Page<Paciente> findAllByActivoTrue(Pageable pageable);

    @Query("""
        SELECT p FROM Paciente p
        WHERE p.activo = true AND (
            LOWER(p.nombres)              LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(p.apellidos)            LIKE LOWER(CONCAT('%', :q, '%')) OR
            p.numeroIdentificacion        LIKE CONCAT('%', :q, '%')
        )
        """)
    Page<Paciente> buscar(@Param("q") String q, Pageable pageable);

    List<Paciente> findAllByActivoTrue();

    long countByActivoTrue();
}
