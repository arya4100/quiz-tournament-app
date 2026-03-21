# Quiz Tournament REST API

## 📋 Overview
A robust Spring Boot REST API for a Quiz Tournament application designed for the **Intermediate Application Development Concepts** course. The system allows Administrators to manage tournaments with dynamic questions from OpenTDB and enables Players to participate, track scores, and interact with a global community.

---

## 🏗️ Architecture & Design Patterns
The project follows a **Layered Architecture** to ensure high quality and modularity, adhering to the "Separation of Concerns" principle:

- **Controller Layer**: Handles HTTP requests and delegates logic to services.
- **Service Layer**: Contains business logic (Tournament management, scoring, OpenTDB integration).
- **Repository Layer**: Manages data persistence using Spring Data JPA.
- **DTO Layer**: Manages data transfer between client and server, abstracting the internal data models.
- **Security Layer**: Implements **JWT (JSON Web Tokens)** for stateless, secure authentication.
- **Exception Layer**: Global centralized error handling for consistent API responses.

---

## 🛠️ Technology Stack
- **Java 17** (LTS)
- **Spring Boot 3.2.x** (Web, Data JPA, Security, Validation)
- **HSQLDB** (Persistent file-based database)
- **OpenTDB API** (Dynamic question sourcing)
- **Maven** (Dependency & Build management)
- **JWT (io.jsonwebtoken)** (Security & Role-based access control)
- **OpenAPI / Swagger UI** (Interactive API documentation)

---

## 🚀 Getting Started

### Prerequisites
- JDK 17
- Maven 3.6+

### Run Locally
1. Clone the repository and navigate to the root folder.
2. Build the project:
   ```bash
   mvn clean install
   ```
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```
4. The API will be available at `http://localhost:8080`.

### API Documentation
Access the interactive Swagger UI to test endpoints:
`http://localhost:8080/swagger-ui/index.html`

---

## 🔑 Authentication & Roles

### Default Admin Credentials
- **Username**: `admin`
- **Password**: `op@1234`

### Roles
- `ROLE_ADMIN`: Create/Update/Delete tournaments, view user statistics, manage tournament scoreboard.
- `ROLE_PLAYER`: Participate in ongoing tournaments, view history, global leaderboard, and like/unlike tournaments.

---

## 📌 Features Implemented

### Shared Features
- **Secure Login/Logout**: Stateless authentication using JWT.
- **Centralized Validation**: Graceful handling of incorrect inputs (e.g., blank fields, invalid dates).
- **Profile Management**: Update username, email, first name, last name, phone, address, and bio.

### Admin Features
- **Dynamic Tournament Creation**: Fetches 10 questions automatically from OpenTDB based on category/difficulty.
- **CRUD Operations**: Full management of quiz tournaments (End-to-end management).
- **Advanced Dashboard**: View all registered users and global application statistics.
- **Scoreboard Management**: View detailed performance stats for specific tournaments.

### Player Features
- **Tournament Status Filtering**: View ongoing, upcoming, past, and participated tournaments.
- **Real-time Feedback**: Immediate results for correct/incorrect answers during the quiz.
- **Social Features**: Like and unlike tournaments.
- **Personal History**: Track past performance and scores.
- **Global Leaderboard**: Compete for the top spot based on cumulative scores.

---

## 🛡️ Best Practices Applied
- **Thin Controllers**: Logic resides purely in the Service layer.
- **Transactional Support**: Ensures data integrity during database operations.
- **Global Error Handling**: Managed by `GlobalExceptionHandler` returning consistent JSON.
- **Statelessness**: RESTful principles adhered to for scalability.

---

## 📝 Authors
**Arya**
Developed as part of the Studio 4 Assessment.
