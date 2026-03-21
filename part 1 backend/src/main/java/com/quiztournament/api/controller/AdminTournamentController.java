package com.quiztournament.api.controller;

import com.quiztournament.api.dto.ScoreBoardResponse;
import com.quiztournament.api.dto.TournamentDto;
import com.quiztournament.api.dto.TournamentRequest;
import com.quiztournament.api.service.OpenTdbService;
import com.quiztournament.api.service.TournamentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/tournaments")
@PreAuthorize("hasRole('ADMIN')")
public class AdminTournamentController {

    @Autowired
    private TournamentService tournamentService;

    @Autowired
    private OpenTdbService openTdbService;

    /** Returns available quiz categories (id -> name) for tournament creation. */
    @GetMapping("/categories")
    public ResponseEntity<Map<Integer, String>> getCategories() {
        return ResponseEntity.ok(openTdbService.getCategories());
    }

    @PostMapping
    public ResponseEntity<String> createTournament(@Valid @RequestBody TournamentRequest request) {
        String response = tournamentService.createTournament(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<TournamentDto>> getAllTournaments() {
        return ResponseEntity.ok(tournamentService.getAllTournaments());
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateTournament(@PathVariable Long id, @Valid @RequestBody TournamentRequest request) {
        String response = tournamentService.updateTournament(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTournament(@PathVariable Long id) {
        tournamentService.deleteTournament(id);
        return ResponseEntity.ok("Tournament deleted successfully");
    }
    
    @GetMapping("/{id}/scoreboard")
    public ResponseEntity<ScoreBoardResponse> getScoreboard(@PathVariable Long id) {
        return ResponseEntity.ok(tournamentService.getScoreboard(id));
    }

    @GetMapping("/{id}/questions")
    public ResponseEntity<List<com.quiztournament.api.dto.AdminQuestionDto>> getQuestions(@PathVariable Long id) {
        return ResponseEntity.ok(tournamentService.getTournamentQuestions(id));
    }
}
