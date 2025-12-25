# Hackathon_Project_2025-26

## Branch :: Prathmesh
### This is the Backend of Hackathon_Project_2025-26
    Nodejs == v24.9.0


---
### Folder Structure

        src/
        ├── models/        # Mongoose schemas
        ├── controllers/   # Logic
        ├── routes/        # API routes
        ├── policies/      # ABAC rules
        ├── middlewares/   # Auth & authorization
        ├── config/        # DB config
        └── util/          # Utility function

---

## User System
	•	Normal User (default)
        1. Can create or join teams
        2. Can participate in hackathons

	•	Judge (Hackathon-specific)
        1. Can view registered users
        2. Can view teams and submissions

	•	System Admin
        1. Full system access
        2. User moderation and management

---

## Team System
	•	Teams belong to one hackathon
	•	Each team has:
        •	Leader
        •	Members
        •	Max size
        •	Open/closed join status
	•	Team leaders control:
        •	Team updates
        •	Member approvals
        •	Submissions

---

## Hackathon System
	•	Hackathons have:
        •	Status lifecycle (draft → open → ongoing → closed)
        •	Rules, prizes, deadlines
        •	Teams can register only during open phase


## Resources
- [RBAC -> Role Based Accesses Control](https://medium.com/@nocobase/how-to-design-an-rbac-role-based-access-control-system-3b57ca9c6826)
- [ABAC -> Attribute Based Accesses Control](https://youtu.be/rvZ35YW4t5k)


## Role Explained

- Admin : Super User
- User : normal web user
- Mentor : this role is assigned my admin which can create hackathon
- Organizer : this role is assigned by the mentor who can manage the hackathon 
- Judge : who can assess the hackathon