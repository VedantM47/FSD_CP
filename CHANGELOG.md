# Hackathon_Project_2025-26

## Changes in project log:

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
