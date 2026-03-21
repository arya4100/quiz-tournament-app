package com.quiztournament.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ScoreBoardResponse {
    private Long tournamentId;
    private String tournamentName;
    private long totalPlayersParticipated;
    private double averageScore;
    private long numberOfLikes;
    private List<PlayerScore> scores;

    @Data
    @AllArgsConstructor
    public static class PlayerScore {
        private String playerName;
        private LocalDateTime completedDate;
        private int score;
    }
}
