package com.quiztournament.api.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TournamentDto {
    private Long id;
    private String name;
    private String category;
    private String difficulty;
    private String creator;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Double passingThreshold;
    private Long numLikes;
    private boolean isLiked;
    private Integer userScore;
}
