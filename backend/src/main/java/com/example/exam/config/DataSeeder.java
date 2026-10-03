package com.example.exam.config;
import com.example.exam.entity.*;
import com.example.exam.entity.Enums.*;
import com.example.exam.repository.Repos.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
@Component @RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
  private final UserRepo users; private final TestRepo tests; private final PasswordEncoder enc;
  @Override public void run(String... args) {
    if (!users.existsByEmail("admin@exam.com")) users.save(mk("Admin", "admin@exam.com", "Admin@123", Role.ADMIN));
    if (!users.existsByEmail("user@exam.com")) users.save(mk("Sample Student", "user@exam.com", "User@123", Role.USER));
    if (tests.count() == 0) {
      Test t = new Test(); t.setTitle("Java Basics Quiz"); t.setDescription("Fundamentals of Java");
      t.setInstructions("Answer all questions. MCQ and True/False are auto-graded; written answers are graded by the admin.");
      t.setDurationMinutes(10); t.setPassingMarks(5); t.setPublished(true);
      t.getQuestions().add(q(t, QType.MCQ, "Which keyword is used to inherit a class in Java?", 2, List.of("this", "extends", "implements", "super"), "extends"));
      t.getQuestions().add(q(t, QType.TRUE_FALSE, "Java is platform independent.", 1, List.of(), "True"));
      t.getQuestions().add(q(t, QType.SHORT_ANSWER, "What does JVM stand for?", 3, List.of(), null));
      t.getQuestions().add(q(t, QType.DESCRIPTIVE, "Explain the difference between an interface and an abstract class.", 4, List.of(), null));
      t.setMaxMarks(10); tests.save(t);
    }
  }
  private User mk(String n, String e, String p, Role r) { User u = new User(); u.setName(n); u.setEmail(e); u.setPassword(enc.encode(p)); u.setRole(r); return u; }
  private Question q(Test t, QType ty, String text, double marks, List<String> opts, String ans) {
    Question q = new Question(); q.setTest(t); q.setType(ty); q.setText(text); q.setMarks(marks); q.setOptions(new ArrayList<>(opts)); q.setCorrectAnswer(ans); return q;
  }
}
