package com.clinisign.controller;

import com.clinisign.model.HistoriaClinica;
import com.clinisign.model.Paciente;
import com.clinisign.model.Usuario;
import com.clinisign.repository.HistoriaClinicaRepository;
import com.clinisign.repository.PacienteRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/historias-clinicas")
@RequiredArgsConstructor
@Tag(name = "Historias Clínicas (HC-FM-05)")
public class HistoriaClinicaController {

    private final HistoriaClinicaRepository repo;
    private final PacienteRepository pacienteRepo;

    @GetMapping
    public ResponseEntity<Page<HistoriaClinica>> listar(
            @RequestParam(required = false) Long pacienteId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<HistoriaClinica> result = (pacienteId != null)
            ? repo.findByPacienteIdOrderByCreatedAtDesc(pacienteId, pageable)
            : repo.findAll(pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<HistoriaClinica> obtener(@PathVariable Long id) {
        return repo.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<HistoriaClinica> crear(@RequestBody Map<String, Object> body) {
        Usuario currentUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // Obtener paciente si viene en el request
        Long pacienteId = body.get("pacienteId") != null
            ? Long.valueOf(body.get("pacienteId").toString()) : null;
        Paciente paciente = pacienteId != null
            ? pacienteRepo.findById(pacienteId).orElse(null) : null;

        HistoriaClinica hc = HistoriaClinica.builder()
            .paciente(paciente)
            .clasificacion(getString(body, "clasificacion"))
            .conductor(getString(body, "conductor"))
            .tripulante(getString(body, "tripulante"))
            .regTripulante(getString(body, "regTripulante"))
            .apoyo(getString(body, "apoyo"))
            .origen(getString(body, "origen"))
            .destino1(getString(body, "destino1"))
            .destino2(getString(body, "destino2"))
            .destinoFinal(getString(body, "destinoFinal"))
            .placaMovil(getString(body, "placaMovil"))
            .tipoTraslado(getString(body, "tipoTraslado"))
            .evolucion(getString(body, "evolucion"))
            .diagnosticoCie10(getString(body, "diagnosticoCie10"))
            .diagnosticoDescripcion(getString(body, "diagnosticoDescripcion"))
            .complicaciones(getString(body, "complicaciones"))
            .cuidadosAnteriores(getString(body, "cuidadosAnteriores"))
            .firmaPaciente(getString(body, "firmaPaciente"))
            .firmaAcompanante(getString(body, "firmaAcompanante"))
            .firmaTalentoHumano(getString(body, "firmaTalentoHumano"))
            .ccTalentoHumano(getString(body, "ccTalentoHumano"))
            .createdBy(currentUser)
            .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(hc));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HistoriaClinica> actualizar(
            @PathVariable Long id,
            @RequestBody HistoriaClinica hcData) {
        return repo.findById(id).map(existing -> {
            hcData.setId(id);
            hcData.setCreatedBy(existing.getCreatedBy());
            hcData.setCreatedAt(existing.getCreatedAt());
            return ResponseEntity.ok(repo.save(hcData));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private String getString(Map<String, Object> body, String key) {
        Object v = body.get(key);
        return v != null ? v.toString() : null;
    }
}
