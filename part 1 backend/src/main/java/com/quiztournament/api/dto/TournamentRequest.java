package com.quiztournament.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * TournamentRequest — DTO for creating or updating a tournament.
 *
 * Dates accept both formats:
 *   - "2026-03-22"           (date only — time defaults to midnight)
 *   - "2026-03-22T00:00:00"  (full datetime)
 */
@Data
public class TournamentRequest {

    @NotBlank(message = "Tournament name cannot be blank")
    private String name;

    private Integer categoryId; // optional OpenTDB category id

    private String creator;     // optional — defaults to logged-in admin

    @NotBlank(message = "Difficulty cannot be blank")
    private String difficulty;  // easy | medium | hard

    // Accepts "yyyy-MM-dd" or "yyyy-MM-dd'T'HH:mm:ss"
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss", shape = JsonFormat.Shape.STRING)
    @NotNull(message = "Start date cannot be null")
    private LocalDateTime startDate;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss", shape = JsonFormat.Shape.STRING)
    @NotNull(message = "End date cannot be null")
    private LocalDateTime endDate;

    @NotNull(message = "Passing threshold cannot be null")
    private Double passingThreshold;

    // Support "category" as well as "categoryId" from frontend
    private String category;
    private Integer passMarkPercentage;
}
