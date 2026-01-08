# Hackathon Connect

A comprehensive platform for managing hackathons, teams, and user participation. This backend system facilitates the creation and management of hackathons, team formations, and project submissions with a robust role-based access control system.

## Features

-   **User Management** : Registration, login, and profile management for Users, Judges, Mentors, and Organizers.
-   **Team Management** : Create, join, and manage teams with leader controls.
-   **Hackathon Management** : Full lifecycle management (Draft, Open, Ongoing, Closed).
-   **Submission System** : Submit projects and track status.
-   **Access Control** : Secure API with RBAC (Role-Based Access Control) and policies.

## Prerequisites

-   **Node.js** : v24.9.0 (as specified in project requirements)
-   **MongoDB** : v7.0.0 or higher
-   **npm** : Installed with Node.js

## Installation

1.  **Clone the repository :**
    ```bash
    git clone https://github.com/IEEE-SB-VIT-Pune/Hackathon_Project_2025-26.git
    cd Hackathon_Project_2025-26
    ```

2.  **Install dependencies :**
    ```bash
    npm install
    ```

3.  **Environment Configuration :**
    Copy the example environment file and update it with your credentials.
    ```bash
    cp .env.example .env
    ```
    Open `.env` and configure :
    -   `PORT` : Server port (default : 3000)
    -   `MONGO_URI` : Your MongoDB connection string
    -   `JWT_SECRET` : Secret key for JWT signing
    -   `JWT_EXPIRES_IN` : Token expiration duration (e.g., 7d)

## Running the Application

-   **Development Mode** (with nodemon) :
    ```bash
    npm run dev
    ```

-   **Start Server** :
    ```bash
    node index.js
    ```

## API Endpoints

### User Routes (`/api/users`)
-   **Public**
    -   `POST /register` : Register a new user
    -   `POST /login` : User login
-   **Private (User)**
    -   `GET /me` : Get current user profile
    -   `PUT /me` : Update current user profile
-   **Admin**
    -   `GET /` : Get all users
    -   `GET /:id` : Get user by ID
    -   `DELETE /:id` : Delete user

### Hackathon Routes (`/api/hackathons`)
-   **Public**
    -   `GET /` : Get all hackathons
    -   `GET /:id` : Get hackathon by ID
    -   `GET /:hackathonId/teams` : Get teams for a hackathon
-   **Protected (Mentor/Admin/Organizer)**
    -   `POST /` : Create hackathon
    -   `PATCH /:id` : Update hackathon details
    -   `PATCH /:id/status` : Update hackathon status
    -   `DELETE /:id` : Delete hackathon
-   **Judge Management**
    -   `POST /:hackathonId/judges` : Assign judge
    -   `DELETE /:hackathonId/judges/:judgeUserId` : Remove judge

### Team Routes (`/api/teams`)
-   **Management**
    -   `POST /` : Create team
    -   `GET /:teamId` : Get team details
    -   `PATCH /:teamId` : Update team details
    -   `DELETE /:teamId` : Delete team
-   **Membership**
    -   `POST /:teamId/join` : Request to join team
    -   `GET /:teamId/requests` : View pending join requests
    -   `PATCH /:teamId/member` : Accept/Reject member
    -   `DELETE /:teamId/leave` : Leave team

### Submission Routes (`/api/submissions`)
-   `POST /` : Create submission (Leader only)
-   `PUT /:submissionId` : Update submission (Leader only)
-   `GET /:submissionId` : View submission (Judge/Member/Admin)

### Evaluation Routes (`/api/evaluations`)
-   `POST /hackathons/:hackathonId/teams/:teamId/evaluations` : Create evaluation (Judge)
-   `GET /hackathons/:hackathonId/teams/:teamId/evaluations` : Get evaluations for a team
-   `PATCH /:evaluationId` : Update evaluation (Judge - own)
-   `PATCH /:evaluationId/lock` : Lock evaluation (Admin/Faculty)
-   `DELETE /:evaluationId` : Delete evaluation (Admin/Faculty)

### System
-   `GET /test` : Health check

## Postman Collection

A Postman collection `IEEE_Hackthon.postman_collection.json` is included in the repository. Import this file into Postman to test the API endpoints directly.
-   **Variables** : Pre-configured variables for `base_url`, `admin` token, and `user` token.

## Folder Structure
        src/
        ├── models/        # Mongoose data models
        ├── controllers/   # Route logic and controllers
        ├── routes/        # API route definitions
        ├── policies/      # Access control policies
        ├── middlewares/   # Authentication and error handling
        ├── config/        # Database and system configuration
        └── utils/         # Helper functions (JWT, etc.)

## Roles

-   **Admin** : Full system access.
-   **User** : Standard participant. Can create/join teams and submit projects.
-   **Mentor** : Can create hackathons.
-   **Organizer** : Manages specific hackathons.
-   **Judge** : Evaluates submissions.

## Resources

-   [RBAC Guide](https ://medium.com/@nocobase/how-to-design-an-rbac-role-based-access-control-system-3b57ca9c6826) - Understanding Role-Based Access Control