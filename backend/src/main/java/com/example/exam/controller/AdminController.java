package com.example.exam.controller;
import com.example.exam.dto.Dtos.*;
import com.example.exam.service.ExamService;
import jakarta.validation.Valid;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/admin") @RequiredArgsConstructor
public class AdminController {
  private final ExamService svc;
  @PostMapping("/tests") public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody TestReq r) { return ResponseEntity.status(HttpStatus.CREATED).body(svc.createTest(r)); }
  @GetMapping("/tests") public List<Map<String, Object>> tests() { return svc.adminTests(); }
  @GetMapping("/tests/{id}") public Map<String, Object> test(@PathVariable Long id) { return svc.adminTest(id); }
  @PutMapping("/tests/{id}") public Map<String, Object> update(@PathVariable Long id, @Valid @RequestBody TestReq r) { return svc.updateTest(id, r); }
  @DeleteMapping("/tests/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) { svc.deleteTest(id); return ResponseEntity.noContent().build(); }
  @PostMapping("/tests/{id}/publish") public Map<String, Object> publish(@PathVariable Long id, @RequestParam(defaultValue = "true") boolean publish) { return svc.publish(id, publish); }
  @GetMapping("/users") public List<Map<String, Object>> users() { return svc.students(); }
  @GetMapping("/submissions") public List<Map<String, Object>> submissions(@RequestParam(required = false) String status) { return svc.adminSubmissions(status); }
  @GetMapping("/submissions/{id}") public Map<String, Object> submission(@PathVariable Long id) { return svc.adminSubmission(id); }
  @PutMapping("/submissions/{id}/evaluate") public Map<String, Object> evaluate(@PathVariable Long id, @Valid @RequestBody EvalReq r) { return svc.evaluate(id, r); }
  @PostMapping("/results/{submissionId}/publish") public Map<String, Object> publishResult(@PathVariable Long submissionId) { return svc.publishResult(submissionId); }
}
