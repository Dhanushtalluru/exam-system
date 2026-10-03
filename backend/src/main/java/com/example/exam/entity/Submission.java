package com.example.exam.entity;
import com.example.exam.entity.Enums.Status;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.*;
import lombok.*;
@Entity @Table(name = "submissions", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "test_id"}))
@Getter @Setter @NoArgsConstructor
public class Submission {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @ManyToOne(fetch = FetchType.LAZY, optional = false) private User user;
  @ManyToOne(fetch = FetchType.LAZY, optional = false) private Test test;
  private Instant startedAt;
  private Instant submittedAt;
  @Enumerated(EnumType.STRING) private Status status;
  private double autoScore;
  private double totalScore;
  private boolean resultPublished;
  @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Answer> answers = new ArrayList<>();
}
