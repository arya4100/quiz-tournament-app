package com.quiztournament.api.service;

import com.quiztournament.api.dto.*;
import com.quiztournament.api.exception.BadRequestException;
import com.quiztournament.api.exception.ResourceNotFoundException;
import com.quiztournament.api.model.AdminAuditLog;
import com.quiztournament.api.model.Role;
import com.quiztournament.api.model.User;
import com.quiztournament.api.repository.AdminAuditLogRepository;
import com.quiztournament.api.repository.UserRepository;
import com.quiztournament.api.security.JwtUtils;
import com.quiztournament.api.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Implementation of UserService for handling authentication and profile management.
 */
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AdminAuditLogRepository auditLogRepository;

    @Override
    public AuthResponse authenticateUser(AuthRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal(); 
        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        if ("ROLE_ADMIN".equals(role)) {
            AdminAuditLog log = new AdminAuditLog();
            log.setAdminUsername(userDetails.getUsername());
            log.setAction("LOGIN");
            log.setDetails("Admin successfully authenticated via REST API");
            log.setTimestamp(java.time.LocalDateTime.now());
            auditLogRepository.save(log);
        }

        return new AuthResponse(jwt, userDetails.getUsername(), role);
    }

    @Override
    public String registerUser(SignUpRequest signUpRequest, Role role) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            throw new BadRequestException("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new BadRequestException("Error: Email is already in use!");
        }

        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setFirstName(signUpRequest.getFirstName());
        user.setLastName(signUpRequest.getLastName());
        user.setRole(role);
        
        user.setPhoneNumber(signUpRequest.getPhoneNumber());
        user.setAddress(signUpRequest.getAddress());
        user.setBio(signUpRequest.getBio());
        
        if (role == Role.ADMIN) {
            user.setProfilePictureUrl(signUpRequest.getProfilePictureUrl());
        }

        userRepository.save(user);
        return "User registered successfully!";
    }

    @Override
    public User getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setPassword(""); // Security: do not return hashed password
        return user;
    }

    @Override
    public String updateUserProfile(String username, UpdateUserDto updateDto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (updateDto.getUsername() != null && !updateDto.getUsername().equals(user.getUsername())) {
             if (userRepository.existsByUsername(updateDto.getUsername())) {
                 throw new BadRequestException("Error: Username is already taken!");
             }
             user.setUsername(updateDto.getUsername());
        }
        
        if (updateDto.getEmail() != null && !updateDto.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(updateDto.getEmail())) {
                throw new BadRequestException("Error: Email is already in use!");
            }
            user.setEmail(updateDto.getEmail());
        }

        if (updateDto.getFirstName() != null) user.setFirstName(updateDto.getFirstName());
        if (updateDto.getLastName() != null) user.setLastName(updateDto.getLastName());
        if (updateDto.getPhoneNumber() != null) user.setPhoneNumber(updateDto.getPhoneNumber());
        if (updateDto.getAddress() != null) user.setAddress(updateDto.getAddress());
        if (updateDto.getBio() != null) user.setBio(updateDto.getBio());

         userRepository.save(user);
         return "Profile updated successfully";
     }
 
     @Override
     public String changePassword(String username, PasswordChangeRequest request) {
         User user = userRepository.findByUsername(username)
                 .orElseThrow(() -> new ResourceNotFoundException("User not found"));
 
         if (!encoder.matches(request.getCurrentPassword(), user.getPassword())) {
             throw new BadRequestException("Error: Incorrect current password!");
         }
 
         user.setPassword(encoder.encode(request.getNewPassword()));
         userRepository.save(user);
         return "Password changed successfully";
     }
 }
