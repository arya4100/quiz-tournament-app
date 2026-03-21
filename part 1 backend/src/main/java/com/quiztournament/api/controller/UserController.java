package com.quiztournament.api.controller;

import com.quiztournament.api.dto.PasswordChangeRequest;
import com.quiztournament.api.dto.UpdateUserDto;
import com.quiztournament.api.model.User;
import com.quiztournament.api.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    private String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getUserProfile() {
        return ResponseEntity.ok(userService.getUserProfile(getCurrentUsername()));
    }

    @PutMapping("/profile")
    public ResponseEntity<String> updateUserProfile(@Valid @RequestBody UpdateUserDto updateDto) {
        return ResponseEntity.ok(userService.updateUserProfile(getCurrentUsername(), updateDto));
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@Valid @RequestBody PasswordChangeRequest request) {
        return ResponseEntity.ok(userService.changePassword(getCurrentUsername(), request));
    }
}
