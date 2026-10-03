package com.example.exam.entity;
import jakarta.persistence.*;
import lombok.*;
@Entity @Table(name = "answers") @Getter @Setter @NoArgsConstructor
public class Answer {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @ManyToOne(fetch = FetchType.LAZY, optional = false) private Submission submission;
  @ManyToOne(fetch = FetchType.LAZY, optional = false) private Question question;
  @Column(name = "response_text", columnDefinition = "TEXT") private String response;
  private Double marks;
  @Column(length = 2000) private String feedback;
}
