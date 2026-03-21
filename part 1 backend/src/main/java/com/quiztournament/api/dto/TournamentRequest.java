package com.quiztournament.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TournamentRequest {
    @NotBlank(message = "Tournament name cannot be blank")
    private String name;
    
    private Integer categoryId; // optional OpenTDB category id
    
    @NotBlank(message = "Creator name cannot be blank")
    private String creator;
    
    @NotBlank(message = "Difficulty cannot be blank")
    private String difficulty; // easy, medium, hard
    
    @NotNull(message = "Start date cannot be null")
    private LocalDateTime startDate;
    
    @NotNull(message = "End date cannot be null")
    private LocalDateTime endDate;
    
    @NotNull(message = "Passing threshold cannot be null")
    private Double passingThreshold;
}
