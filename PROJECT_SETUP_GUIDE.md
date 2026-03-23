# Project Setup and Run Guide

## Overview
This is an **AI-Driven Hackathon Platform** with a Node.js/Express backend, React/Vite frontend, MongoDB database, and real-time Socket.IO support.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v16 or higher
- **MongoDB** (local or cloud instance)
- **npm** or **yarn**

### Installation (Both Backend & Frontend)
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
npm install --prefix src/client
```

---

## 📋 Environment Variables Setup

### 1. Create `.env` file in root directory
```bash
cp env.example .env
```

### 2. Required Environment Variables
See [env.example](env.example) for the base configuration:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/hackathon-platform
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hackathon-platform

# Server Configuration
PORT=8080                           # Backend port (default: 8080)
NODE_ENV=development               # or 'production'

# Frontend CORS (used by backend)
ALLOWED_ORIGIN=http://localhost:5173  # Vite dev server port
```

### Optional Environment Variables
```env
# OAuth (if using GitHub/Google login)
GITHUB_CLIENT_ID=your_github_id
GITHUB_CLIENT_SECRET=your_github_secret
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret

# Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Cloudinary (Image upload)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI/ML Configuration
OPENAI_API_KEY=your_openai_key  # Optional - for future enhancements
```

---

## 🗄️ Database Setup

### MongoDB Connection
The application uses **Mongoose** to connect to MongoDB. Connection happens automatically on server startup.

**Connection File:** [src/config/db.js](src/config/db.js)

### Database Reset & Seeding

#### Option 1: Quick Test Data Seeding
```bash
# Seed basic test data with users and teams
node src/scripts/seedTestData.js
```

#### Option 2: Comprehensive Data Seeding
```bash
# Seed complete test data (users, hackathons, teams, applications)
node src/seed.js
```

**What Gets Seeded:**
- Test users (with different roles: admin, judge, participant, organizer)
- Test hackathons
- Test teams with members
- Organizer applications
- Test problem statements
- AI recommendation test data

### Database Models
Located in [src/models/](src/models/):
- `user.model.js` - User accounts, profiles, skills
- `team.model.js` - Teams, members, projects
- `hackathon.model.js` - Hackathon events
- `submission.model.js` - Team submissions
- `evaluation.model.js` - Evaluation scores
- `problemStatement.model.js` - Problem statements
- `problemEmbedding.model.js` - AI embeddings for problems
- `teamSkillProfile.model.js` - Team skill profiles
- `recommendationResult.model.js` - AI recommendations

---

## ▶️ Backend Server

### Entry Point
- **Main File:** [index.js](index.js)
- **App Configuration:** [src/app.js](src/app.js)
- **Default Port:** `8080` (configurable via `PORT` env var)
- **Frontend Origin:** `http://localhost:5173` (default Vite dev server)

### Start Commands

#### Development Mode (with auto-reload)
```bash
npm run dev
```
Uses **nodemon** to automatically restart server on file changes.

#### Production Mode
```bash
npm start
```

#### Run Both Backend & Frontend Together
```bash
npm run dev:all
```
Uses **concurrently** to run both servers in one terminal.

### Server Features
- **Port:** 8080
- **CORS:** Enabled (configured for multiple origins)
- **Rate Limiting:** 1,000,000 requests per 15 minutes per IP
- **Socket.IO:** Real-time communication for chat, notifications
- **Authentication:** JWT + OAuth (GitHub, Google)
- **Logging:** Custom request logger

### API Base URL
```
http://localhost:8080/api
```

### Main API Routes
```
POST/GET   /api/users              - User management
POST/GET   /api/teams              - Team management
POST/GET   /api/hackathons         - Hackathon events
POST/GET   /api/submissions        - Submissions
POST/GET   /api/evaluations        - Evaluations
POST/GET   /api/problems           - Problem statements
POST/GET   /api/recommendations    - AI recommendations
POST/GET   /api/ai                 - AI search features
POST/POST  /api/oauth              - OAuth authentication
GET/POST   /api/calendar           - Event calendar
POST/GET   /api/judge              - Judge portal
POST/GET   /api/admin              - Admin functions
POST/GET   /api/profile            - User profiles
POST/GET   /api/organizer          - Organizer functions
POST/GET   /api/participant        - Participant functions
```

### Health Check
```bash
curl http://localhost:8080/health
```

---

## 🎨 Frontend Application

### Entry Point & Setup
- **Frontend Directory:** [src/client/](src/client/)
- **Configuration:** [src/client/vite.config.js](src/client/vite.config.js)
- **HTML Entry:** [src/client/public/index.html](src/client/public/index.html)
- **React App:** [src/client/src/](src/client/src/)
- **Default Port:** `5173` (Vite default)
- **Styling:** Tailwind CSS

### Frontend Stack
- **Framework:** React 19
- **Build Tool:** Vite 6
- **Routing:** React Router DOM 7
- **HTTP Client:** Axios
- **Real-time:** Socket.IO Client
- **Styling:** Tailwind CSS 3, PostCSS

### Start Commands

#### Development Mode (with hot reload)
```bash
npm run dev --prefix src/client
```
Access at: `http://localhost:5173`

#### Production Build
```bash
npm run build --prefix src/client
```
Creates optimized build in `src/client/dist/`

#### Preview Production Build
```bash
npm run preview --prefix src/client
```

#### Lint Code
```bash
npm run lint --prefix src/client
```

### Frontend API Connection
The frontend connects to the backend at:
```javascript
const API_URL = 'http://localhost:8080/api'
```

Configure in environment or axios instance as needed.

---

## 🧪 Testing Setup

### Current Test Status
⚠️ **No automated tests configured yet**

**Root package.json test script:**
```bash
npm test
```
Currently outputs: "Error: no test specified"

### Recommendations for Testing
The following testing frameworks could be integrated:
- **Backend:** Jest, Mocha + Chai
- **Frontend:** Vitest (Vite-native), React Testing Library
- **E2E:** Cypress, Playwright

### Example Test File
[src/examples/test-api.js](src/examples/test-api.js) - Manual API testing script

---

## 🌱 Seeding & Test Data

### Available Seed Scripts

#### 1. Basic Seed Script
```bash
node src/scripts/seedTestData.js
```
**Creates:**
- 3 test users (frontend dev, backend dev, ML engineer)
- 2 teams with mixed skills
- Generates team skill profiles
- Ready for AI recommendation testing

**Output:** Team IDs printed to console (save these for testing)

#### 2. Comprehensive Seed Script
```bash
node src/seed.js
```
**Creates:**
- Admin user
- Judge user
- Sample participants
- Hackathons
- Teams
- Organizer applications
- Complete test environment

### Test API Script
```bash
# Edit with correct team ID first
node src/examples/test-api.js
```

### Sample API Calls for Testing

#### Create Problem Statement
```bash
curl -X POST http://localhost:8080/api/problems \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AI Learning Platform",
    "description": "Build an AI-powered learning system using ML and React"
  }'
```

#### Extract Team Skills
```bash
curl -X POST http://localhost:8080/api/recommendations/teams/{TEAM_ID}/extract-skills
```

#### Generate AI Recommendations
```bash
curl -X POST http://localhost:8080/api/recommendations/teams/{TEAM_ID}/generate \
  -H "Content-Type: application/json" \
  -d '{"topN": 10}'
```

#### Get Recommendations
```bash
curl http://localhost:8080/api/recommendations/teams/{TEAM_ID}?limit=10
```

---

## 📚 Key Configuration Files

| File | Purpose |
|------|---------|
| [index.js](index.js) | Server entry point, Socket.IO setup |
| [src/app.js](src/app.js) | Express app configuration, middleware, routes |
| [src/config/db.js](src/config/db.js) | MongoDB connection via Mongoose |
| [src/config/database.js](src/config/database.js) | Alternative DB config file |
| [.env.example](env.example) | Environment variables template |
| [package.json](package.json) | Backend dependencies, scripts |
| [src/client/package.json](src/client/package.json) | Frontend dependencies, scripts |
| [src/client/vite.config.js](src/client/vite.config.js) | Vite/React configuration |

---

## 🔧 Development Workflow

### Full Stack Development
```bash
# Terminal 1: Start MongoDB (if local)
mongod

# Terminal 2: Start backend
npm run dev

# Terminal 3: Start frontend
npm run dev --prefix src/client

# Or use concurrently:
npm run dev:all
```

### Access Points
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8080/api
- **Server Health:** http://localhost:8080/health

### Real-time Features
Socket.IO is configured and running on the same port as the backend (8080).
Chat, notifications, and real-time updates use this connection.

---

## 📦 Project Structure

```
Hackathon_Project_2025-26/
├── index.js                    # Server entry point
├── package.json               # Backend dependencies
├── .env                       # Environment variables (create from example)
├── env.example                # Environment template
├── src/
│   ├── app.js                # Express app configuration
│   ├── seed.js               # Comprehensive seed script
│   ├── config/
│   │   ├── db.js            # MongoDB connection
│   │   ├── google.passport.js
│   │   └── github.passport.js
│   ├── controllers/           # Route handlers
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API route definitions
│   ├── services/             # Business logic (NLP, recommendations, etc.)
│   ├── middlewares/           # Express middleware
│   ├── scripts/
│   │   └── seedTestData.js  # Quick seed script
│   ├── examples/
│   │   └── test-api.js      # Manual API testing
│   ├── socket/               # Socket.IO handlers
│   ├── data/                # In-memory stores
│   ├── utils/               # Utilities and helpers
│   └── client/              # React frontend
│       ├── package.json     # Frontend dependencies
│       ├── vite.config.js   # Vite configuration
│       ├── src/
│       │   ├── main.jsx     # React entry point
│       │   ├── App.jsx      # Main app component
│       │   ├── pages/       # Page components
│       │   ├── components/  # Reusable components
│       │   └── utils/       # Frontend utilities
│       └── public/          # Static assets
├── public/                   # Backend static files
├── docs/
│   ├── QUICKSTART.md        # Quick start guide
│   ├── ai.md               # AI features documentation
│   └── discussion.md        # Discussion features
└── README.md               # Main project readme
```

---

## ⚡ Performance & Port Information

| Service | Port | Environment Variable | Default |
|---------|------|----------------------|---------|
| Backend (Node.js) | 8080 | `PORT` | 8080 |
| Frontend (Vite) | 5173 | - | 5173 |
| MongoDB | 27017 | `MONGODB_URI` | localhost |
| Socket.IO | 8080 | - | Same as backend |

---

## 🐛 Common Issues & Solutions

### MongoDB Connection Error
```
Error: MongoDB collection not found
```
**Solution:** 
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env`
- Try seeding data: `node src/scripts/seedTestData.js`

### Port Already in Use
```
Error: listen EADDRINUSE :::8080
```
**Solution:**
- Change `PORT` in `.env` to another port (e.g., 3000)
- Or kill the process: `lsof -ti :8080 | xargs kill -9`

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Verify `ALLOWED_ORIGIN` in `.env` matches frontend URL
- Default: `http://localhost:5173`

### Frontend Can't Connect to Backend
**Solution:**
- Ensure backend is running: `npm run dev`
- Check API URL in frontend code
- Verify CORS configuration in `src/app.js`

### Module Not Found Error
**Solution:**
- Reinstall dependencies: `npm install`
- For frontend: `npm install --prefix src/client`
- Clear node_modules: `rm -rf node_modules && npm install`

---

## 📝 Documentation Files

| File | Content |
|------|---------|
| [README.md](README.md) | Main project overview |
| [docs/QUICKSTART.md](docs/QUICKSTART.md) | Detailed quick start guide |
| [docs/ai.md](docs/ai.md) | AI recommendation features |
| [docs/discussion.md](docs/discussion.md) | Discussion features |
| [DISCUSSION_FEATURE_GUIDE.md](DISCUSSION_FEATURE_GUIDE.md) | Discussion implementation details |

---

## 🚀 Next Steps

1. **Set up environment:** Copy `env.example` to `.env`
2. **Install dependencies:** `npm install && npm install --prefix src/client`
3. **Seed data:** `node src/scripts/seedTestData.js`
4. **Start backend:** `npm run dev`
5. **Start frontend:** `npm run dev --prefix src/client` (in another terminal)
6. **Access app:** Visit `http://localhost:5173`
7. **Test API:** Use curl or Postman with examples above

---

## 📞 Support

For additional help:
- Check individual documentation files in `/docs`
- Review inline code comments in source files
- Check GitHub issues: https://github.com/IEEE-SB-VIT-Pune/Hackathon_Project_2025-26/issues

