package com.clinisign.dto.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private String email;
    private String nombres;
    private String rol;
    private Long userId;
}
