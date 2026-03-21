package com.quiztournament.api.dto;

import lombok.Data;
import java.util.List;

@Data
public class AdminQuestionDto {
    private Long id;
    private String questionText;
    private String type;
    private String difficulty;
    private String correctAnswer;
    private List<String> incorrectAnswers;
}
