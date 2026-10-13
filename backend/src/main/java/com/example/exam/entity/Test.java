package com.example.exam.entity;
import jakarta.persistence.*;
import java.util.*;
import lombok.*;
@Entity @Table(name = "tests") @Getter @Setter @NoArgsConstructor
public class Test {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @Column(nullable = false) private String title;
  @Column(length = 2000) private String description;
  @Column(length = 4000) private String instructions;
  private int durationMinutes;
  private double maxMarks;
  private double passingMarks;
  private boolean published;
  private boolean restricted;
  @ManyToMany @JoinTable(name = "test_allowed_users", joinColumns = @JoinColumn(name = "test_id"), inverseJoinColumns = @JoinColumn(name = "user_id"))
  private Set<User> allowedUsers = new HashSet<>();
  @OneToMany(mappedBy = "test", cascade = CascadeType.ALL, orphanRemoval = true) @OrderBy("id")
  private List<Question> questions = new ArrayList<>();
}