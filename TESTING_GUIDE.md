# 🚀 COMPLETE PROJECT TESTING GUIDE

## ✅ Project Status

### What's Running Now:
- ✅ **Backend**: Running on `http://localhost:8080`
- ✅ **Frontend**: Running on `http://localhost:5174` (Port 5173 was busy)
- ✅ **Database**: MongoDB connected on localhost
- ✅ **Test Data**: Seeded - 3 test users + 2 teams created
- ✅ **Authentication**: JWT configured with JWT_SECRET in `.env`

---

## 📋 Test Users (Pre-seeded)

Use these credentials to test the full platform:

### **Team 1 Users:**
| Email | Password | Role | Team |
|-------|----------|------|------|
| `test-team-1-frontend@example.com` | `password123` | User | Team 1 |
| `test-team-1-backend@example.com` | `password123` | User | Team 1 |

### **Team 2 Users:**
| Email | Password | Role | Team |
|-------|----------|------|------|
| `test-team-2-ml@example.com` | `password123` | User | Team 2 |

### **New Test Account:**
You can also **register a new account** during testing:
- Email: Any valid email (e.g., `test@example.com`)
- Password: Any password  
- Full Name: Any name

---

## 🧪 CORE FEATURE TESTING

### **1️⃣ TEST AUTHENTICATION**

#### **Try Login:**
1. Open: `http://localhost:5174/login`
2. Enter: `test-team-1-frontend@example.com` / `password123`
3. Click "Sign In"
4. ✅ Should redirect to `/discovery` page
5. ✅ User profile visible in navbar
6. ✅ Auth token saved in browser localStorage

#### **Try Register:**
1. Open: `http://localhost:5174/signup`
2. Fill form:
   - Full Name: `Test User`
   - Email: `newuser@example.com`
   - Password: `SecurePass123`
3. Click "Sign Up"
4. ✅ Should create account and auto-login
5. ✅ Redirect to `/discovery`

#### **Test Protected Routes:**
1. After logout, try accessing: `http://localhost:5174/discovery`
2. ✅ Should redirect to login page
3. Login again - should go back to discovery

---

### **2️⃣ TEST DISCUSSION FEATURE** (Real-time Chats)

#### **Prerequisites:**
- Be logged in as a user
- Navigate to a hackathon's discussion page

#### **Steps:**
1. Login with `test-team-1-frontend@example.com`
2. Click "Discovery" → Select any hackathon → Click "Discussion"
3. In the discussion panel:
   - ✅ See message history with dates
   - ✅ Send a message (type and click send)
   - ✅ See message appear immediately in your view
   - ✅ Roll-based colors (Admin: Red, Judge: Purple, Mentor: Green, User: Blue)

#### **Real-time Test (Open 2 Browsers):**
1. **Browser 1:** Login as `test-team-1-frontend@example.com`
2. **Browser 2:** Login as `test-team-1-backend@example.com`
3. Both navigate to same hackathon's discussion
4. **Browser 1:** Send message: "Hello from Frontend Dev"
5. **Browser 2:** ✅ Message appears instantly (no refresh needed)
6. **Browser 2:** Send reply: "Hi from Backend Dev"
7. **Browser 1:** ✅ Reply appears in real-time

---

### **3️⃣ TEST USER PROFILE & SETTINGS**

1. Click profile icon (top-right) → "My Profile"
2. ✅ See user information
3. Update bio/interests/skills
4. ✅ Changes save successfully
5. Try uploading resume (uses memory storage if Cloudinary not configured)

---

### **4️⃣ TEST TEAM FEATURES**

#### **View Teams:**
1. Go to "Discovery" page
2. Look for "Teams" section
3. ✅ See Team 1 and Team 2 created by seed

#### **Join Team (if applicable):**
1. Click on a team
2. ✅ See team members
3. Try joining (if not already member)

#### **Search Teams:**
1. Search teams by name or tags
2. ✅ Results filter correctly

---

### **5️⃣ TEST HACKATHONS**

#### **View Hackathons:**
1. Go to "Discovery" page
2. ✅ See hackathon cards
3. Click on any hackathon → See details

#### **Register for Hackathon (if permitted):**
1. Click "Register" button
2. ✅ Should either register or show reason if you can't
3. Check team assignments

#### **View Submissions:**
1. In hackathon detail → "Submissions" tab
2. ✅ See any submitted projects (if your team submitted)

---

### **6️⃣ TEST SEARCH & RECOMMENDATIONS**

#### **Search Teammates:**
1. Go to "Discovery" → "Search Teams/People"
2. Type keywords (tags/skills)
3. ✅ Results appear based on:
   - User names
   - Skills tags
   - Interests
   - Team affiliations

#### **Search Problems (if implemented):**
1. Problem recommendations visible on hackathon page
2. ✅ Based on user skill profile and interests

---

## 🔧 UTILITY TESTS

### **API Health Check:**
```bash
# In terminal, test backend is responding:
curl -X GET http://localhost:8080/api/users/search?q=test
```

### **Database Check:**
```bash
# View test data in MongoDB:
mongosh
use hackathon_db
db.users.find()        # See all users
db.hackathons.find()   # See hackathons
db.teams.find()        # See teams
db.discussions.find()  # See chat messages
```

### **Token Verification:**
```javascript
// In browser console, check auth token:
localStorage.getItem('authToken')  // Should show JWT token

// Check if token is valid:
atob(localStorage.getItem('authToken').split('.')[1])  // View token payload
```

---

## ✨ ROLE-BASED TESTING (Discussion Feature)

### **Different User Roles in Discussions:**

1. **Normal User (Blue)** - Current test users
   - Message bubbles: Light gray (others), Blue (own)
   
2. **Judge (Purple)** - Set in database
   ```javascript
   db.users.updateOne(
     { email: "test-team-1-backend@example.com" },
     { $set: { systemRole: "judge" } }
   )
   ```
   - Message bubbles: Light purple (others), Purple gradient (own)
   - Shows "JUDGE" badge next to name

3. **Admin (Red)** - Set in database
   ```javascript
   db.users.updateOne(
     { email: "test-team-1-frontend@example.com" },
     { $set: { systemRole: "admin" } }
   )
   ```
   - Message bubbles: Light red (others), Red gradient (own)
   - Shows "ADMIN" badge next to name

4. **Mentor (Green)** - Set in database
   ```javascript
   db.users.updateOne(
     { email: "test-team-2-ml@example.com" },
     { $set: { systemRole: "mentor" } }
   )
   ```
   - Message bubbles: Light green (others), Green gradient (own)
   - Shows "MENTOR" badge next to name

---

## 🐛 DEBUGGING

### **Login Not Working?**

**Check 1:** Verify backend is running
```bash
# In terminal: Should show "🚀 Server running on port 8080"
# See processes: netstat -ano | findstr :8080
```

**Check 2:** Verify DATABASE
```bash
mongosh
use hackathon_db
db.users.find()  # Should show seeded users
```

**Check 3:** Check browser console (F12)
- Look for network errors (red XHR requests)
- Check if `/api/users/login` returns 200 OK

**Check 4:** Verify `.env` has JWT_SECRET
```bash
cat .env | grep JWT_SECRET
# Should show: JWT_SECRET=your_super_secret_jwt_key...
```

### **Frontend Can't Connect to Backend?**

**Check CORS:**
- `.env` should have: `ALLOWED_ORIGIN=http://localhost:5174`
- Update if frontend is on different port

**Check Frontend API URL:**
- File: `src/client/src/services/api.js`
- Should be: `baseURL: "http://localhost:8080/api"`

### **Discussion Not Working?**

**Check Socket.IO:**
```bash
# Backend: Check Socket.IO is initialized
# Should see: "🔌 Socket.IO attached and listening"

# Browser Console: 
# Look for: socket.io.js loaded successfully
```

**Check JWT in Socket:**
- Token passed in localStorage
- Should auto-attach to socket connection

---

## ✅ COMPLETE TESTING CHECKLIST

- [ ] Can register new account
- [ ] Can login with credentials
- [ ] Can logout
- [ ] Protected routes redirect to login when not authenticated
- [ ] Profile page shows user info
- [ ] Can update profile
- [ ] Can see hackathons
- [ ] Can view hackathon details
- [ ] Can send message in discussion
- [ ] Messages appear in real-time (multi-browser)
- [ ] Role-based colors showing in discussion
- [ ] Role badges appear for special users
- [ ] Can search teams/people
- [ ] Can view team members
- [ ] All navigation links work
- [ ] No console errors
- [ ] Backend API responds to requests

---

## 📊 ENVIRONMENT VARIABLES CONFIGURED

```bash
✅ MONGO_URI=mongodb://localhost:27017/hackathon_db
✅ JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long...
✅ PORT=8080
✅ NODE_ENV=development
✅ ALLOWED_ORIGIN=http://localhost:5173
✅ BACKEND_URL=http://localhost:8080
✅ FRONTEND_URL=http://localhost:5173

⚠️  OPTIONAL (Google OAuth): Not configured - Google login disabled (safe)
⚠️  OPTIONAL (GitHub OAuth): Not configured - GitHub login disabled (safe)
⚠️  OPTIONAL (Cloudinary): Not configured - Using memory storage for uploads (safe)
⚠️  OPTIONAL (Email): Not configured - Emails will queue but not send (safe)
```

---

## 🎯 NEXT STEPS

1. **Open Frontend**: `http://localhost:5174`
2. **Login** with test user or register new one
3. **Test Discussion** by opening any hackathon → Discussion tab
4. **Test Multi-user** by opening 2 browser windows
5. **Report Errors** if you encounter any issues

---

## 📞 TROUBLESHOOTING SUMMARY

| Issue | Solution |
|-------|----------|
| "Cannot POST /api/users/login" | Backend not running - `npm start` |
| "Connection refused" | MongoDB not running - `mongod` |
| "Invalid token" | JWT_SECRET missing in `.env` |
| "401 Unauthorized" | Token expired - login again |
| "CORS error" | ALLOWED_ORIGIN incorrect in `.env` |
| "Socket.IO not connecting" | Backend socket.io not initialized |
| "Frontend on port 5174 not 5173" | Port 5173 was busy - use 5174 |

---

**All systems ready! Start testing now! 🎉**
