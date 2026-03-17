# Hackathon Connect

A comprehensive platform for managing hackathons, teams, and user participation. This backend system facilitates the creation and management of hackathons, team formations, and project submissions with a robust role-based access control system.

## Features

-   **User Management** : Registration, OAuth (Google/GitHub), login, and profile management for Users, Judges, Mentors, and Organizers. Includes Notification & Privacy preferences with Skills tagging.
-   **Team Management** : Create, join, and manage teams with leader controls. Includes a "Manage Team" dashboard to accept/reject pending invites.
-   **Hackathon Management** : Full lifecycle management (Draft, Open, Ongoing, Closed). Includes Cloudinary banner image uploads and precise `datetime-local` registration deadlines.
-   **Submission System** : Submit projects and track status.
-   **Access Control** : Secure API with RBAC (Role-Based Access Control) and policies.
-   **Organizer System** : Users can apply to become Organizers, and Admins can review/approve these applications from the Admin Dashboard.
-   **Discovery & Search** : Interactive search bar connected to the backend to filter hackathons in real-time.

## Prerequisites

-   **Node.js** : v20+ (recommended)
-   **MongoDB** : v7.0.0 or higher
-   **npm** : Installed with Node.js
-   **Cloudinary Account**: Required for image uploads
-   **Google/GitHub Developer Accounts**: Required for OAuth login

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
    Open `.env` and configure essential variables:
    -   `PORT` : Server port (default : 8080)
    -   `FRONTEND_URL`: Usually `http://localhost:5173`
    -   `BACKEND_URL`: Usually `http://localhost:8080`
    -   `MONGO_URI` : Your MongoDB connection string
    -   `JWT_SECRET` : Secret key for JWT signing
    -   `CLOUDINARY_*`: Cloudinary API keys for image uploads
    -   `GOOGLE_CLIENT_*` & `GITHUB_CLIENT_*`: OAuth keys

## Running the Application

This is a monolithic repository containing both the frontend (React/Vite) and backend (Express). You will need to run two terminal processes:

**Terminal 1 (Backend Server) :**
```bash
# Starts the backend API on port 8080
npm run dev
```

**Terminal 2 (Frontend Client) :**
```bash
cd src/client
npm install
npm run dev
```

## Seeding Dummy Data

To quickly test the platform without manually creating accounts and hackathons, you can run the seed script. This drops existing collections and generates an Admin, Judge, 3 Participants, 4 Hackathons, Teams, and Organizer Applications.

```bash
# From the root directory:
node src/seed.js
```
*Note: Default accounts use the password `password123`. See script output for exact emails.*

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

### Organizer Routes (`/api/organizer`)
-   `POST /apply` : Apply to become an organizer (User)
-   `GET /applications` : View pending organizer applications (Admin)
-   `PATCH /applications/:id` : Approve or reject organizer application (Admin)

### System
-   `GET /test` : Health check

## API Documentation & Testing

A Postman collection is included or you can refer to `manual_testing.md` for cURL commands to test the endpoints locally.
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