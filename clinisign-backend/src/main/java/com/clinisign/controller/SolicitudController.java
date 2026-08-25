package com.clinisign.controller;

import com.clinisign.dto.solicitud.SolicitudDTO;
import com.clinisign.dto.solicitud.SolicitudRequest;
import com.clinisign.service.SolicitudService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/solicitudes")
@RequiredArgsConstructor
@Tag(name = "Solicitudes")
public class SolicitudController {

    private final SolicitudService service;

    @GetMapping
    public ResponseEntity<Page<SolicitudDTO>> listar(
            @RequestParam(required = false) String estado,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(service.listar(estado, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SolicitudDTO> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtener(id));
    }

    @PostMapping
    public ResponseEntity<SolicitudDTO> crear(@Valid @RequestBody SolicitudRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(req));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<SolicitudDTO> cambiarEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(service.cambiarEstado(id, body.get("estado"), body.get("observaciones")));
    }

    @PatchMapping("/{id}/asignar")
    public ResponseEntity<SolicitudDTO> asignar(
            @PathVariable Long id,
            @RequestBody Map<String, Long> body) {
        return ResponseEntity.ok(service.asignar(id, body.get("usuarioId")));
    }
}
