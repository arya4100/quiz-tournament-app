package com.quiztournament.api.dto;

import lombok.Data;

@Data
public class AuthRequest {
    private String username; // or email
    private String password;
}
