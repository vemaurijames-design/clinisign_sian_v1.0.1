package com.clinisign.controller;

import com.clinisign.model.Solicitud;
import com.clinisign.repository.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard")
public class DashboardController {

    private final PacienteRepository pacienteRepo;
    private final HistoriaClinicaRepository historiaRepo;
    private final SolicitudRepository solicitudRepo;
    private final UsuarioRepository usuarioRepo;
    private final ConsentimientoRepository consentimientoRepo;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getStats() {
        LocalDateTime hoyInicio = LocalDate.now().atStartOfDay();

        DashboardStats stats = DashboardStats.builder()
            .totalPacientes(pacienteRepo.countByActivoTrue())
            .totalHistorias(historiaRepo.count())
            .totalConsentimientos(consentimientoRepo.count())
            .solicitudesPendientes(solicitudRepo.countByEstado(Solicitud.Estado.PENDIENTE))
            .solicitudesEnProceso(solicitudRepo.countByEstado(Solicitud.Estado.EN_PROCESO))
            .solicitudesCompletadas(solicitudRepo.countByEstado(Solicitud.Estado.COMPLETADA))
            .solicitudesHoy(solicitudRepo.countByCreatedAtAfter(hoyInicio))
            .totalUsuarios(usuarioRepo.findAllByActivoTrue().size())
            .build();

        return ResponseEntity.ok(stats);
    }

    @Data
    @Builder
    public static class DashboardStats {
        private long totalPacientes;
        private long totalHistorias;
        private long totalConsentimientos;
        private long solicitudesPendientes;
        private long solicitudesEnProceso;
        private long solicitudesCompletadas;
        private long solicitudesHoy;
        private long totalUsuarios;
    }
}
