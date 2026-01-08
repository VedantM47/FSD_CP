# API Routes Documentation

## User Routes (`/api/users`)

### Public
- **POST `/register`**  
  Register a new user

- **POST `/login`**  
  User login

### Private (User)
- **GET `/me`**  
  Get current user profile

- **PUT `/me`**  
  Update current user profile

### Admin
- **GET `/`**  
  Get all users

- **GET `/:id`**  
  Get user by ID

- **DELETE `/:id`**  
  Delete user

---

## Hackathon Routes (`/api/hackathons`)

### Public
- **GET `/`**  
  Get all hackathons

- **GET `/:id`**  
  Get hackathon by ID

- **GET `/:hackathonId/teams`**  
  Get teams for a hackathon

### Protected (Mentor / Admin / Organizer)
- **POST `/`**  
  Create a hackathon

- **PATCH `/:id`**  
  Update hackathon details

- **PATCH `/:id/status`**  
  Update hackathon status

- **DELETE `/:id`**  
  Delete hackathon

### Judge Management
- **POST `/:hackathonId/judges`**  
  Assign a judge to a hackathon

- **DELETE `/:hackathonId/judges/:judgeUserId`**  
  Remove a judge from a hackathon

---

## Team Routes (`/api/teams`)

### Management
- **POST `/`**  
  Create a team

- **GET `/:teamId`**  
  Get team details

- **PATCH `/:teamId`**  
  Update team details

- **DELETE `/:teamId`**  
  Delete team

### Membership
- **POST `/:teamId/join`**  
  Request to join a team

- **GET `/:teamId/requests`**  
  View pending join requests

- **PATCH `/:teamId/member`**  
  Accept or reject a team member

- **DELETE `/:teamId/leave`**  
  Leave a team

---

## Submission Routes (`/api/submissions`)

- **POST `/`**  
  Create a submission (Leader only)

- **PUT `/:submissionId`**  
  Update a submission (Leader only)

- **GET `/:submissionId`**  
  View a submission (Judge / Member / Admin)

---

## Evaluation Routes (`/api/evaluations`)

- **POST `/hackathons/:hackathonId/teams/:teamId/evaluations`**  
  Create an evaluation (Judge)

- **GET `/hackathons/:hackathonId/teams/:teamId/evaluations`**  
  Get evaluations for a team

- **PATCH `/:evaluationId`**  
  Update an evaluation (Judge – own evaluation only)

- **PATCH `/:evaluationId/lock`**  
  Lock an evaluation (Admin / Faculty)

- **DELETE `/:evaluationId`**  
  Delete an evaluation (Admin / Faculty)