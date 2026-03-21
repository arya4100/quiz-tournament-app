package com.quiztournament.api.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "questions")
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;
    
    @Column(length = 2000)
    private String questionText;
    
    @Column(name = "question_type")
    private String type;
    
    @Column(name = "question_difficulty")
    private String difficulty;
    
    @Column(length = 2000)
    private String correctAnswer;
    
    @ElementCollection
    private List<String> incorrectAnswers;
}
