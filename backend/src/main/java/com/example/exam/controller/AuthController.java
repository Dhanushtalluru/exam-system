package com.example.exam.controller;
import com.example.exam.dto.Dtos.*;
import com.example.exam.entity.User;
import com.example.exam.entity.Enums.Role;
import com.example.exam.exception.ApiException;
import com.example.exam.repository.Repos.UserRepo;
import com.example.exam.security.JwtUtil;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor
public class AuthController {
  private final UserRepo users; private final PasswordEncoder enc; private final JwtUtil jwt;
  @PostMapping("/register")
  public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterReq r) {
    String email = r.email().trim().toLowerCase();
    if (users.existsByEmail(email)) throw new ApiException(409, "Email already registered");
    User u = new User(); u.setName(r.name().trim()); u.setEmail(email); u.setPassword(enc.encode(r.password())); u.setRole(Role.USER);
    users.save(u);
    return ResponseEntity.status(HttpStatus.CREATED).body(auth(u));
  }
  @PostMapping("/login")
  public Map<String, Object> login(@Valid @RequestBody LoginReq r) {
    User u = users.findByEmail(r.email().trim().toLowerCase()).filter(x -> enc.matches(r.password(), x.getPassword())).orElseThrow(() -> new ApiException(401, "Invalid email or password"));
    return auth(u);
  }
  private Map<String, Object> auth(User u) { return Map.of("token", jwt.generate(u.getEmail(), u.getRole().name()), "role", u.getRole().name(), "name", u.getName(), "email", u.getEmail()); }
}
