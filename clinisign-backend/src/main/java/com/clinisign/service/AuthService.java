package com.clinisign.service;

import com.clinisign.dto.auth.AuthRequest;
import com.clinisign.dto.auth.AuthResponse;
import com.clinisign.model.Usuario;
import com.clinisign.repository.UsuarioRepository;
import com.clinisign.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepo;

    public AuthResponse login(AuthRequest request) {
        Authentication auth = authManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        Usuario usuario = (Usuario) auth.getPrincipal();

        Map<String, Object> claims = Map.of(
            "rol",      usuario.getRol().name(),
            "nombres",  usuario.getNombres(),
            "apellidos", usuario.getApellidos()
        );

        String accessToken  = jwtUtil.generateToken(usuario, claims);
        String refreshToken = jwtUtil.generateRefreshToken(usuario);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(usuario.getEmail())
                .nombres(usuario.getNombres() + " " + usuario.getApellidos())
                .rol(usuario.getRol().name())
                .userId(usuario.getId())
                .build();
    }
}
