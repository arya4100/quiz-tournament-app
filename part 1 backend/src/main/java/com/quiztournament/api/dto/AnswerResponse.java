package com.quiztournament.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AnswerResponse {
    private boolean correct;
    private String correctAnswer;
    private String feedback;
}
