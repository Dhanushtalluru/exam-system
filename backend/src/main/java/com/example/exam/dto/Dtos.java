package com.example.exam.dto;
import com.example.exam.entity.Enums.QType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;
public class Dtos {
  public record RegisterReq(@NotBlank String name, @NotBlank @Email String email, @NotBlank @Size(min = 6) String password) {}
  public record LoginReq(@NotBlank String email, @NotBlank String password) {}
  public record QReq(@NotNull QType type, @NotBlank String text, @NotNull @Positive Double marks, List<String> options, String correctAnswer) {}
  public record TestReq(@NotBlank String title, String description, String instructions, @NotNull @Min(1) Integer durationMinutes,
                        @NotNull @PositiveOrZero Double passingMarks, @NotEmpty @Valid List<QReq> questions) {}
  public record AnswerReq(@NotNull Long questionId, String response) {}
  public record EvalItem(@NotNull Long answerId, @NotNull @PositiveOrZero Double marks, String feedback) {}
  public record EvalReq(@NotEmpty @Valid List<EvalItem> answers) {}
}
