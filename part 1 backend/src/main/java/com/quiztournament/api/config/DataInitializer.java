package com.quiztournament.api.config;

import com.quiztournament.api.model.Role;
import com.quiztournament.api.model.User;
import com.quiztournament.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

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

    @Override
    public void run(String... args) throws Exception {
        seedAdmin();
        seedPlayer();
        printStartupBanner();
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

    private void printStartupBanner() {
        System.out.println("\n╔══════════════════════════════════════════════╗");
        System.out.println("║        Quiz Tournament — Ready to use!       ║");
        System.out.println("╠══════════════════════════════════════════════╣");
        System.out.println("║  ADMIN   username: admin    pass: admin123   ║");
        System.out.println("║  PLAYER  username: player   pass: player123  ║");
        System.out.println("╚══════════════════════════════════════════════╝\n");
    }
}
