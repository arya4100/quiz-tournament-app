package com.quiztournament.api.dto;

import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String address;
    private String bio;
    private String role;
    private String profilePictureUrl;
}
