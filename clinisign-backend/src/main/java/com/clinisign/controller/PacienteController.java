package com.clinisign.controller;

import com.clinisign.dto.paciente.PacienteDTO;
import com.clinisign.dto.paciente.PacienteRequest;
import com.clinisign.service.PacienteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/pacientes")
@RequiredArgsConstructor
@Tag(name = "Pacientes")
public class PacienteController {

    private final PacienteService service;

    @GetMapping
    @Operation(summary = "Listar pacientes (con búsqueda y paginación)")
    public ResponseEntity<Page<PacienteDTO>> listar(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "DESC") String dir) {

        Pageable pageable = PageRequest.of(page, size,
            Sort.by(Sort.Direction.fromString(dir), sort));
        return ResponseEntity.ok(service.listar(q, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PacienteDTO> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtener(id));
    }

    @PostMapping
    public ResponseEntity<PacienteDTO> crear(@Valid @RequestBody PacienteRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PacienteDTO> actualizar(@PathVariable Long id, @Valid @RequestBody PacienteRequest req) {
        return ResponseEntity.ok(service.actualizar(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/export-excel")
    @Operation(summary = "Exportar pacientes a Excel")
    public ResponseEntity<byte[]> exportarExcel() throws IOException {
        byte[] data = service.exportarExcel();
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=pacientes_siansalud.xlsx")
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(data);
    }

    @PostMapping("/import-excel")
    @Operation(summary = "Importar pacientes desde Excel")
    public ResponseEntity<List<PacienteDTO>> importarExcel(@RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(service.importarExcel(file));
    }
}
