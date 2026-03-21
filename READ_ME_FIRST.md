# Progress Log - Quiz Tournament Application

## [2026-03-13] - Feature Upgrades & Requirement Alignment

### Backend (Project-Part 1)
- **[Models]**: Added `creator` field to `Tournament` model.
- **[DTOs]**: Updated `TournamentRequest` and `TournamentDto` to include the `creator` field.
- **[DTOs]**: Created `AdminQuestionDto` to display correct and incorrect answers for admin view.
- **[Services]**: Updated `TournamentServiceImpl` to handle the `creator` field during creation and mapping.
- **[Services]**: Implemented `getTournamentQuestions` to fetch all questions for a specific tournament.
- **[Controllers]**: Added `/api/admin/tournaments/{id}/questions` endpoint for admin question viewing.
- **[Security]**: Implemented `DataInitializer` to automatically seed the default admin user (`admin` / `op@1234`) on startup.
- **[Tests]**: Created `TournamentIntegrationTest.java` covering the full lifecycle (Create, View, Update, Delete, View Questions).

### Frontend (Project-Part 2)
- **[AdminDashboard]**: 
    - Added "Initiator" (Creator) field to the tournament registry table.
    - Updated initialization form to include the "Event Creator" field.
    - Implemented specialized validation error messages for the creator field.
    - Integrated "Question Viewer" modal triggered by clicking the tournament name.
    - Added "User Registry" tab to view all registered users in the system.
- **[PlayerDashboard]**: 
    - Added "Participated" tab to view past quiz results.
    - Improved status handling for Ongoing, Upcoming, and Past tournaments.
    - Restricted entry to non-ongoing or already participated tournaments.
- **[Profile]**: 
    - Fully implemented the profile page with functional state management.
    - Added support for all required fields: Username, Email, First/Last Name, Phone, Address, and Bio.
    - Integrated with backend API for profile fetching and updates.

### Status
- Backend: Compiling and verifying with integration tests.
- Frontend: Fully functional with premium UI/UX.
