package com.quiztournament.api.controller;

import com.quiztournament.api.dto.AuthRequest;
import com.quiztournament.api.dto.AuthResponse;
import com.quiztournament.api.dto.SignUpRequest;
import com.quiztournament.api.model.Role;
import com.quiztournament.api.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * AUTHENTICATION CONTROLLER
 * 
 * ROLE: Gateway for User Identity.
 * SECURITY (Requirement): Implements JWT-based Stateless Authentication.
 * This class handles Login and Registration (Signup) logic.
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    UserService userService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticateUser(@Valid @RequestBody AuthRequest loginRequest) {
        return ResponseEntity.ok(userService.authenticateUser(loginRequest));
    }

    @PostMapping("/signup/player")
    public ResponseEntity<String> registerPlayer(@Valid @RequestBody SignUpRequest signUpRequest) {
        return ResponseEntity.ok(userService.registerUser(signUpRequest, Role.PLAYER));
    }

    @PostMapping("/signup/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> registerAdmin(@Valid @RequestBody SignUpRequest signUpRequest) {
        return ResponseEntity.ok(userService.registerUser(signUpRequest, Role.ADMIN));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logoutUser() {
        return ResponseEntity.ok("Logout successful. Please remove your token on the client side.");
    }
}
