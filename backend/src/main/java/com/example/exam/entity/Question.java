package com.example.exam.entity;
import com.example.exam.entity.Enums.QType;
import jakarta.persistence.*;
import java.util.*;
import lombok.*;
@Entity @Table(name = "questions") @Getter @Setter @NoArgsConstructor
public class Question {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @ManyToOne(fetch = FetchType.LAZY, optional = false) private Test test;
  @Enumerated(EnumType.STRING) private QType type;
  @Column(name = "question_text", length = 2000) private String text;
  private double marks;
  @ElementCollection(fetch = FetchType.EAGER) @CollectionTable(name = "options", joinColumns = @JoinColumn(name = "question_id"))
  @Column(name = "option_value") @OrderColumn(name = "position") private List<String> options = new ArrayList<>();
  private String correctAnswer;
}
