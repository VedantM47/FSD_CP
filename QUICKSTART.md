# Quick Start Guide

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or remote)
- npm or yarn

## Setup Steps

1. **Install Dependencies**
   ```bash
   cd hackathon-ai-recommendation
   npm install
   ```

2. **Configure Environment**
   ```bash
   # Copy the example env file
   cp env.example .env
   
   # Edit .env and set your MongoDB URI
   # MONGODB_URI=mongodb://localhost:27017/hackathon-platform
   ```

3. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

4. **Start the Server**
   ```bash
   # Development mode (auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Verify Installation**
   ```bash
   # Check health endpoint
   curl http://localhost:3001/health
   ```

## First Steps

### 1. Create a Problem Statement

```bash
curl -X POST http://localhost:3001/api/problems \
  -H "Content-Type: application/json" \
  -d '{
    "source": "platform",
    "title": "AI-Powered Learning Platform",
    "description": "Develop an AI-powered learning platform using Python, Machine Learning, React, and Node.js"
  }'
```

### 2. Extract Team Skills

```bash
# Replace {teamId} with actual team ID from your database
curl -X POST http://localhost:3001/api/recommendations/teams/{teamId}/extract-skills
```

### 3. Generate Recommendations

```bash
# Replace {teamId} with actual team ID
curl -X POST http://localhost:3001/api/recommendations/teams/{teamId}/generate \
  -H "Content-Type: application/json" \
  -d '{"topN": 10}'
```

### 4. Get Recommendations

```bash
curl http://localhost:3001/api/recommendations/teams/{teamId}?limit=10
```

## Testing

Use the example test script:

```bash
# Update TEAM_ID in examples/test-api.js first
node examples/test-api.js
```

## Integration with Web Backend

The service runs on port 3001 by default. Your web backend can call it using:

```javascript
const axios = require('axios');
const AI_SERVICE_URL = 'http://localhost:3001';

// Generate recommendations
const recommendations = await axios.post(
  `${AI_SERVICE_URL}/api/recommendations/teams/${teamId}/generate`,
  { topN: 10 }
);
```

## Common Issues

**MongoDB Connection Error**
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- Verify network connectivity

**No Recommendations Generated**
- Ensure team skill profile exists (extract skills first)
- Verify problem statements exist in database
- Check if embeddings are generated (they're created automatically)

**Port Already in Use**
- Change PORT in .env file
- Or kill the process using port 3001

## Next Steps

1. Add more problem statements to the database
2. Extract skills for your teams
3. Generate and test recommendations
4. Integrate with your web backend

For detailed API documentation, see [README.md](./README.md).

