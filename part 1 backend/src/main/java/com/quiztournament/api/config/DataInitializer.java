package com.quiztournament.api.config;

import com.quiztournament.api.dto.TournamentRequest;
import com.quiztournament.api.model.Role;
import com.quiztournament.api.model.User;
import com.quiztournament.api.repository.TournamentRepository;
import com.quiztournament.api.repository.UserRepository;
import com.quiztournament.api.service.TournamentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * DataInitializer — runs once on every application startup.
 * Seeds guaranteed static accounts so the app is always usable:
 *
 *   ADMIN  → username: admin    / password: admin123
 *   PLAYER → username: player   / password: player123
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TournamentRepository tournamentRepository;

    @Autowired
    private TournamentService tournamentService;

    @Override
    public void run(String... args) throws Exception {
        seedAdmin();
        seedPlayer();
        seedTournaments();
    }

    private void seedAdmin() {
        if (userRepository.existsByUsername("admin")) return;

        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setEmail("admin@quiztournament.com");
        admin.setFirstName("Admin");
        admin.setLastName("User");
        admin.setRole(Role.ADMIN);
        admin.setPhoneNumber("1234567890");
        admin.setAddress("Auckland, NZ");
        admin.setBio("System Administrator");
        userRepository.save(admin);
    }

    private void seedPlayer() {
        if (userRepository.existsByUsername("player")) return;

        User player = new User();
        player.setUsername("player");
        player.setPassword(passwordEncoder.encode("player123"));
        player.setEmail("player@quiztournament.com");
        player.setFirstName("Test");
        player.setLastName("Player");
        player.setRole(Role.PLAYER);
        player.setPhoneNumber("0987654321");
        player.setAddress("Wellington, NZ");
        player.setBio("Enthusiastic Quiz Player");
        userRepository.save(player);
    }

    private void seedTournaments() {
        if (tournamentRepository.count() > 0) return;

        try {
            System.out.println("Seeding default tournaments...");
            
            TournamentRequest easy = new TournamentRequest();
            easy.setName("General Knowledge Blitz");
            easy.setCategoryId(9);
            easy.setDifficulty("easy");
            easy.setCreator("admin");
            easy.setStartDate(LocalDateTime.now().minusDays(1));
            easy.setEndDate(LocalDateTime.now().plusDays(7));
            easy.setPassingThreshold(6.0);
            tournamentService.createTournament(easy);

            TournamentRequest medium = new TournamentRequest();
            medium.setName("Science & Nature Challenge");
            medium.setCategoryId(17);
            medium.setDifficulty("medium");
            medium.setCreator("admin");
            medium.setStartDate(LocalDateTime.now().minusDays(1));
            medium.setEndDate(LocalDateTime.now().plusDays(7));
            medium.setPassingThreshold(7.0);
            tournamentService.createTournament(medium);

            System.out.println("Seeding complete: 2 tournaments added.");
        } catch (Exception e) {
            System.err.println("Warning: Could not seed tournaments. " + e.getMessage());
        }
    }

}

