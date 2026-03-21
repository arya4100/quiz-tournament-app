package com.quiztournament.api.repository;

import com.quiztournament.api.model.Tournament;
import com.quiztournament.api.model.TournamentScore;
import com.quiztournament.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TournamentScoreRepository extends JpaRepository<TournamentScore, Long> {
    List<TournamentScore> findByTournamentOrderByScoreDesc(Tournament tournament);
    boolean existsByUserAndTournament(User user, Tournament tournament);
    Optional<TournamentScore> findByUserAndTournament(User user, Tournament tournament);
    List<TournamentScore> findByUser(User user);
}
