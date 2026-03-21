package com.quiztournament.api.repository;

import com.quiztournament.api.model.Tournament;
import com.quiztournament.api.model.TournamentLike;
import com.quiztournament.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TournamentLikeRepository extends JpaRepository<TournamentLike, Long> {
    long countByTournament(Tournament tournament);
    Optional<TournamentLike> findByUserAndTournament(User user, Tournament tournament);
}
