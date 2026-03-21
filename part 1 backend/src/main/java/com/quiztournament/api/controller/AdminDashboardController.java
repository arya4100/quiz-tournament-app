package com.quiztournament.api.controller;

import com.quiztournament.api.dto.UserDto;
import com.quiztournament.api.model.User;
import com.quiztournament.api.repository.AdminAuditLogRepository;
import com.quiztournament.api.repository.TournamentLikeRepository;
import com.quiztournament.api.model.AdminAuditLog;
import com.quiztournament.api.repository.TournamentRepository;
import com.quiztournament.api.repository.TournamentScoreRepository;
import com.quiztournament.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TournamentRepository tournamentRepository;

    @Autowired
    private TournamentScoreRepository scoreRepository;

    @Autowired
    private AdminAuditLogRepository auditLogRepository;

    @Autowired
    private TournamentLikeRepository likeRepository;

    // Feature 1: View all registered users
    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserDto> userDtos = users.stream().map(this::mapToDto).collect(Collectors.toList());
        return ResponseEntity.ok(userDtos);
    }

    // Feature 2: View overall application statistics
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalTournaments", tournamentRepository.count());
        stats.put("totalTournamentPlays", scoreRepository.count());
        
        // Detailed Analytics (Ad-hoc Features)
        long totalQuestionsAnswered = scoreRepository.count() * 10;
        long totalLikes = likeRepository.count();
        stats.put("totalQuestionsAnswered", totalQuestionsAnswered);
        stats.put("totalLikesGiven", totalLikes);
        
        return ResponseEntity.ok(stats);
    }

    // Feature 3: Security Audit Log (Ad-hoc Feature)
    @GetMapping("/audit-logs")
    public ResponseEntity<List<AdminAuditLog>> getAuditLogs() {
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByTimestampDesc());
    }

    private UserDto mapToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setAddress(user.getAddress());
        dto.setBio(user.getBio());
        dto.setRole(user.getRole().name());
        dto.setProfilePictureUrl(user.getProfilePictureUrl());
        return dto;
    }
}
