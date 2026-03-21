package com.quiztournament.api.service;

import com.quiztournament.api.dto.*;
import com.quiztournament.api.model.Role;
import com.quiztournament.api.model.User;

/**
 * Service interface for managing user authentication and profiles.
 */
public interface UserService {
    AuthResponse authenticateUser(AuthRequest loginRequest);
    String registerUser(SignUpRequest signUpRequest, Role role);
    User getUserProfile(String username);
    String updateUserProfile(String username, UpdateUserDto updateDto);
    String changePassword(String username, PasswordChangeRequest request);
}
