# Online Test Management System — Backend (Spring Boot + MySQL + JWT)

## Prerequisites
JDK 17+, Maven 3.9+, MySQL 8+ running on localhost:3306.

## Configuration (.env)
Settings live in `backend/.env` (a copy is in `.env.example`). Spring Boot loads it automatically **when you start the app from inside the `backend/` folder**:
```
DB_URL=jdbc:mysql://localhost:3306/exam_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
DB_USERNAME=root
DB_PASSWORD=root          # <-- change to your MySQL password
JWT_SECRET=...32+ chars   # <-- change in real use
JWT_EXPIRATION_MS=86400000
```
If `.env` is missing, the same defaults are used. You may instead set these as normal OS environment variables.

## Run
1. Make sure MySQL is running and `DB_PASSWORD` in `.env` matches your MySQL root password. The `exam_db` database and all tables are created automatically on first start.
2. `cd backend && mvn spring-boot:run` → API at http://localhost:8080

## Seeded accounts (created on first start)
| Role  | Email            | Password  |
|-------|------------------|-----------|
| ADMIN | admin@exam.com   | Admin@123 |
| USER  | user@exam.com    | User@123  |
A published sample test "Java Basics Quiz" (MCQ, True/False, Short, Descriptive; 10 marks, pass 5) is also seeded.

## Quick end-to-end check (curl)
```bash
U=http://localhost:8080/api
UT=$(curl -s -XPOST $U/auth/login -H 'Content-Type: application/json' -d '{"email":"user@exam.com","password":"User@123"}' | python3 -c 'import sys,json;print(json.load(sys.stdin)["token"])')
AT=$(curl -s -XPOST $U/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@exam.com","password":"Admin@123"}' | python3 -c 'import sys,json;print(json.load(sys.stdin)["token"])')
curl -s -H "Authorization: Bearer $UT" $U/tests                        # list published tests
curl -s -XPOST -H "Authorization: Bearer $UT" $U/tests/1/start         # returns submissionId, endsAt, questions
curl -s -XPOST -H "Authorization: Bearer $UT" -H 'Content-Type: application/json' $U/submissions/1/answers -d '[{"questionId":1,"response":"extends"}]'
curl -s -XPOST -H "Authorization: Bearer $UT" $U/submissions/1/submit
curl -s -H "Authorization: Bearer $AT" $U/admin/submissions?status=PENDING_EVALUATION
curl -s -XPUT -H "Authorization: Bearer $AT" -H 'Content-Type: application/json' $U/admin/submissions/1/evaluate -d '{"answers":[{"answerId":3,"marks":2,"feedback":"Good"}]}'
curl -s -XPOST -H "Authorization: Bearer $AT" $U/admin/results/1/publish
curl -s -H "Authorization: Bearer $UT" $U/user/results
```

## Endpoints
Auth: `POST /api/auth/register|login`
Admin (ADMIN only): `POST/GET /api/admin/tests`, `GET/PUT/DELETE /api/admin/tests/{id}`, `POST /api/admin/tests/{id}/publish?publish=true|false`, `GET /api/admin/users`, `GET /api/admin/submissions[?status=]`, `GET /api/admin/submissions/{id}`, `PUT /api/admin/submissions/{id}/evaluate`, `POST /api/admin/results/{submissionId}/publish`
User (USER only): `GET /api/tests`, `GET /api/tests/{id}`, `POST /api/tests/{id}/start`, `POST /api/submissions/{id}/answers`, `POST /api/submissions/{id}/submit`, `GET /api/user/submissions`, `GET /api/user/results[/{id}]`

## Behaviour notes
- Total marks are computed from question marks. Tests with submissions cannot be edited/deleted (unpublish instead).
- Deadline is enforced server-side (start time + duration, 10 s grace); expired attempts are auto-submitted and graded when next touched.
- One attempt per user per test (DB unique constraint + service check). Scores are hidden from users until the admin publishes the result.
