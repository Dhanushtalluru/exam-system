# Online Test Management System
## Prerequisites
JDK 17+, Maven 3.9+, Node 18+, MySQL 8+ (running).

## 1. Backend (terminal 1)
```bash
cd backend
# edit .env -> set DB_PASSWORD to your MySQL root password
mvn spring-boot:run          # http://localhost:8080 (tables + sample data auto-created)
```
## 2. Frontend (terminal 2)
```bash
cd frontend
npm install
npm run dev                  # http://localhost:5173
```
## 3. Login
Admin: admin@exam.com / Admin@123 — Student: user@exam.com / User@123
API testing: see Exam_API_Postman_Testing_Guide.pdf
