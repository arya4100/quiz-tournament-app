package com.quiztournament.api.dto;

import lombok.Data;
import java.util.List;

@Data
public class QuestionDto {
    private Long id;
    private String questionText;
    private String type;
    private String difficulty;
    private List<String> options; // all answers shuffled
}
