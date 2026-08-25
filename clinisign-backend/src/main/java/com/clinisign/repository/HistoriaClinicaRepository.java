package com.clinisign.repository;

import com.clinisign.model.HistoriaClinica;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistoriaClinicaRepository extends JpaRepository<HistoriaClinica, Long> {
    Page<HistoriaClinica> findByPacienteIdOrderByCreatedAtDesc(Long pacienteId, Pageable pageable);
    List<HistoriaClinica> findByPacienteIdOrderByCreatedAtDesc(Long pacienteId);
    long count();
}
