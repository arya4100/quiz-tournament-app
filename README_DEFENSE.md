# 🎓 Quiz Tournament Project - Defense Guide

This project is a **Decoupled Full-Stack Application** built with **Spring Boot (Backend)** and **React (Frontend)**. Below are key points for your code defense.

## 🏗️ 1. Core Architecture (The "Big Picture")
*   **Decoupled Design**: The frontend and backend are completely separate. They communicate only via a **REST API**. This allows you to swap the frontend (e.g., build a Mobile App) without changing the backend logic.
*   **Backend**: Spring Boot, Java 17, Maven.
*   **Frontend**: React, TypeScript, Vite, Tailwind CSS.

## 📄 Why are files named `.tsx` (and not `.html`)?
*   **The React Rule**: React is a modern JavaScript framework. It doesn't use standard HTML files for its pages.
*   **Smart Fragments**: `.tsx` files are "Smart HTML". They allow us to write HTML tags (like `<div>` and `<button>`) directly inside our JavaScript logic.
*   **Pre-Processing**: When the app runs, the computer automatically translates these `.tsx` files into the standard HTML that browsers understand.
*   **Requirement**: Using `.tsx` proves you are using a professional framework (React) as required by the Part 2 brief.

## 💾 2. Data Persistence (Database)
*   **MySQL**: Used for persistent storage of Users, Tournaments, and Scores.
*   **HSQLDB**: Included as a secondary option (check `application.properties`). It also powers the **Integration Tests** in-memory so they run without needing a real SQL server.
*   **JPA/Hibernate**: We use JPA repositories. This means we write almost no SQL; Hibernate handles the table creation and updates automatically.

## 🌐 3. Third-Party Integration (OpenTDB)
*   Located in: `OpenTdbService.java`.
*   When an Admin creates a tournament, the system automatically fetches 10 multiple-choice questions from the **OpenTDB REST API**.
*   **Decoupling Logic**: If OpenTDB is down, the system is designed to catch the error and prevent the tournament from being saved in a broken state.

## 🛡️ 4. Security & Robustness
*   **JWT Authentication**: We use "Stateless" authentication. Once a user logs in, the backend gives them a "Token". The frontend stores this in `localStorage` and sends it back in the header of every request.
*   **Global Exception Handling**: Any error in the system (like an incorrect password or missing tournament) is caught by `GlobalExceptionHandler`. It converts Java errors into a clean JSON message for the frontend.
*   **Validation**: Every form (Signup, Create Tournament) has backend-side validation (`@Valid` in controllers) to ensure data integrity.

## 🧪 5. Testing Strategy
*   **Integration Test**: Check `TournamentIntegrationTest.java`. It tests the entire lifecycle of a tournament (Create -> List -> Update -> Delete) to ensure no regressions occur when updating code.

## 🚀 6. Premium Features (Part 2)
*   **Dynamic UI**: Use of `framer-motion` for smooth layout transitions.
*   **Instant Feedback**: Players get immediate visual feedback (Correct/Incorrect) after each question.
*   **Administrative Analytics**: Admins can view a full leaderboard and history for any tournament.
