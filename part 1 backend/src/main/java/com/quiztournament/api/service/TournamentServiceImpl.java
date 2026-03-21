/**
 * DEFENSE NOTE: THE "BRAIN" OF THE PROJECT.
 * This file handles all the hard work: connecting to the DB and fetching 
 * questions from the OpenTDB internet API.
 */
package com.quiztournament.api.service;

import com.quiztournament.api.dto.*;
import com.quiztournament.api.dto.AdminQuestionDto;
import com.quiztournament.api.exception.BadRequestException;
import com.quiztournament.api.exception.ResourceNotFoundException;
import com.quiztournament.api.model.*;
import com.quiztournament.api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * TOURNAMENT SERVICE IMPLEMENTATION
 * 
 * CORE ARCHITECTURE (Part 1 Requirement):
 * This service handles the business logic of our "Decoupled" system.
 * It manages persistent data storage (MySQL/HSQLDB) and connects to external 
 * third-party APIs (OpenTDB) for dynamic content generation.
 */
@Service
public class TournamentServiceImpl implements TournamentService {

    @Autowired
    private TournamentRepository tournamentRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private OpenTdbService openTdbService;

    @Autowired
    private TournamentLikeRepository tournamentLikeRepository;

    @Autowired
    private TournamentScoreRepository scoreRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminAuditLogRepository auditLogRepository;

    /**
     * CREATE TOURNAMENT BUSINESS LOGIC
     * 1. Validates the date range.
     * 2. Persists the basic tournament shell to the Database.
     * 3. FETCHER: Calls OpenTdbService to get 10 questions.
     * 4. ATOMICITY: If the external API fails, we roll back the tournament creation.
     */
    @Override
    @Transactional
    public String createTournament(TournamentRequest request) {
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date cannot be before start date");
        }

        Tournament tournament = new Tournament();
        tournament.setName(request.getName());
        tournament.setCategory(request.getCategoryId() != null ? String.valueOf(request.getCategoryId()) : "Any");
        tournament.setDifficulty(request.getDifficulty());
        tournament.setCreator(request.getCreator());
        tournament.setStartDate(request.getStartDate());
        tournament.setEndDate(request.getEndDate());
        tournament.setPassingThreshold(request.getPassingThreshold());

        Tournament savedTournament = tournamentRepository.save(tournament);

        try {
            List<Question> questions = openTdbService.fetchQuestions(
                    10,
                    request.getCategoryId(),
                    request.getDifficulty(),
                    null
            );
            
            if (savedTournament.getQuestions() == null) {
                savedTournament.setQuestions(new ArrayList<>());
            }
            
            for (Question q : questions) {
                q.setTournament(savedTournament);
                Question savedQ = questionRepository.save(q);
                savedTournament.getQuestions().add(savedQ);
            }
            return "Tournament created successfully with " + questions.size() + " dynamic questions!";
        } catch (Exception e) {
            tournamentRepository.delete(savedTournament);
            throw new BadRequestException("Failed to fetch questions from OpenTDB: " + e.getMessage());
        }
    }

    /**
     * Retrieves all tournaments in the system.
     * @return List of tournament details.
     */
    @Override
    public List<TournamentDto> getAllTournaments() {
        return tournamentRepository.findAll().stream()
                .map(t -> mapToDto(t, null))
                .collect(Collectors.toList());
    }

    /**
     * Updates an existing tournament's basic info.
     * @param id Tournament ID.
     * @param request Updated details.
     * @return Success message.
     */
    /**
     * Updates a tournament's dates ONLY.
     * Name, category, difficulty and questions are immutable after creation
     * — so every player in the class gets the same consistent tournament content.
     */
    @Override
    public String updateTournament(Long id, TournamentRequest request) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));

        if (request.getStartDate() != null) {
            tournament.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            LocalDateTime effectiveStart = request.getStartDate() != null ? request.getStartDate() : tournament.getStartDate();
            if (effectiveStart.isAfter(request.getEndDate())) {
                throw new BadRequestException("End date cannot be before start date");
            }
            tournament.setEndDate(request.getEndDate());
        }

        tournamentRepository.save(tournament);
        return "Tournament dates updated successfully";
    }

    /**
     * Deletes a tournament by its ID.
     * @param id Tournament ID.
     */
    @Override
    public void deleteTournament(Long id) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
        
        // Audit log before deletion
        AdminAuditLog log = new AdminAuditLog();
        log.setAdminUsername("admin"); // In a real app we'd get this from SecurityContext
        log.setAction("DELETE_TOURNAMENT");
        log.setDetails("Deleted tournament: " + tournament.getName() + " (ID: " + id + ")");
        log.setTimestamp(java.time.LocalDateTime.now());
        auditLogRepository.save(log);

        tournamentRepository.delete(tournament);
    }

    /**
     * Generates a scoreboard for a specific tournament.
     * @param id Tournament ID.
     * @return Detailed stats including player names, scores, and dates.
     */
    @Override
    public ScoreBoardResponse getScoreboard(Long id) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));

        List<TournamentScore> scoresEntityList = scoreRepository.findByTournamentOrderByScoreDesc(tournament);
        long likes = tournamentLikeRepository.countByTournament(tournament);

        ScoreBoardResponse response = new ScoreBoardResponse();
        response.setTournamentId(tournament.getId());
        response.setTournamentName(tournament.getName());
        response.setTotalPlayersParticipated(scoresEntityList.size());
        
        double avg = scoresEntityList.stream().mapToInt(TournamentScore::getScore).average().orElse(0.0);
        response.setAverageScore(Math.round(avg * 100.0) / 100.0);
        response.setNumberOfLikes(likes);

        List<ScoreBoardResponse.PlayerScore> playerScores = scoresEntityList.stream()
                .map(s -> new ScoreBoardResponse.PlayerScore(
                        s.getUser().getFirstName() + " " + s.getUser().getLastName(),
                        s.getCompletedDate(),
                        s.getScore()))
                .collect(Collectors.toList());

        response.setScores(playerScores);
        return response;
    }

    @Override
    public List<AdminQuestionDto> getTournamentQuestions(Long id) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
        
        if (tournament.getQuestions() == null) {
            return new ArrayList<>();
        }
        
        return tournament.getQuestions().stream().map(q -> {
            AdminQuestionDto dto = new AdminQuestionDto();
            dto.setId(q.getId());
            dto.setQuestionText(q.getQuestionText());
            dto.setType(q.getType());
            dto.setDifficulty(q.getDifficulty());
            dto.setCorrectAnswer(q.getCorrectAnswer());
            dto.setIncorrectAnswers(q.getIncorrectAnswers());
            return dto;
        }).collect(Collectors.toList());
    }

    /**
     * REFINED TOURNAMENT FILTERING
     * Strategy:
     * - We filter by current System Time (LocalDateTime).
     * - ONGOING: Started but not ended, AND the user hasn't played it yet.
     * - PARTICIPATED: Tournaments where a score entry exists for this User.
     */
    @Override
    public List<TournamentDto> getTournaments(User user, String status) {
        List<Tournament> allTournaments = tournamentRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        List<Tournament> filteredTournaments;

        List<TournamentScore> userScores = scoreRepository.findByUser(user);
        List<Long> participatedIds = userScores.stream()
                .map(ts -> ts.getTournament().getId())
                .collect(Collectors.toList());

        if ("ongoing".equalsIgnoreCase(status)) {
            filteredTournaments = allTournaments.stream()
                    .filter(t -> t.getStartDate().isBefore(now) && t.getEndDate().isAfter(now))
                    .filter(t -> !participatedIds.contains(t.getId()))
                    .collect(Collectors.toList());
        } else if ("upcoming".equalsIgnoreCase(status)) {
            filteredTournaments = allTournaments.stream()
                    .filter(t -> t.getStartDate().isAfter(now))
                    .collect(Collectors.toList());
        } else if ("past".equalsIgnoreCase(status)) {
            filteredTournaments = allTournaments.stream()
                    .filter(t -> t.getEndDate().isBefore(now))
                    .collect(Collectors.toList());
        } else if ("participated".equalsIgnoreCase(status)) {
            filteredTournaments = allTournaments.stream()
                    .filter(t -> participatedIds.contains(t.getId()))
                    .collect(Collectors.toList());
        } else {
            filteredTournaments = allTournaments;
        }

        return filteredTournaments.stream().map(t -> mapToDto(t, user)).collect(Collectors.toList());
    }

    /**
     * Validates if a player can enter a tournament and returns the question list.
     * @param user The player.
     * @param tournamentId The tournament ID.
     * @return List of 10 questions with shuffled options.
     */
    @Override
    public List<QuestionDto> enterTournament(User user, Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));

        LocalDateTime now = LocalDateTime.now();
        if (tournament.getStartDate().isAfter(now) || tournament.getEndDate().isBefore(now)) {
            throw new BadRequestException("This tournament is not currently ongoing");
        }

        if (scoreRepository.existsByUserAndTournament(user, tournament)) {
            throw new BadRequestException("You have already participated in this tournament");
        }

        List<Question> questions = questionRepository.findByTournament(tournament);
        return questions.stream().map(this::mapToQuestionDto).collect(Collectors.toList());
    }

    /**
     * Submits an answer for a specific question and returns immediate feedback.
     * @param tournamentId Tournament ID.
     * @param questionId Question ID.
     * @param request The answer payload.
     * @return Correctness and feedback message.
     */
    @Override
    public AnswerResponse submitAnswer(Long tournamentId, Long questionId, AnswerRequest request) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));

        if (!question.getTournament().getId().equals(tournamentId)) {
            throw new BadRequestException("Question does not belong to this tournament");
        }

        boolean correct = question.getCorrectAnswer().equalsIgnoreCase(request.getAnswer());
        String feedback = correct ? "Correct!" : "Incorrect! The correct answer was: " + question.getCorrectAnswer();

        return new AnswerResponse(correct, question.getCorrectAnswer(), feedback);
    }

    /**
     * Completes a tournament session and saves the user's final score.
     * @param user The player.
     * @param tournamentId Tournament ID.
     * @param score Final score achieved.
     * @return Result message.
     */
    @Override
    public QuizResultResponse completeTournament(User user, Long tournamentId, int score) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));

        if (scoreRepository.existsByUserAndTournament(user, tournament)) {
            throw new BadRequestException("You have already completed this tournament");
        }

        TournamentScore tournamentScore = new TournamentScore();
        tournamentScore.setUser(user);
        tournamentScore.setTournament(tournament);
        tournamentScore.setScore(score);
        tournamentScore.setCompletedDate(LocalDateTime.now());

        scoreRepository.save(tournamentScore);

        double threshold = tournament.getPassingThreshold() != null ? tournament.getPassingThreshold() : 7.0;
        boolean earned = score >= threshold;
        return new QuizResultResponse(
                score,
                10,
                (int) threshold,
                earned,
                LocalDateTime.now().toString()
        );
    }

    @Override
    public String likeTournament(User user, Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));

        if (tournamentLikeRepository.findByUserAndTournament(user, tournament).isPresent()) {
            throw new BadRequestException("You have already liked this tournament");
        }

        TournamentLike like = new TournamentLike();
        like.setUser(user);
        like.setTournament(tournament);
        tournamentLikeRepository.save(like);
        return "Liked tournament";
    }

    @Override
    public String unlikeTournament(User user, Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));

        TournamentLike like = tournamentLikeRepository.findByUserAndTournament(user, tournament)
                .orElseThrow(() -> new BadRequestException("You have not liked this tournament"));

        tournamentLikeRepository.delete(like);
        return "Unliked tournament";
    }

    @Override
    public List<Map<String, Object>> getPlayerHistory(User user) {
        List<TournamentScore> scores = scoreRepository.findByUser(user);
        return scores.stream().map(s -> {
            Map<String, Object> map = new HashMap<>();
            map.put("tournamentName", s.getTournament().getName());
            map.put("score", s.getScore());
            map.put("completedDate", s.getCompletedDate());
            
            // Ad-hoc Player Feature: Accuracy & Performance Feedback
            double accuracy = (s.getScore() / 10.0) * 100.0;
            map.put("accuracyPercentage", accuracy);
            
            double threshold = s.getTournament().getPassingThreshold() != null ? s.getTournament().getPassingThreshold() : 7.0;
            map.put("passed", s.getScore() >= threshold);
            map.put("feedback", s.getScore() >= threshold ? "PRO" : "ROOKIE");
            
            return map;
        }).collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getGlobalLeaderboard() {
        List<TournamentScore> allScores = scoreRepository.findAll();
        Map<User, Integer> userTotalScores = allScores.stream()
                .collect(Collectors.groupingBy(TournamentScore::getUser, Collectors.summingInt(TournamentScore::getScore)));

        return userTotalScores.entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("playerName", e.getKey().getFirstName() + " " + e.getKey().getLastName());
                    map.put("totalScore", e.getValue());
                    map.put("tournamentsPlayed", scoreRepository.findByUser(e.getKey()).size());
                    return map;
                })
                .collect(Collectors.toList());
    }

    @Override
    public int getUserRank(User user) {
        List<TournamentScore> allScores = scoreRepository.findAll();
        Map<User, Integer> userTotalScores = allScores.stream()
                .collect(Collectors.groupingBy(TournamentScore::getUser, Collectors.summingInt(TournamentScore::getScore)));

        List<Map.Entry<User, Integer>> sortedLeaderboard = userTotalScores.entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
                .collect(Collectors.toList());

        for (int i = 0; i < sortedLeaderboard.size(); i++) {
            if (sortedLeaderboard.get(i).getKey().getId().equals(user.getId())) {
                return i + 1;
            }
        }
        return -1; // Not ranked yet
    }

    private TournamentDto mapToDto(Tournament tournament, User user) {
        TournamentDto dto = new TournamentDto();
        dto.setId(tournament.getId());
        dto.setName(tournament.getName());
        dto.setCategory(tournament.getCategory());
        dto.setDifficulty(tournament.getDifficulty());
        dto.setCreator(tournament.getCreator());
        dto.setStartDate(tournament.getStartDate());
        dto.setEndDate(tournament.getEndDate());
        dto.setPassingThreshold(tournament.getPassingThreshold());
        dto.setNumLikes(tournamentLikeRepository.countByTournament(tournament));
        if (user != null) {
            dto.setLiked(tournamentLikeRepository.findByUserAndTournament(user, tournament).isPresent());
            scoreRepository.findByUserAndTournament(user, tournament).ifPresent(s -> dto.setUserScore(s.getScore()));
        }
        return dto;
    }

    private QuestionDto mapToQuestionDto(Question q) {
        QuestionDto dto = new QuestionDto();
        dto.setId(q.getId());
        dto.setQuestionText(q.getQuestionText());
        dto.setType(q.getType());
        dto.setDifficulty(q.getDifficulty());

        List<String> options = new ArrayList<>(q.getIncorrectAnswers());
        options.add(q.getCorrectAnswer());
        Collections.shuffle(options);
        dto.setOptions(options);

        return dto;
    }
}
