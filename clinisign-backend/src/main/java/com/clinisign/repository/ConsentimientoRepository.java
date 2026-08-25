package com.clinisign.repository;

import com.clinisign.model.ConsentimientoInformado;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConsentimientoRepository extends JpaRepository<ConsentimientoInformado, Long> {
    Page<ConsentimientoInformado> findByPacienteIdOrderByCreatedAtDesc(Long pacienteId, Pageable pageable);
}
