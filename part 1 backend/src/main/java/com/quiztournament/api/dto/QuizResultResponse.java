package com.quiztournament.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuizResultResponse {
    private int score;
    private int totalQuestions;
    private int passingScore;
    private boolean earnedCertification;
    private String completionTime;
}
