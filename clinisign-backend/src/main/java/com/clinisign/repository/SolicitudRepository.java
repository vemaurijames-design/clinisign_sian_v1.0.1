package com.clinisign.repository;

import com.clinisign.model.Solicitud;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {

    Page<Solicitud> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Solicitud> findByEstadoOrderByCreatedAtDesc(Solicitud.Estado estado, Pageable pageable);

    Page<Solicitud> findByPacienteIdOrderByCreatedAtDesc(Long pacienteId, Pageable pageable);

    long countByEstado(Solicitud.Estado estado);

    @Query("SELECT COUNT(s) FROM Solicitud s WHERE s.createdAt >= :desde")
    long countByCreatedAtAfter(LocalDateTime desde);

    List<Solicitud> findByUsuarioAsignadoIdAndEstadoIn(Long usuarioId, List<Solicitud.Estado> estados);
}
