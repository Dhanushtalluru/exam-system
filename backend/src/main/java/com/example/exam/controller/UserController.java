package com.example.exam.controller;
import com.example.exam.dto.Dtos.AnswerReq;
import com.example.exam.service.ExamService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api") @RequiredArgsConstructor
public class UserController {
  private final ExamService svc;
  @GetMapping("/tests") public List<Map<String, Object>> tests(Principal p) { return svc.userTests(p.getName()); }
  @GetMapping("/tests/{id}") public Map<String, Object> test(Principal p, @PathVariable Long id) { return svc.userTest(p.getName(), id); }
  @PostMapping("/tests/{id}/start") public ResponseEntity<Map<String, Object>> start(Principal p, @PathVariable Long id) { return ResponseEntity.status(HttpStatus.CREATED).body(svc.start(p.getName(), id)); }
  @PostMapping("/submissions/{id}/answers") public ResponseEntity<Void> answers(Principal p, @PathVariable Long id, @RequestBody List<@Valid AnswerReq> a) { svc.saveAnswers(p.getName(), id, a); return ResponseEntity.noContent().build(); }
  @PostMapping("/submissions/{id}/submit") public Map<String, Object> submit(Principal p, @PathVariable Long id) { return svc.submit(p.getName(), id); }
  @GetMapping("/user/submissions") public List<Map<String, Object>> submissions(Principal p) { return svc.userSubmissions(p.getName()); }
  @GetMapping("/user/results") public List<Map<String, Object>> results(Principal p) { return svc.userResults(p.getName()); }
  @GetMapping("/user/results/{id}") public Map<String, Object> result(Principal p, @PathVariable Long id) { return svc.userResult(p.getName(), id); }
}
