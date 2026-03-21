package com.quiztournament.api.service;

import com.quiztournament.api.dto.OpenTdbResponse;
import com.quiztournament.api.model.Question;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * OPENTDB INTEGRATION SERVICE
 *
 * Communicates with the external OpenTDB API and transforms
 * raw JSON data into our internal Question model.
 * Supports 7 distinct categories for tournament creation.
 */
@Service
public class OpenTdbService {

    private static final String BASE_URL = "https://opentdb.com/api.php";

    // OpenTDB category IDs mapped to human-readable names (7 categories required by PRD)
    public static final Map<Integer, String> CATEGORIES = new LinkedHashMap<>();
    static {
        CATEGORIES.put(9,  "General Knowledge");
        CATEGORIES.put(17, "Science & Nature");
        CATEGORIES.put(23, "History");
        CATEGORIES.put(22, "Geography");
        CATEGORIES.put(11, "Movies & Film");
        CATEGORIES.put(18, "Computers & Technology");
        CATEGORIES.put(21, "Sports");
    }

    private final RestTemplate restTemplate;

    @Autowired
    public OpenTdbService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Returns the list of supported categories as a map of ID -> Name.
     * Used by the frontend category dropdown during tournament creation.
     */
    public Map<Integer, String> getCategories() {
        return CATEGORIES;
    }

    public List<Question> fetchQuestions(int amount, Integer categoryId, String difficulty, String type) {
        StringBuilder urlBuilder = new StringBuilder(BASE_URL).append("?amount=").append(amount);

        if (categoryId != null) urlBuilder.append("&category=").append(categoryId);
        if (difficulty != null && !difficulty.isEmpty()) urlBuilder.append("&difficulty=").append(difficulty.toLowerCase());
        if (type != null && !type.isEmpty()) urlBuilder.append("&type=").append(type.toLowerCase());

        String url = urlBuilder.toString();
        int retries = 3;
        while (retries > 0) {
            try {
                OpenTdbResponse response = restTemplate.getForObject(url, OpenTdbResponse.class);
                if (response != null && response.getResponse_code() == 0 && response.getResults() != null) {
                    return mapToEntity(response.getResults());
                }
                // Handle non-zero but non-429 codes if they appear in valid bodies
                if (response != null && response.getResponse_code() == 5) {
                    throw new org.springframework.web.client.HttpClientErrorException(org.springframework.http.HttpStatus.TOO_MANY_REQUESTS, "OpenTDB Rate Limit");
                }
            } catch (org.springframework.web.client.HttpStatusCodeException e) {
                if (e.getStatusCode().value() == 429 || (e.getResponseBodyAsString().contains("\"response_code\":5"))) {
                    retries--;
                    try {
                        Thread.sleep(5000); 
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                    }
                    continue;
                }
                throw new RuntimeException("HTTP Error from OpenTDB: " + e.getStatusCode() + " " + e.getResponseBodyAsString());
            } catch (Exception e) {
                throw new RuntimeException("Unexpected error fetching from OpenTDB: " + e.getMessage());
            }
            retries--; // Avoid infinite loop if response is non-null but invalid
        }
        throw new RuntimeException("Exhausted retries or received invalid response from OpenTDB");
    }

    private List<Question> mapToEntity(List<OpenTdbResponse.OpenTdbQuestion> tdbQuestions) {
        List<Question> questions = new ArrayList<>();

        for (OpenTdbResponse.OpenTdbQuestion tdbQuestion : tdbQuestions) {
            Question q = new Question();
            // Decode HTML entities (Requirement: Professional data handling)
            q.setQuestionText(org.springframework.web.util.HtmlUtils.htmlUnescape(tdbQuestion.getQuestion()));
            q.setType(tdbQuestion.getType());
            q.setDifficulty(tdbQuestion.getDifficulty());
            q.setCorrectAnswer(org.springframework.web.util.HtmlUtils.htmlUnescape(tdbQuestion.getCorrect_answer()));
            
            List<String> incorrect = new ArrayList<>();
            for (String inc : tdbQuestion.getIncorrect_answers()) {
                incorrect.add(org.springframework.web.util.HtmlUtils.htmlUnescape(inc));
            }
            q.setIncorrectAnswers(incorrect);
            questions.add(q);
        }

        return questions;
    }
}
