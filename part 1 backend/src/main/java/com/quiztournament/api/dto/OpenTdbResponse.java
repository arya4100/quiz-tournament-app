package com.quiztournament.api.dto;

import lombok.Data;
import java.util.List;

@Data
public class OpenTdbResponse {
    private int response_code;
    private List<OpenTdbQuestion> results;

    @Data
    public static class OpenTdbQuestion {
        private String category;
        private String type;
        private String difficulty;
        private String question;
        private String correct_answer;
        private List<String> incorrect_answers;
    }
}
