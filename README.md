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





---

### Date: 2026-03-26
### Contributor: Prathmesh Toke

- 🔧 Type of Change: **Feature / Bug Fix / Refactor**

#### 1. Profile Professionalization
- Added `website`, `skills`, `interests`, `resumeUrl`, `degree`, `graduationYear` fields to `User` model
- Updated `profile.controller.js` to return full user object instead of cherry-picked fields
- Added `useEffect` in `SettingsTab.jsx` to properly sync async profile data into form state (fixes blank fields bug)
- Added Edit Mode toggle to prevent accidental field modifications
- Redesigned `PublicProfile.jsx` with premium card-based layout, social links, and skill tags
- Updated `OverviewTab.jsx` to display skills and interests
- Added "View Public Profile" button to `ProfileHeader`
- Expanded `profile.css` with new utility styles

#### 2. Team System & Join Flow Enhancements
- Added `'invited'` status and `message` field to `team.model.js` members schema
- Implemented join request with custom message, withdraw request, and auto-withdrawal logic in `team.controller.js`
- Created `TeamDetails.jsx` page for full team exploration before joining
- Redesigned `ManageTeam.jsx` with roster cards, member skills, and "Find Members" button for leaders
- Updated `JoinTeam.jsx` with message modal, withdraw button, and "View Details" link
- Improved `RegisterHackathon.jsx` with profile prepopulation and search filtering
- Opened `VIEW_TEAM_DETAILS` policy to all authenticated users for team discovery
- Added 3 new API routes: discover members, invite member, respond to invite

#### 3. Discover Members & Invitations System
- Created `FindMembers.jsx` page for team leaders to browse and invite available participants
- Created `InvitationsTab.jsx` component in Profile section for users to accept/decline team invites
- Added `discoverMembers`, `inviteMember`, `respondToInvite` to `api.js` service layer
- Updated `participant.controller.js` to include invitations in dashboard response
- Fixed `respondToInvite` query bug — was using implicit match instead of `$elemMatch`, blocking all acceptances

#### 4. Dashboard & Navigation Improvements
- Gated "Go To Full Dashboard" button to only accepted team members and leaders
- Added `isInvitedPending` state to show "INVITE PENDING ACCEPTANCE" badge vs "PENDING APPROVAL"
- Hidden "Manage Team Members" button for pending/invited users
- Added `FindMembers` route to `App.jsx`
- Added "Invitations" tab with 🟡 notification dot to `ProfileTabs` when invites exist
- Wired `InvitationsTab` into `Profile.jsx`

### Files Modified:
- `src/models/user.model.js`
- `src/models/team.model.js`
- `src/controllers/profile.controller.js`
- `src/controllers/team.controller.js`
- `src/controllers/participant.controller.js`
- `src/controllers/hackathon.controller.js`
- `src/routes/team.routes.js`
- `src/policies/policy.js`
- `src/client/src/App.jsx`
- `src/client/src/services/api.js`
- `src/client/src/styles/profile.css`
- `src/client/src/components/user/ProfileHeader.jsx`
- `src/client/src/components/user/ProfileTabs.jsx`
- `src/client/src/components/user/tabs/OverviewTab.jsx`
- `src/client/src/components/user/tabs/SettingsTab.jsx`
- `src/client/src/components/user/tabs/InvitationsTab.jsx` *(NEW)*
- `src/client/src/pages/user/Profile.jsx`
- `src/client/src/pages/user/PublicProfile.jsx`
- `src/client/src/pages/participant/SingleHackathon.jsx`
- `src/client/src/pages/participant/JoinTeam.jsx`
- `src/client/src/pages/participant/ManageTeam.jsx`
- `src/client/src/pages/participant/RegisterHackathon.jsx`
- `src/client/src/pages/participant/ParticipantDashboard.jsx`
- `src/client/src/pages/participant/TeamDetails.jsx` *(NEW)*
- `src/client/src/pages/participant/FindMembers.jsx` *(NEW)*

### Notes / Dependencies:
- `team.model.js` schema updated — existing team documents may need the new `status: 'invited'` enum value
- `profile.controller.js` now returns the full user object — frontend components relying on specific fields will continue to work
- `VIEW_TEAM_DETAILS` policy is now open to all authenticated users — any logged-in user can view any team's details for discovery purposes
- `respondToInvite` fix uses `$elemMatch` — previous implicit Mongoose query was incorrectly matching and blocking all invitation acceptances



Date: 29/03/2026
Contributor: Ojas
- Type of Change: Feature Added
 Files Modified:

PROBLEM_STATEMENTS_DISPLAY_FIX.md
PROBLEM_STATEMENTS_IMPLEMENTATION.md
src/client/src/pages/admin/CreateHackathon.jsx
src/client/src/pages/admin/HackathonDashboard.jsx
src/client/src/pages/admin/ViewHackathon.jsx
src/client/src/pages/judge/HackathonOverview.jsx
src/client/src/pages/participant/SingleHackathon.jsx
src/controllers/hackathon.controller.js
src/models/hackathon.model.js
src/routes/hackathon.routes.js

Description:
UI/UX and Feature Enhancements:

1. Replaced the domain field with dynamic problem statements in hackathon creation
2. Admin can now add multiple problem statements with title and description
3. Improved create hackathon form with dynamic input fields for better usability
4. Implemented hackathon rounds feature with support for multiple rounds
5. Each round now includes name, description, and submission requirements
6. Added dynamic “Add Round” functionality similar to problem statements
7. Updated hackathon schema and backend to store problem statements and rounds
8. Ensured proper validation for problem statements and rounds
9. Display of problem statements and rounds added across:

   * Admin dashboard
   * View hackathon page
   * Participant and judge views
10. Improved overall UI/UX consistency across hackathon-related pages


Database / Schema Changes: YES


Notes / Dependencies:
NA


### LOG 5
Date: 29/03/2026
Contributor: Ojas
- Type of Change:  Bug Fix 
 Files Modified:
        
src/client/src/components/user/cards/HackathonCard.jsx
src/client/src/components/user/tabs/SettingsTab.jsx
src/client/src/pages/participant/FindMembers.jsx
src/client/src/pages/participant/JoinTeam.jsx
src/client/src/pages/participant/ManageTeam.jsx
src/client/src/pages/participant/RegisterHackathon.jsx
src/client/src/pages/participant/SingleHackathon.jsx

Description:
UI UX changes done:
- Implemented working search functionality in admin dashboard
- Enhanced UI/UX of hackathon cards on homepage for better visual appeal
- Removed organizer application feature from the system
- Fixed and improved role management functionality
- Refined create/edit hackathon forms with better layout and user experience
  
Database / Schema Changes:
- NO
Notes / Dependencies:
NA


### LOG 6
Date: 29/03/2026
Contributor: Ojas
- Type of Change:  Feature Added 
 Files Modified:
        

    shalvi ai feature added

A       AI_IMPLEMENTATION_SUMMARY.md
A       AI_RECOMMENDATION_SYSTEM.md
A       QUICK_START_AI_RECOMMENDER.md
M       package.json
M       src/app.js
M       src/client/src/components/AdminDomainSelectForCreation.jsx
M       src/client/src/components/HackathonDomainsBadges.jsx
M       src/client/src/components/user/EventModal.jsx
M       src/client/src/components/user/tabs/SettingsTab.jsx
M       src/client/src/pages/admin/AdminDashboard.jsx
M       src/client/src/pages/participant/SingleHackathon.jsx
M       src/client/src/pages/participant/SubmitProject.jsx
M       src/client/src/pages/participant/TeamDetails.jsx
M       src/client/src/pages/user/Calendar.jsx
M       src/client/src/pages/user/Discovery.jsx
M       src/client/src/styles/SingleHackathon.css
A       src/controllers/recommendation.controller.js
A       src/models/ProblemEmbedding.js
A       src/models/ProblemMetadata.js
A       src/models/ProblemStatement.js
A       src/models/RecommendationResult.js
A       src/models/TeamSkillProfile.js
M       src/models/team.model.js
A       src/routes/recommendation.routes.js
A       src/services/embeddingService.js
A       src/services/recommendationEngine.js
A       src/services/teamSkillExtractor.js
A       src/utils/skillExtractor.js

Description:
AI Feature Enhancements:

* Added AI-based problem recommendation feature
* Integrated backend services for skill extraction and matching
* Created necessary models and APIs for recommendations
* Connected AI feature with participant hackathon page
* removed useless emojis
* some basic important ui changes
  

Database / Schema Changes:
- YES
Notes / Dependencies:
YES
(npm install natural)


