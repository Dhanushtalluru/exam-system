package com.example.exam;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
@SpringBootApplication
@EnableJpaRepositories(considerNestedRepositories = true)
public class ExamApplication { public static void main(String[] a) { SpringApplication.run(ExamApplication.class, a); } }
