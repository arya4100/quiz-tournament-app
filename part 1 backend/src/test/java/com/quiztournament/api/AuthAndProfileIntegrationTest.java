package com.quiztournament.api;

import com.quiztournament.api.dto.*;
import com.quiztournament.api.model.Role;
import com.quiztournament.api.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class AuthAndProfileIntegrationTest {

    @Autowired
    private UserService userService;

    @Test
    public void testAuthAndProfileLifecycle() {
        // 1. Signup Player
        SignUpRequest signup = new SignUpRequest();
        signup.setUsername("testplayer");
        signup.setEmail("test@player.com");
        signup.setPassword("password123");
        signup.setFirstName("Test");
        signup.setLastName("Player");
        signup.setPhoneNumber("123456789");
        signup.setAddress("Test Street");
        signup.setBio("Hello Bio");

        String regResult = userService.registerUser(signup, Role.PLAYER);
        assertEquals("User registered successfully!", regResult);

        // 2. Authenticate
        AuthRequest login = new AuthRequest();
        login.setUsername("testplayer");
        login.setPassword("password123");
        AuthResponse auth = userService.authenticateUser(login);
        assertNotNull(auth.getToken());
        assertEquals("testplayer", auth.getUsername());
        assertEquals("ROLE_PLAYER", auth.getRole());

        // 3. Update Profile (including 3 choices)
        UpdateUserDto update = new UpdateUserDto();
        update.setUsername("testplayer"); // keeping same
        update.setEmail("updated@player.com");
        update.setFirstName("UpdatedFirstName");
        update.setLastName("UpdatedLastName");
        update.setPhoneNumber("987654321");
        update.setAddress("New Address");
        update.setBio("Updated Bio");

        String updateResult = userService.updateUserProfile("testplayer", update);
        assertEquals("Profile updated successfully", updateResult);

        // 4. Verify Update
        com.quiztournament.api.model.User profile = userService.getUserProfile("testplayer");
        assertEquals("updated@player.com", profile.getEmail());
        assertEquals("UpdatedFirstName", profile.getFirstName());
        assertEquals("987654321", profile.getPhoneNumber());
        assertEquals("New Address", profile.getAddress());
        assertEquals("Updated Bio", profile.getBio());
    }
}
