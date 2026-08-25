package com.clinisign.repository;

import com.clinisign.model.DesistimientoInformado;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DesistimientoRepository extends JpaRepository<DesistimientoInformado, Long> {
    Page<DesistimientoInformado> findByPacienteIdOrderByCreatedAtDesc(Long pacienteId, Pageable pageable);
}
