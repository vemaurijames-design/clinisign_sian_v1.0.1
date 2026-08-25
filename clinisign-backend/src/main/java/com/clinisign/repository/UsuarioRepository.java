package com.clinisign.repository;

import com.clinisign.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Usuario> findAllByActivoTrue();

    @Query("SELECT u FROM Usuario u WHERE u.activo = true AND u.rol = :rol")
    List<Usuario> findByRolAndActivoTrue(Usuario.Rol rol);
}
