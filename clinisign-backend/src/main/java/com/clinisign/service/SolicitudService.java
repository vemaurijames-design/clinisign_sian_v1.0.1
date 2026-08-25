package com.clinisign.service;

import com.clinisign.dto.solicitud.SolicitudDTO;
import com.clinisign.dto.solicitud.SolicitudRequest;
import com.clinisign.model.Paciente;
import com.clinisign.model.Solicitud;
import com.clinisign.model.Usuario;
import com.clinisign.repository.PacienteRepository;
import com.clinisign.repository.SolicitudRepository;
import com.clinisign.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SolicitudService {

    private final SolicitudRepository repo;
    private final PacienteRepository pacienteRepo;
    private final UsuarioRepository usuarioRepo;

    public Page<SolicitudDTO> listar(String estado, Pageable pageable) {
        if (estado != null && !estado.isBlank()) {
            Solicitud.Estado est = Solicitud.Estado.valueOf(estado.toUpperCase());
            return repo.findByEstadoOrderByCreatedAtDesc(est, pageable).map(this::toDTO);
        }
        return repo.findAllByOrderByCreatedAtDesc(pageable).map(this::toDTO);
    }

    public SolicitudDTO obtener(Long id) {
        return toDTO(findOrThrow(id));
    }

    public SolicitudDTO crear(SolicitudRequest req) {
        Usuario currentUser = getCurrentUser();
        Paciente paciente = req.getPacienteId() != null
            ? pacienteRepo.findById(req.getPacienteId()).orElse(null)
            : null;

        Solicitud s = Solicitud.builder()
            .tipo(Solicitud.Tipo.valueOf(req.getTipo()))
            .estado(Solicitud.Estado.PENDIENTE)
            .prioridad(Solicitud.Prioridad.valueOf(req.getPrioridad()))
            .paciente(paciente)
            .descripcion(req.getDescripcion())
            .origen(req.getOrigen())
            .destino(req.getDestino())
            .municipioOrigen(req.getMunicipioOrigen())
            .municipioDestino(req.getMunicipioDestino())
            .observaciones(req.getObservaciones())
            .createdBy(currentUser)
            .build();

        return toDTO(repo.save(s));
    }

    public SolicitudDTO cambiarEstado(Long id, String nuevoEstado, String observaciones) {
        Solicitud s = findOrThrow(id);
        Solicitud.Estado est = Solicitud.Estado.valueOf(nuevoEstado.toUpperCase());
        s.setEstado(est);

        if (est == Solicitud.Estado.EN_PROCESO) s.setFechaInicio(LocalDateTime.now());
        if (est == Solicitud.Estado.COMPLETADA || est == Solicitud.Estado.CANCELADA) {
            s.setFechaFin(LocalDateTime.now());
            if (observaciones != null) s.setMotivoCancelacion(observaciones);
        }

        return toDTO(repo.save(s));
    }

    public SolicitudDTO asignar(Long id, Long usuarioId) {
        Solicitud s = findOrThrow(id);
        Usuario u = usuarioRepo.findById(usuarioId)
            .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));
        s.setUsuarioAsignado(u);
        s.setFechaAsignacion(LocalDateTime.now());
        s.setEstado(Solicitud.Estado.EN_PROCESO);
        return toDTO(repo.save(s));
    }

    private Solicitud findOrThrow(Long id) {
        return repo.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Solicitud no encontrada: " + id));
    }

    public SolicitudDTO toDTO(Solicitud s) {
        return SolicitudDTO.builder()
            .id(s.getId())
            .numeroSolicitud(s.getNumeroSolicitud())
            .tipo(s.getTipo().name())
            .estado(s.getEstado().name())
            .prioridad(s.getPrioridad().name())
            .pacienteId(s.getPaciente() != null ? s.getPaciente().getId() : null)
            .nombrePaciente(s.getPaciente() != null
                ? s.getPaciente().getNombres() + " " + s.getPaciente().getApellidos() : null)
            .usuarioAsignadoId(s.getUsuarioAsignado() != null ? s.getUsuarioAsignado().getId() : null)
            .nombreAsignado(s.getUsuarioAsignado() != null
                ? s.getUsuarioAsignado().getNombres() + " " + s.getUsuarioAsignado().getApellidos() : null)
            .descripcion(s.getDescripcion())
            .origen(s.getOrigen())
            .destino(s.getDestino())
            .municipioOrigen(s.getMunicipioOrigen())
            .municipioDestino(s.getMunicipioDestino())
            .fechaSolicitud(s.getFechaSolicitud())
            .fechaAsignacion(s.getFechaAsignacion())
            .fechaInicio(s.getFechaInicio())
            .fechaFin(s.getFechaFin())
            .observaciones(s.getObservaciones())
            .createdAt(s.getCreatedAt())
            .build();
    }

    private Usuario getCurrentUser() {
        return (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
