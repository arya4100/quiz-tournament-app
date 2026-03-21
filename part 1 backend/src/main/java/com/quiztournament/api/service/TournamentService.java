package com.quiztournament.api.service;

import com.quiztournament.api.dto.AdminQuestionDto;
import com.quiztournament.api.dto.AnswerRequest;
import com.quiztournament.api.dto.AnswerResponse;
import com.quiztournament.api.dto.QuestionDto;
import com.quiztournament.api.dto.ScoreBoardResponse;
import com.quiztournament.api.dto.TournamentDto;
import com.quiztournament.api.dto.TournamentRequest;
import com.quiztournament.api.model.User;

import java.util.List;
import java.util.Map;

/**
 * Service interface for managing quiz tournaments and player participation.
 */
public interface TournamentService {
    
    // Admin features
    String createTournament(TournamentRequest request);
    List<TournamentDto> getAllTournaments();
    String updateTournament(Long id, TournamentRequest request);
    void deleteTournament(Long id);
    ScoreBoardResponse getScoreboard(Long id);
    List<AdminQuestionDto> getTournamentQuestions(Long id);
    
    // Player features
    List<TournamentDto> getTournaments(User user, String status);
    List<QuestionDto> enterTournament(User user, Long tournamentId);
    AnswerResponse submitAnswer(Long tournamentId, Long questionId, AnswerRequest request);
    com.quiztournament.api.dto.QuizResultResponse completeTournament(User user, Long tournamentId, int score);
    String likeTournament(User user, Long tournamentId);
    String unlikeTournament(User user, Long tournamentId);
    List<Map<String, Object>> getPlayerHistory(User user);
    List<Map<String, Object>> getGlobalLeaderboard();
    int getUserRank(User user);
}
