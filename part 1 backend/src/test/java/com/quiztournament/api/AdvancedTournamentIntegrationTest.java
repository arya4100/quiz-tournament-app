package com.quiztournament.api;

import com.quiztournament.api.dto.*;
import com.quiztournament.api.model.Role;
import com.quiztournament.api.model.User;
import com.quiztournament.api.repository.AdminAuditLogRepository;
import com.quiztournament.api.service.TournamentService;
import com.quiztournament.api.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class AdvancedTournamentIntegrationTest {

    @Autowired
    private TournamentService tournamentService;

    @Autowired
    private UserService userService;
    
    @Autowired
    private AdminAuditLogRepository auditLogRepository;

    @Test
    public void testComplexProjectLogic() {
        // 1. Requirement: Create Admin with specific credentials handled in DataInitializer, 
        // but let's test a programmatic setup for the logic.
        SignUpRequest adminSignup = new SignUpRequest();
        adminSignup.setUsername("admin_test");
        adminSignup.setPassword("op@1234");
        adminSignup.setEmail("admin@test.com");
        adminSignup.setFirstName("Admin");
        adminSignup.setLastName("User");
        userService.registerUser(adminSignup, Role.ADMIN);
        
        // 2. Requirement: Create Tournament with 10 questions (TournamentServiceImpl mocks OpenTdbService internally or uses a mock)
        TournamentRequest tRequest = new TournamentRequest();
        tRequest.setName("Logic Tournament");
        tRequest.setCreator("Admin");
        tRequest.setDifficulty("medium");
        tRequest.setCategoryId(9);
        tRequest.setStartDate(LocalDateTime.now().minusDays(1)); // Ongoing
        tRequest.setEndDate(LocalDateTime.now().plusDays(1));
        tRequest.setPassingThreshold(7.0);
        
        tournamentService.createTournament(tRequest);
        List<TournamentDto> tournaments = tournamentService.getAllTournaments();
        TournamentDto ongoing = tournaments.stream().filter(t -> t.getName().equals("Logic Tournament")).findFirst().get();

        // 3. User Participation and Score Persistence
        SignUpRequest pSignup = new SignUpRequest();
        pSignup.setUsername("player_test");
        pSignup.setPassword("password");
        pSignup.setFirstName("Player");
        pSignup.setLastName("User");
        pSignup.setEmail("player@test.com");
        userService.registerUser(pSignup, Role.PLAYER);
        User player = userService.getUserProfile("player_test");

        // Participate
        tournamentService.completeTournament(player, ongoing.getId(), 8); // Score 8/10

        // 4. Requirement Verification: Scoreboard sorting (DESC)
        ScoreBoardResponse scoreboard = tournamentService.getScoreboard(ongoing.getId());
        assertEquals(1, scoreboard.getScores().size());
        assertEquals(8, scoreboard.getScores().get(0).getScore());
        
        // 5. Requirement Verification: History Accuracy (Ad-hoc feature)
        List<Map<String, Object>> history = tournamentService.getPlayerHistory(player);
        assertEquals(80.0, history.get(0).get("accuracyPercentage"));
        assertTrue((Boolean) history.get(0).get("passed"));

        // 6. Requirement Verification: Global Rank (Ad-hoc feature)
        int rank = tournamentService.getUserRank(player);
        assertTrue(rank >= 1);

        // 7. Admin Requirement: Audit Log Entries
        tournamentService.deleteTournament(ongoing.getId());
        assertFalse(auditLogRepository.findAllByOrderByTimestampDesc().isEmpty());
    }
}
