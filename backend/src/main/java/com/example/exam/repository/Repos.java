package com.example.exam.repository;
import com.example.exam.entity.*;
import com.example.exam.entity.Enums.Role;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public class Repos {
  public interface UserRepo extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email); boolean existsByEmail(String email); List<User> findByRole(Role role);
  }
  public interface TestRepo extends JpaRepository<Test, Long> { List<Test> findByPublishedTrue(); }
  public interface SubmissionRepo extends JpaRepository<Submission, Long> {
    Optional<Submission> findByUserIdAndTestId(Long userId, Long testId);
    List<Submission> findByUserIdOrderByStartedAtDesc(Long userId);
    boolean existsByTestId(Long testId);
  }
}
