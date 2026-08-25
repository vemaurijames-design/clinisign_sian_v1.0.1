package com.clinisign.controller;

import com.clinisign.model.ConsentimientoInformado;
import com.clinisign.model.DesistimientoInformado;
import com.clinisign.model.Paciente;
import com.clinisign.model.Usuario;
import com.clinisign.repository.ConsentimientoRepository;
import com.clinisign.repository.DesistimientoRepository;
import com.clinisign.repository.PacienteRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;

@RestController
@RequestMapping
@RequiredArgsConstructor
@Tag(name = "Documentos Clínicos")
public class ConsentimientoController {

    private final ConsentimientoRepository consentimientoRepo;
    private final DesistimientoRepository desistimientoRepo;
    private final PacienteRepository pacienteRepo;

    // ── CONSENTIMIENTO INFORMADO (HC-FM-04) ─────────────────

    @GetMapping("/consentimientos")
    public ResponseEntity<Page<ConsentimientoInformado>> listarConsentimientos(
            @RequestParam(required = false) Long pacienteId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ConsentimientoInformado> result = (pacienteId != null)
            ? consentimientoRepo.findByPacienteIdOrderByCreatedAtDesc(pacienteId, pageable)
            : consentimientoRepo.findAll(pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/consentimientos/{id}")
    public ResponseEntity<ConsentimientoInformado> obtenerConsentimiento(@PathVariable Long id) {
        return consentimientoRepo.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/consentimientos")
    public ResponseEntity<ConsentimientoInformado> crearConsentimiento(@RequestBody Map<String, Object> body) {
        Usuario currentUser = getCurrentUser();
        Paciente paciente = getPaciente(body);

        ConsentimientoInformado ci = ConsentimientoInformado.builder()
            .fecha(LocalDate.now())
            .hora(LocalTime.now())
            .paciente(paciente)
            .nombrePaciente(getString(body, "nombrePaciente"))
            .numeroIdentidad(getString(body, "numeroIdentidad"))
            .calidad(getString(body, "calidad"))
            .responsableDe(getString(body, "responsableDe"))
            .procInmovilizacion(getBool(body, "procInmovilizacion"))
            .procOxigeno(getBool(body, "procOxigeno"))
            .procMedicamentos(getBool(body, "procMedicamentos"))
            .procTraslado(getBool(body, "procTraslado"))
            .procOtro(getString(body, "procOtro"))
            .firmaPaciente(getString(body, "firmaPaciente"))
            .huellaDigital(getString(body, "huellaDigital"))
            .telefonoPaciente(getString(body, "telefonoPaciente"))
            .nombreAcompanante(getString(body, "nombreAcompanante"))
            .nombreAuxiliarAph(getString(body, "nombreAuxiliarAph"))
            .documentoAuxiliar(getString(body, "documentoAuxiliar"))
            .registroAuxiliar(getString(body, "registroAuxiliar"))
            .createdBy(currentUser)
            .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(consentimientoRepo.save(ci));
    }

    // ── DESISTIMIENTO INFORMADO (HC-FM-06) ──────────────────

    @GetMapping("/desistimientos")
    public ResponseEntity<Page<DesistimientoInformado>> listarDesistimientos(
            @RequestParam(required = false) Long pacienteId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<DesistimientoInformado> result = (pacienteId != null)
            ? desistimientoRepo.findByPacienteIdOrderByCreatedAtDesc(pacienteId, pageable)
            : desistimientoRepo.findAll(pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/desistimientos/{id}")
    public ResponseEntity<DesistimientoInformado> obtenerDesistimiento(@PathVariable Long id) {
        return desistimientoRepo.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/desistimientos")
    public ResponseEntity<DesistimientoInformado> crearDesistimiento(@RequestBody Map<String, Object> body) {
        Usuario currentUser = getCurrentUser();
        Paciente paciente = getPaciente(body);

        DesistimientoInformado di = DesistimientoInformado.builder()
            .fecha(LocalDate.now())
            .hora(LocalTime.now())
            .paciente(paciente)
            .nombrePersonalSalud(getString(body, "nombrePersonalSalud"))
            .procInmovilizacion(getBool(body, "procInmovilizacion"))
            .procOxigeno(getBool(body, "procOxigeno"))
            .procMedicamentos(getBool(body, "procMedicamentos"))
            .procTraslado(getBool(body, "procTraslado"))
            .procOtro(getString(body, "procOtro"))
            .firmaPaciente(getString(body, "firmaPaciente"))
            .huellaDigital(getString(body, "huellaDigital"))
            .telefonoPaciente(getString(body, "telefonoPaciente"))
            .nombreAcompanante(getString(body, "nombreAcompanante"))
            .nombreAuxiliarAph(getString(body, "nombreAuxiliarAph"))
            .documentoAuxiliar(getString(body, "documentoAuxiliar"))
            .registroAuxiliar(getString(body, "registroAuxiliar"))
            .createdBy(currentUser)
            .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(desistimientoRepo.save(di));
    }

    // ── Helpers ─────────────────────────────────────────────

    private Usuario getCurrentUser() {
        return (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private Paciente getPaciente(Map<String, Object> body) {
        Object pid = body.get("pacienteId");
        if (pid == null) return null;
        return pacienteRepo.findById(Long.valueOf(pid.toString())).orElse(null);
    }

    private String getString(Map<String, Object> body, String key) {
        Object v = body.get(key);
        return v != null ? v.toString() : null;
    }

    private Boolean getBool(Map<String, Object> body, String key) {
        Object v = body.get(key);
        if (v == null) return false;
        if (v instanceof Boolean b) return b;
        return Boolean.parseBoolean(v.toString());
    }
}
