-- Online Test Management System: MySQL 8 setup
-- Run once:  mysql -u root -p < database/schema.sql
-- The backend (spring.jpa.hibernate.ddl-auto=update) can also create these tables itself.
CREATE DATABASE IF NOT EXISTS exam_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE exam_db;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20)
);
CREATE TABLE IF NOT EXISTS tests (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(2000),
  instructions VARCHAR(4000),
  duration_minutes INT NOT NULL,
  max_marks DOUBLE NOT NULL,
  passing_marks DOUBLE NOT NULL,
  published BIT NOT NULL DEFAULT 0,
  restricted BIT NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS test_allowed_users (
  test_id BIGINT NOT NULL, user_id BIGINT NOT NULL,
  PRIMARY KEY (test_id, user_id),
  FOREIGN KEY (test_id) REFERENCES tests(id), FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS questions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  test_id BIGINT NOT NULL,
  type VARCHAR(30),
  question_text VARCHAR(2000),
  marks DOUBLE NOT NULL,
  correct_answer VARCHAR(2000),
  description VARCHAR(2000),
  topic VARCHAR(100),
  section VARCHAR(100),
  audio_data LONGTEXT,
  play_limit INT,
  image_data LONGTEXT,
  FOREIGN KEY (test_id) REFERENCES tests(id)
);
CREATE TABLE IF NOT EXISTS options (
  question_id BIGINT NOT NULL, position INT NOT NULL, option_value VARCHAR(255),
  PRIMARY KEY (question_id, position), FOREIGN KEY (question_id) REFERENCES questions(id)
);
CREATE TABLE IF NOT EXISTS submissions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL, test_id BIGINT NOT NULL,
  started_at DATETIME(6), submitted_at DATETIME(6),
  status VARCHAR(30),
  auto_score DOUBLE NOT NULL DEFAULT 0, total_score DOUBLE NOT NULL DEFAULT 0,
  result_published BIT NOT NULL DEFAULT 0,
  UNIQUE KEY uq_user_test (user_id, test_id),
  FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (test_id) REFERENCES tests(id)
);
CREATE TABLE IF NOT EXISTS answers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  submission_id BIGINT NOT NULL, question_id BIGINT NOT NULL,
  response_text TEXT, marks DOUBLE NULL, feedback VARCHAR(2000), image_data LONGTEXT,
  FOREIGN KEY (submission_id) REFERENCES submissions(id), FOREIGN KEY (question_id) REFERENCES questions(id)
);

-- Sample accounts: admin@exam.com / Admin@123   user@exam.com / User@123
INSERT INTO users (name, email, password, role)
SELECT 'Admin', 'admin@exam.com', '$2b$10$xs0DiGemPswtW6x/xcoI7.9BQclmZOtdS53FL2t8l1TfPBLkRaY1u', 'ADMIN' WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@exam.com');
INSERT INTO users (name, email, password, role)
SELECT 'Sample Student', 'user@exam.com', '$2b$10$BstVrh0lsNRE0uKh4/kgPed7gqVr5HUhlA.p1TS9dkgVgJvdvKSjm', 'USER' WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'user@exam.com');

-- Sample published test (only when the database has no tests yet)
INSERT INTO tests (id, title, description, instructions, duration_minutes, max_marks, passing_marks, published, restricted)
SELECT 1, 'Java Basics Quiz', 'Fundamentals of Java',
       'Answer all questions. Multiple choice and True/False are marked automatically; written answers are marked by the admin.', 10, 10, 5, 1, 0
WHERE NOT EXISTS (SELECT 1 FROM tests);
INSERT INTO questions (id, test_id, type, question_text, marks, correct_answer, topic)
SELECT * FROM (
  SELECT 1 AS id, 1 AS test_id, 'MCQ' AS type, 'Which keyword is used to inherit a class in Java?' AS question_text, 2 AS marks, 'extends' AS correct_answer, 'Object oriented programming' AS topic
  UNION ALL SELECT 2, 1, 'TRUE_FALSE', 'Java is platform independent.', 1, 'True', 'Java fundamentals'
  UNION ALL SELECT 3, 1, 'SHORT_ANSWER', 'What does JVM stand for?', 3, NULL, 'Java fundamentals'
  UNION ALL SELECT 4, 1, 'DESCRIPTIVE', 'Explain the difference between an interface and an abstract class.', 4, NULL, 'Object oriented programming'
) q WHERE EXISTS (SELECT 1 FROM tests WHERE id = 1) AND NOT EXISTS (SELECT 1 FROM questions);
INSERT INTO options (question_id, position, option_value)
SELECT * FROM (
  SELECT 1 AS question_id, 0 AS position, 'this' AS option_value UNION ALL SELECT 1, 1, 'extends' UNION ALL SELECT 1, 2, 'implements' UNION ALL SELECT 1, 3, 'super'
  UNION ALL SELECT 2, 0, 'True' UNION ALL SELECT 2, 1, 'False'
) o WHERE NOT EXISTS (SELECT 1 FROM options);