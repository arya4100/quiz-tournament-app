package com.quiztournament.api;

import com.quiztournament.api.dto.TournamentDto;
import com.quiztournament.api.dto.TournamentRequest;
import com.quiztournament.api.service.TournamentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class TournamentIntegrationTest {

    @Autowired
    private TournamentService tournamentService;

    @Test
    public void testTournamentLifecycle() {
        // 1. Create
        TournamentRequest request = new TournamentRequest();
        request.setName("Test Tournament");
        request.setCreator("Test Creator");
        request.setDifficulty("medium");
        request.setCategoryId(9);
        request.setStartDate(LocalDateTime.now().plusDays(1));
        request.setEndDate(LocalDateTime.now().plusDays(2));
        request.setPassingThreshold(70.0);

        String result = tournamentService.createTournament(request);
        assertEquals("Tournament created successfully with 10 dynamic questions!", result);

        // 2. View
        List<TournamentDto> tournaments = tournamentService.getAllTournaments();
        assertFalse(tournaments.isEmpty());
        TournamentDto created = tournaments.stream()
                .filter(t -> t.getName().equals("Test Tournament"))
                .findFirst()
                .orElse(null);
        assertNotNull(created);
        assertEquals("Test Creator", created.getCreator());

        // 3. Update
        request.setName("Updated Tournament");
        tournamentService.updateTournament(created.getId(), request);
        
        List<TournamentDto> updatedList = tournamentService.getAllTournaments();
        assertTrue(updatedList.stream().anyMatch(t -> t.getName().equals("Updated Tournament")));

        // 4. View Questions
        assertNotNull(tournamentService.getTournamentQuestions(created.getId()));
        assertEquals(10, tournamentService.getTournamentQuestions(created.getId()).size());

        // 5. Delete
        tournamentService.deleteTournament(created.getId());
        assertFalse(tournamentService.getAllTournaments().stream().anyMatch(t -> t.getId().equals(created.getId())));
    }
}
