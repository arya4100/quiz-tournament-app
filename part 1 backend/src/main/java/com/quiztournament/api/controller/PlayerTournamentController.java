package com.quiztournament.api.controller;

import com.quiztournament.api.dto.AnswerRequest;
import com.quiztournament.api.dto.AnswerResponse;
import com.quiztournament.api.dto.QuestionDto;
import com.quiztournament.api.dto.TournamentDto;
import com.quiztournament.api.exception.ResourceNotFoundException;
import com.quiztournament.api.model.User;
import com.quiztournament.api.repository.UserRepository;
import com.quiztournament.api.service.TournamentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/player/tournaments")
@PreAuthorize("hasRole('PLAYER')")
public class PlayerTournamentController {

    @Autowired
    private TournamentService tournamentService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<TournamentDto>> getTournaments(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(tournamentService.getTournaments(getCurrentUser(), status));
    }

    @GetMapping("/{id}/questions")
    public ResponseEntity<List<QuestionDto>> enterTournament(@PathVariable Long id) {
        return ResponseEntity.ok(tournamentService.enterTournament(getCurrentUser(), id));
    }

    @PostMapping("/{tId}/questions/{qId}/answer")
    public ResponseEntity<AnswerResponse> submitAnswer(@PathVariable Long tId, @PathVariable Long qId, @RequestBody AnswerRequest request) {
        return ResponseEntity.ok(tournamentService.submitAnswer(tId, qId, request));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<com.quiztournament.api.dto.QuizResultResponse> completeTournament(@PathVariable Long id, @RequestParam int score) {
        return ResponseEntity.ok(tournamentService.completeTournament(getCurrentUser(), id, score));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<String> likeTournament(@PathVariable Long id) {
        return ResponseEntity.ok(tournamentService.likeTournament(getCurrentUser(), id));
    }

    @DeleteMapping("/{id}/like")
    public ResponseEntity<String> unlikeTournament(@PathVariable Long id) {
        return ResponseEntity.ok(tournamentService.unlikeTournament(getCurrentUser(), id));
    }

    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> getPlayerHistory() {
        return ResponseEntity.ok(tournamentService.getPlayerHistory(getCurrentUser()));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<Map<String, Object>>> getGlobalLeaderboard() {
        return ResponseEntity.ok(tournamentService.getGlobalLeaderboard());
    }

    @GetMapping("/rank")
    public ResponseEntity<Integer> getPlayerRank() {
        return ResponseEntity.ok(tournamentService.getUserRank(getCurrentUser()));
    }
}
