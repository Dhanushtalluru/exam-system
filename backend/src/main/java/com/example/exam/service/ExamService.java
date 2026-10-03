package com.example.exam.service;
import com.example.exam.dto.Dtos.*;
import com.example.exam.entity.*;
import com.example.exam.entity.Enums.*;
import com.example.exam.exception.ApiException;
import com.example.exam.repository.Repos.*;
import java.time.Instant;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor @Transactional
public class ExamService {
  private final UserRepo users; private final TestRepo tests; private final SubmissionRepo subs;
  private static final long GRACE_SECONDS = 10;

  static Map<String, Object> m(Object... kv) { Map<String, Object> r = new LinkedHashMap<>(); for (int i = 0; i < kv.length; i += 2) r.put((String) kv[i], kv[i + 1]); return r; }
  static boolean manual(Question q) { return q.getType() == QType.SHORT_ANSWER || q.getType() == QType.DESCRIPTIVE; }
  User cur(String email) { return users.findByEmail(email).orElseThrow(() -> new ApiException(401, "Unknown user")); }

  // ---------- mappers ----------
  Map<String, Object> qm(Question q, boolean admin) {
    Map<String, Object> r = m("id", q.getId(), "type", q.getType(), "text", q.getText(), "marks", q.getMarks(), "options", new ArrayList<>(q.getOptions()));
    if (admin) r.put("correctAnswer", q.getCorrectAnswer());
    return r;
  }
  Map<String, Object> tsum(Test t) {
    return m("id", t.getId(), "title", t.getTitle(), "description", t.getDescription(), "instructions", t.getInstructions(), "durationMinutes", t.getDurationMinutes(),
        "maxMarks", t.getMaxMarks(), "passingMarks", t.getPassingMarks(), "published", t.isPublished(), "questionCount", t.getQuestions().size());
  }
  Map<String, Object> ssum(Submission s) {
    Test t = s.getTest(); User u = s.getUser();
    return m("id", s.getId(), "testId", t.getId(), "testTitle", t.getTitle(), "userId", u.getId(), "userName", u.getName(), "userEmail", u.getEmail(), "status", s.getStatus(),
        "startedAt", s.getStartedAt(), "submittedAt", s.getSubmittedAt(), "autoScore", s.getAutoScore(), "totalScore", s.getTotalScore(),
        "maxMarks", t.getMaxMarks(), "passingMarks", t.getPassingMarks(), "resultPublished", s.isResultPublished());
  }
  Map<String, Object> usum(Submission s) {
    Map<String, Object> r = ssum(s);
    if (!s.isResultPublished()) { r.put("autoScore", null); r.put("totalScore", null); r.put("passed", null); }
    else r.put("passed", s.getTotalScore() >= s.getTest().getPassingMarks());
    return r;
  }
  Map<String, Object> sdetail(Submission s, boolean admin) {
    Map<String, Object> r = admin ? ssum(s) : usum(s);
    r.put("answers", s.getAnswers().stream().sorted(Comparator.comparing((Answer a) -> a.getQuestion().getId()))
        .map(a -> m("answerId", a.getId(), "question", qm(a.getQuestion(), admin), "response", a.getResponse(), "marks", a.getMarks(), "feedback", a.getFeedback())).toList());
    return r;
  }

  // ---------- admin: tests ----------
  public Map<String, Object> createTest(TestReq r) { Test t = new Test(); fill(t, r); return tfull(tests.save(t)); }
  public Map<String, Object> updateTest(Long id, TestReq r) {
    Test t = tests.findById(id).orElseThrow(() -> new ApiException(404, "Test not found"));
    if (subs.existsByTestId(id)) throw new ApiException(409, "Test already has submissions and cannot be edited");
    fill(t, r); return tfull(t);
  }
  Map<String, Object> tfull(Test t) { Map<String, Object> r = tsum(t); r.put("questions", t.getQuestions().stream().map(q -> qm(q, true)).toList()); return r; }
  void fill(Test t, TestReq r) {
    t.setTitle(r.title()); t.setDescription(r.description()); t.setInstructions(r.instructions()); t.setDurationMinutes(r.durationMinutes()); t.setPassingMarks(r.passingMarks());
    t.getQuestions().clear(); double sum = 0;
    for (QReq x : r.questions()) {
      Question q = new Question(); q.setTest(t); q.setType(x.type()); q.setText(x.text()); q.setMarks(x.marks());
      if (x.type() == QType.MCQ) {
        List<String> o = x.options() == null ? List.of() : x.options().stream().map(String::trim).filter(s -> !s.isEmpty()).toList();
        if (o.size() < 2) throw new ApiException(400, "MCQ needs at least 2 options");
        if (x.correctAnswer() == null || !o.contains(x.correctAnswer().trim())) throw new ApiException(400, "MCQ correct answer must be one of the options");
        q.setOptions(new ArrayList<>(o)); q.setCorrectAnswer(x.correctAnswer().trim());
      } else if (x.type() == QType.TRUE_FALSE) {
        String c = x.correctAnswer() == null ? "" : x.correctAnswer().trim();
        if (!c.equalsIgnoreCase("true") && !c.equalsIgnoreCase("false")) throw new ApiException(400, "True/False correct answer must be True or False");
        q.setOptions(new ArrayList<>(List.of("True", "False"))); q.setCorrectAnswer(c.equalsIgnoreCase("true") ? "True" : "False");
      }
      t.getQuestions().add(q); sum += x.marks();
    }
    if (r.passingMarks() > sum) throw new ApiException(400, "Passing marks cannot exceed total marks (" + sum + ")");
    t.setMaxMarks(sum);
  }
  public List<Map<String, Object>> adminTests() { return tests.findAll().stream().map(this::tsum).toList(); }
  public Map<String, Object> adminTest(Long id) { return tfull(tests.findById(id).orElseThrow(() -> new ApiException(404, "Test not found"))); }
  public void deleteTest(Long id) {
    if (!tests.existsById(id)) throw new ApiException(404, "Test not found");
    if (subs.existsByTestId(id)) throw new ApiException(409, "Test has submissions and cannot be deleted; unpublish it instead");
    tests.deleteById(id);
  }
  public Map<String, Object> publish(Long id, boolean publish) {
    Test t = tests.findById(id).orElseThrow(() -> new ApiException(404, "Test not found"));
    if (publish && t.getQuestions().isEmpty()) throw new ApiException(400, "Cannot publish a test without questions");
    t.setPublished(publish); return tsum(t);
  }
  public List<Map<String, Object>> students() { return users.findByRole(Role.USER).stream().map(u -> m("id", u.getId(), "name", u.getName(), "email", u.getEmail())).toList(); }

  // ---------- admin: submissions ----------
  public List<Map<String, Object>> adminSubmissions(String status) {
    return subs.findAll().stream().filter(s -> status == null || s.getStatus().name().equalsIgnoreCase(status))
        .sorted(Comparator.comparing(Submission::getStartedAt).reversed()).map(this::ssum).toList();
  }
  Submission sub(Long id) { return subs.findById(id).orElseThrow(() -> new ApiException(404, "Submission not found")); }
  public Map<String, Object> adminSubmission(Long id) { return sdetail(sub(id), true); }
  public Map<String, Object> evaluate(Long id, EvalReq r) {
    Submission s = sub(id);
    if (s.getStatus() == Status.IN_PROGRESS) throw new ApiException(409, "Submission is still in progress");
    if (s.isResultPublished()) throw new ApiException(409, "Result already published");
    for (EvalItem i : r.answers()) {
      Answer a = s.getAnswers().stream().filter(x -> x.getId().equals(i.answerId())).findFirst().orElseThrow(() -> new ApiException(400, "Answer " + i.answerId() + " not in this submission"));
      if (!manual(a.getQuestion())) throw new ApiException(400, "Question " + a.getQuestion().getId() + " is auto-evaluated");
      if (i.marks() > a.getQuestion().getMarks()) throw new ApiException(400, "Marks exceed the maximum (" + a.getQuestion().getMarks() + ") for question " + a.getQuestion().getId());
      a.setMarks(i.marks()); a.setFeedback(i.feedback());
    }
    recompute(s); return sdetail(s, true);
  }
  void recompute(Submission s) {
    s.setTotalScore(s.getAnswers().stream().mapToDouble(a -> a.getMarks() == null ? 0 : a.getMarks()).sum());
    boolean pending = s.getAnswers().stream().anyMatch(a -> manual(a.getQuestion()) && a.getMarks() == null);
    s.setStatus(pending ? Status.PENDING_EVALUATION : Status.EVALUATED);
  }
  public Map<String, Object> publishResult(Long id) {
    Submission s = sub(id);
    if (s.getStatus() != Status.EVALUATED) throw new ApiException(409, "Evaluate all answers before publishing the result");
    s.setResultPublished(true); return ssum(s);
  }

  // ---------- user: tests & attempts ----------
  public List<Map<String, Object>> userTests(String email) {
    User u = cur(email);
    return tests.findByPublishedTrue().stream().map(t -> { var r = tsum(t); r.put("attemptStatus", subs.findByUserIdAndTestId(u.getId(), t.getId()).map(s -> { expire(s); return s.getStatus(); }).orElse(null)); return r; }).toList();
  }
  public Map<String, Object> userTest(String email, Long id) {
    Test t = tests.findById(id).filter(Test::isPublished).orElseThrow(() -> new ApiException(404, "Test not found"));
    var r = tsum(t); r.put("attemptStatus", subs.findByUserIdAndTestId(cur(email).getId(), id).map(Submission::getStatus).orElse(null)); return r;
  }
  public Map<String, Object> start(String email, Long testId) {
    User u = cur(email);
    Test t = tests.findById(testId).filter(Test::isPublished).orElseThrow(() -> new ApiException(404, "Test not found"));
    Submission s = subs.findByUserIdAndTestId(u.getId(), testId).orElse(null);
    if (s == null) { s = new Submission(); s.setUser(u); s.setTest(t); s.setStartedAt(Instant.now()); s.setStatus(Status.IN_PROGRESS); subs.save(s); }
    else { expire(s); if (s.getStatus() != Status.IN_PROGRESS) throw new ApiException(409, "You have already attempted this test"); }
    return attempt(s);
  }
  Map<String, Object> attempt(Submission s) {
    Map<String, String> saved = new HashMap<>();
    s.getAnswers().forEach(a -> saved.put(String.valueOf(a.getQuestion().getId()), a.getResponse()));
    return m("submissionId", s.getId(), "endsAt", deadline(s), "serverTime", Instant.now(), "test", tsum(s.getTest()),
        "questions", s.getTest().getQuestions().stream().map(q -> qm(q, false)).toList(), "savedAnswers", saved);
  }
  Instant deadline(Submission s) { return s.getStartedAt().plusSeconds(s.getTest().getDurationMinutes() * 60L); }
  Submission owned(String email, Long id) {
    Submission s = sub(id);
    if (!s.getUser().getEmail().equals(email)) throw new ApiException(404, "Submission not found");
    return s;
  }
  /** Server-side expiry: auto-submits once the deadline (+ small grace) has passed. */
  void expire(Submission s) {
    if (s.getStatus() == Status.IN_PROGRESS && Instant.now().isAfter(deadline(s).plusSeconds(GRACE_SECONDS))) finalizeSub(s, deadline(s));
  }
  public void saveAnswers(String email, Long id, List<AnswerReq> reqs) {
    Submission s = owned(email, id); expire(s);
    if (s.getStatus() != Status.IN_PROGRESS) throw new ApiException(409, "Test time is over or already submitted");
    for (AnswerReq r : reqs) {
      Question q = s.getTest().getQuestions().stream().filter(x -> x.getId().equals(r.questionId())).findFirst().orElseThrow(() -> new ApiException(400, "Invalid question " + r.questionId()));
      Answer a = s.getAnswers().stream().filter(x -> x.getQuestion().getId().equals(q.getId())).findFirst().orElse(null);
      if (a == null) { a = new Answer(); a.setSubmission(s); a.setQuestion(q); s.getAnswers().add(a); }
      a.setResponse(r.response());
    }
  }
  public Map<String, Object> submit(String email, Long id) {
    Submission s = owned(email, id); expire(s);
    if (s.getStatus() != Status.IN_PROGRESS) throw new ApiException(409, "Test already submitted");
    Instant now = Instant.now(), dl = deadline(s);
    finalizeSub(s, now.isAfter(dl) ? dl : now);
    return m("submissionId", s.getId(), "status", s.getStatus(), "submittedAt", s.getSubmittedAt(), "message", "Test submitted successfully");
  }
  void finalizeSub(Submission s, Instant at) {
    double auto = 0; boolean hasManual = false;
    for (Question q : s.getTest().getQuestions()) {
      Answer a = s.getAnswers().stream().filter(x -> x.getQuestion().getId().equals(q.getId())).findFirst().orElse(null);
      if (a == null) { a = new Answer(); a.setSubmission(s); a.setQuestion(q); s.getAnswers().add(a); }
      if (manual(q)) { hasManual = true; a.setMarks(null); }
      else {
        boolean ok = a.getResponse() != null && q.getCorrectAnswer() != null && a.getResponse().trim().equalsIgnoreCase(q.getCorrectAnswer().trim());
        a.setMarks(ok ? q.getMarks() : 0.0); auto += a.getMarks();
      }
    }
    s.setAutoScore(auto); s.setTotalScore(auto); s.setSubmittedAt(at);
    s.setStatus(hasManual ? Status.PENDING_EVALUATION : Status.EVALUATED);
  }
  public List<Map<String, Object>> userSubmissions(String email) { return subs.findByUserIdOrderByStartedAtDesc(cur(email).getId()).stream().peek(this::expire).map(this::usum).toList(); }
  public List<Map<String, Object>> userResults(String email) { return subs.findByUserIdOrderByStartedAtDesc(cur(email).getId()).stream().filter(Submission::isResultPublished).map(this::usum).toList(); }
  public Map<String, Object> userResult(String email, Long id) {
    Submission s = owned(email, id);
    if (!s.isResultPublished()) throw new ApiException(403, "Result not published yet");
    return sdetail(s, false);
  }
}
