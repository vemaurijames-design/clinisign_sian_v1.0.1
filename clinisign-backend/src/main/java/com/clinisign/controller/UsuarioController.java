package com.clinisign.controller;

import com.clinisign.model.Usuario;
import com.clinisign.repository.UsuarioRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Usuarios (solo ADMIN)")
public class UsuarioController {

    private final UsuarioRepository repo;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<UsuarioInfo>> listar() {
        return ResponseEntity.ok(
            repo.findAllByActivoTrue().stream().map(UsuarioInfo::from).toList()
        );
    }

    @PostMapping
    public ResponseEntity<UsuarioInfo> crear(@RequestBody UsuarioRequest req) {
        if (repo.existsByEmail(req.getEmail()))
            return ResponseEntity.status(HttpStatus.CONFLICT).build();

        Usuario u = Usuario.builder()
            .nombres(req.getNombres())
            .apellidos(req.getApellidos())
            .email(req.getEmail())
            .password(passwordEncoder.encode(req.getPassword()))
            .rol(Usuario.Rol.valueOf(req.getRol()))
            .documentoTipo(req.getDocumentoTipo())
            .documentoNumero(req.getDocumentoNumero())
            .telefono(req.getTelefono())
            .registroProfesional(req.getRegistroProfesional())
            .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(UsuarioInfo.from(repo.save(u)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioInfo> actualizar(@PathVariable Long id, @RequestBody UsuarioRequest req) {
        return repo.findById(id).map(u -> {
            u.setNombres(req.getNombres());
            u.setApellidos(req.getApellidos());
            u.setRol(Usuario.Rol.valueOf(req.getRol()));
            u.setDocumentoTipo(req.getDocumentoTipo());
            u.setDocumentoNumero(req.getDocumentoNumero());
            u.setTelefono(req.getTelefono());
            u.setRegistroProfesional(req.getRegistroProfesional());
            if (req.getPassword() != null && !req.getPassword().isBlank())
                u.setPassword(passwordEncoder.encode(req.getPassword()));
            return ResponseEntity.ok(UsuarioInfo.from(repo.save(u)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        repo.findById(id).ifPresent(u -> { u.setActivo(false); repo.save(u); });
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/reset-password")
    public ResponseEntity<Void> resetPassword(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return repo.findById(id).map(u -> {
            u.setPassword(passwordEncoder.encode(body.get("password")));
            repo.save(u);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── Inner DTOs ─────────────────────────────────────────

    @Data
    public static class UsuarioRequest {
        private String nombres;
        private String apellidos;
        private String email;
        private String password;
        private String rol;
        private String documentoTipo;
        private String documentoNumero;
        private String telefono;
        private String registroProfesional;
    }

    @Data
    public static class UsuarioInfo {
        private Long id;
        private String nombres;
        private String apellidos;
        private String email;
        private String rol;
        private String documentoTipo;
        private String documentoNumero;
        private String telefono;
        private String registroProfesional;
        private Boolean activo;

        public static UsuarioInfo from(Usuario u) {
            UsuarioInfo info = new UsuarioInfo();
            info.id = u.getId();
            info.nombres = u.getNombres();
            info.apellidos = u.getApellidos();
            info.email = u.getEmail();
            info.rol = u.getRol().name();
            info.documentoTipo = u.getDocumentoTipo();
            info.documentoNumero = u.getDocumentoNumero();
            info.telefono = u.getTelefono();
            info.registroProfesional = u.getRegistroProfesional();
            info.activo = u.getActivo();
            return info;
        }
    }
}
