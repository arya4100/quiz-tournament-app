package com.quiztournament.api.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    private String firstName;
    private String lastName;
    
    // 3 additional attributes
    private String phoneNumber;
    private String address;
    private String bio;
    
    @Enumerated(EnumType.STRING)
    private Role role;
    
    // For admin users, optional picture
    private String profilePictureUrl;
}
