# QuizMaster | Part 2 Frontend

## 🚀 Overview
Modern React frontend for the Quiz Tournament API. Built with a focus on premium aesthetics, responsiveness, and clean separation of concerns.

## 🛠️ Features
- **Stateless Auth**: JWT-based login/signup.
- **Admin Dashboard**: Full tournament management in modals.
- **Player Dashboard**: Filterable tournament list and "Like" functionality.
- **Interactive Quiz Session**: Progress tracking and real-time answer feedback.
- **Responsive Design**: Works on Desktop, Tablet, and Mobile.

## 📦 Tech Stack
- React 18
- TypeScript
- Vite
- Lucide Icons
- Framer Motion
- Axios

## 🚦 Getting Started

1. **Backend**: Ensure your Spring Boot API is running on port 8080.
2. **Setup**:
   ```bash
   npm install
   ```
3. **Execution**:
   ```bash
   npm run dev
   ```
4. **Access**: Navigate to `http://localhost:3000`

## 🎨 Architecture
The project uses a structured approach:
- `/components`: Reusable UI elements (Layout, Modal).
- `/pages`: Primary router views (Login, Dashboards, Quiz).
- `/services`: API communication layer.
- `/styles`: Global CSS design tokens.
