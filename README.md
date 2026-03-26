# Hackathon_Project_2025-26


## Changes in project log: 

format of the log:
### Date: YYYY-MM-DD 
### Contributor: <Your Name>
- 🔧 Type of Change: [Feature / Bug Fix / Refactor / Docs / Setup]
### Files Modified:
- <file_path_1>
- <file_path_2>

### Description:
- Brief explanation of what was done
- Keep it concise but clear

### Database / Schema Changes:
- [Yes / No]
- If Yes:
  - What changed:
  - Migration required: [Yes / No]

### Notes / Dependencies:
- Any important info others should know
- Example: "Requires env update" or "Breaks previous API response"


### LOG 1
Date: 25/03/2026
Contributor: Ojas
- Type of Change:  Bug Fix 
 Files Modified:
        modified:   src/client/src/components/admin/HackathonCard.jsx
        modified:   src/client/src/components/admin/RoleManagement.jsx
        modified:   src/client/src/components/auth/AuthForm.jsx
        modified:   src/client/src/pages/admin/AdminDashboard.jsx
        modified:   src/client/src/pages/admin/CreateHackathon.jsx
        modified:   src/client/src/pages/home/Home.jsx
        modified:   src/client/src/pages/participant/JoinTeam.jsx
        modified:   src/client/src/pages/participant/ManageTeam.jsx
        modified:   src/client/src/pages/user/ApplyOrganizer.jsx
        modified:   src/client/src/pages/user/Calendar.jsx
        modified:   src/client/src/services/api.js
        modified:   src/client/src/styles/admin.css
        modified:   src/controllers/admin.controller.js
        modified:   src/routes/admin.routes.js

Description:
UI UX changes done:
1. search feature in admin dashboard now working
2. in homepage the hackathon boxes are now looking better
3. the organizer application removed
4. the role management feature is now working
5. create and edit hackathon form ui ux is now better way

Database / Schema Changes:
- NO


Notes / Dependencies:
NA

### LOG 2
Project Change Log
Date: 2026-03-26

Contributor: Yash Wadhwani

🔧 Type of Change: [Feature / Bug Fix / Refactor]

Files Modified:

src/models/user.model.js
src/models/hackathon.model.js
src/controllers/profile.controller.js
src/client/src/pages/user/OrganizerDashboard.jsx
src/client/src/pages/home/Home.jsx
src/client/src/App.js (Routes)
src/routes/hackathon.routes.js
src/models/organizerApplication.model.js(removed)
src/routes/organizerApplication.routes.js(removed)
src/controller/organizerApplication.controller.js(removed)

Description:

Role Management Overhaul: Implemented a search-based assignment system allowing Admins to promote any user to 'Judge' or 'Organizer' directly, replacing the manual application process.

Backend Authorization Fix: Updated ProtectedRoute and backend policies to allow users with the "Organizer" role (even with a systemRole of 'user') to access management dashboards.

Schema Synchronization: Updated the User model to support both hackathonId and hId to ensure legacy data remains accessible while fixing the "undefined .toString()" crash in the Profile controller.

UI/UX Enhancements: Refined the Hackathon cards on the Homepage for better visual hierarchy and updated the Organizer Dashboard "Manage Event" navigation.

Cleanup: Removed redundant backend logic and frontend pages related to the old Organizer Application flow.

Database / Schema Changes:[Yes]

What changed: Added hId as an alias in hackathonRoles for backward compatibility; ensured organizerUserId is the standard key for hackathon ownership.

Migration required: [No] (Handled via model aliasing).

Notes / Dependencies:

Frontend Update Required: Ensure App.js routes for /admin/hackathons/... include "user" in the allowedRoles array to permit Organizer access.

Auth Sync: Users must logout and log back in if their roles were recently updated in the database to refresh the JWT/Context.
