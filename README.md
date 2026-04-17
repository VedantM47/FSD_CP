# Hackathon AI Recommendation System

AI-Driven Problem Statement Recommendation System for Hackathon Platform. This service provides intelligent problem statement recommendations to teams based on their skills, experience, and expertise.

*Part of the larger Hackathon Platform that includes real-time discussions, teammate search, and comprehensive hackathon management features.*

## Features

- **NLP-based Skill Extraction**: Automatically extracts skills, domains, and tools from team member profiles
- **Semantic Similarity Matching**: Uses embeddings to find semantically similar problem statements
- **Intelligent Recommendations**: Combines rule-based filtering with AI ranking for scalable recommendations
- **Real-time Discussion System**: Socket.IO-powered chat for hackathon participants with role-based messaging
- **Tag-based Teammate Search**: Simple and efficient teammate discovery using skill tags
- **RESTful API**: Easy integration with existing web backend
- **MongoDB Integration**: Compatible with existing Mongoose schemas

## Tech Stack

- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **Natural Language Processing**: `natural`, `compromise`
- **Embedding Generation**: Custom TF-IDF based embeddings
- **Real-time Communication**: Socket.IO for live discussions
- **Authentication**: JWT with OAuth (GitHub, Google)

## Additional Features

### Real-time Discussion System
- **Socket.IO Integration**: Real-time messaging within hackathon rooms
- **Role-based Messaging**: Different colors and badges for Admin, Judge, Mentor, and User roles
- **Message History**: Persistent chat history with timestamps and date grouping
- **Threaded Conversations**: Support for nested replies and discussions
- **Authentication**: JWT-based socket authentication for secure connections

### Teammate Search
- **Tag-based Matching**: Simple skill tag matching for teammate discovery
- **Profile-based Search**: Searches across user skills, interests, bio, and department
- **Match Scoring**: Returns results sorted by skill match count
- **Performance Optimized**: Direct database queries without complex AI processing
- **User-friendly Results**: Clear indication of matching skills for each result

## Project Structure

```
hackathon-ai-recommendation/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── problemController.js      # Problem statement CRUD
│   └── recommendationController.js  # Recommendation endpoints
├── models/
│   ├── User.js              # Base user model (for reference)
│   ├── Team.js              # Base team model (for reference)
│   ├── Hackathon.js         # Base hackathon model (for reference)
│   ├── Submission.js        # Base submission model (for reference)
│   ├── TeamSkillProfile.js  # Team skill profile model
│   ├── ProblemStatement.js  # Problem statement model
│   ├── ProblemMetadata.js   # Problem metadata model
│   ├── ProblemEmbedding.js  # Problem embedding model
│   └── RecommendationResult.js  # Recommendation results model
├── routes/
│   ├── problemRoutes.js     # Problem statement routes
│   └── recommendationRoutes.js  # Recommendation routes
├── services/
│   ├── nlpService.js        # NLP processing service
│   ├── embeddingService.js  # Embedding generation service
│   └── recommendationService.js  # Recommendation engine
├── utils/
│   ├── skillExtractor.js    # Skill extraction utilities
│   ├── constants.js         # Constants
│   └── validators.js        # Validation utilities
├── server.js                # Main server file
├── package.json
└── README.md
```

## Installation

1. **Clone the repository** (or navigate to the project directory)

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/hackathon-platform
   PORT=3001
   NODE_ENV=development
   ```

4. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

5. **Run the server**:
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:3001` (or the port specified in `.env`).

## API Endpoints

### Health Check
- **GET** `/health` - Check if service is running

### Problem Statements

- **POST** `/api/problems` - Create a new problem statement
  ```json
  {
    "source": "platform",
    "title": "AI-Powered Learning Platform",
    "description": "Build an AI-powered learning platform..."
  }
  ```

- **GET** `/api/problems` - Get all problem statements
  - Query params: `source`, `limit`, `skip`

- **GET** `/api/problems/:id` - Get a specific problem statement

- **PUT** `/api/problems/:id` - Update a problem statement

- **DELETE** `/api/problems/:id` - Delete a problem statement

### Recommendations

- **POST** `/api/recommendations/teams/:teamId/extract-skills` - Extract team skills
  - Automatically extracts skills from team members' profiles

- **GET** `/api/recommendations/teams/:teamId/skills` - Get team skill profile

- **POST** `/api/recommendations/teams/:teamId/generate` - Generate recommendations
  ```json
  {
    "topN": 10,
    "forceRegenerate": false
  }
  ```

- **GET** `/api/recommendations/teams/:teamId` - Get stored recommendations
  - Query params: `limit`

- **GET** `/api/recommendations/teams/:teamId/stats` - Get recommendation statistics

### Discussion System

- **GET** `/api/hackathons/:hackathonId/discussion` - Get discussion history for a hackathon
- **Socket.IO Events**:
  - `join_hackathon` - Join a hackathon discussion room
  - `send_message` - Send a message (with optional parentId for replies)
  - `receive_message` - Listen for new messages in real-time

### Teammate Search

- **POST** `/api/ai/embed` - Prepare user profile for search (profile readiness check)
- **GET** `/api/ai/search?tags=skill1,skill2` - Search for teammates by skill tags
  - Returns users with matching skills, sorted by match count

## Workflow

### 1. Create Problem Statements
```bash
POST /api/problems
{
  "source": "SIH",
  "title": "Smart City Solutions",
  "description": "Develop IoT-based solutions for smart city management..."
}
```

### 2. Extract Team Skills
```bash
POST /api/recommendations/teams/{teamId}/extract-skills
```
This extracts skills from:
- Team leader's profile (skills, department, college)
- Team members' profiles
- Existing project information

### 3. Generate Recommendations
```bash
POST /api/recommendations/teams/{teamId}/generate
{
  "topN": 10
}
```

The system:
1. Retrieves team skill profile
2. Filters candidate problems using rule-based matching (domain/skill overlap)
3. Ranks candidates using semantic similarity (embeddings)
4. Returns top N recommendations
5. Stores results in database

## Integration with Web Backend

This service is designed to integrate seamlessly with your existing web backend:

1. **Shared Database**: Uses the same MongoDB database and Mongoose models
2. **RESTful API**: Standard HTTP endpoints that can be called from your backend
3. **Compatible Schemas**: Works with existing User, Team, Hackathon, and Submission models

### Example Integration

```javascript
// In your web backend
const axios = require('axios');

// Generate recommendations for a team
const generateRecommendations = async (teamId) => {
  try {
    // First, extract team skills
    await axios.post(`http://localhost:3001/api/recommendations/teams/${teamId}/extract-skills`);
    
    // Then generate recommendations
    const response = await axios.post(
      `http://localhost:3001/api/recommendations/teams/${teamId}/generate`,
      { topN: 10 }
    );
    
    return response.data.data;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw error;
  }
};
```

## Data Flow

```
Problem Statement Input (Platform/SIH/External)
    ↓
NLP Processing (Offline)
    ↓
problem_metadata + problem_embeddings
    ↓
Team Skill Extraction
    ↓
team_skill_profile
    ↓
Candidate Retrieval (Rule-based)
    ↓
AI Ranking (Embeddings)
    ↓
recommendation_results
```

## Database Schemas

### Feature-Specific Tables

- **TeamSkillProfile**: Stores extracted skills, domains, and tools for each team
- **ProblemStatement**: Stores problem statements from various sources
- **ProblemMetadata**: Stores extracted metadata (domains, skills, difficulty, keywords)
- **ProblemEmbedding**: Stores embedding vectors for semantic matching
- **RecommendationResult**: Stores generated recommendations with match scores

## Performance Considerations

- **Rule-based Filtering**: First filters candidates to avoid brute-force vector matching
- **Efficient Embeddings**: Uses lightweight TF-IDF based embeddings (can be upgraded to transformer models)
- **Indexed Queries**: All models have appropriate indexes for fast queries
- **Caching**: Recommendations are stored in database to avoid regeneration

## Future Enhancements

- [ ] Upgrade to transformer-based embeddings (e.g., Sentence-BERT)
- [ ] Add batch processing for large problem statement imports
- [ ] Implement recommendation caching with TTL
- [ ] Add user feedback mechanism to improve recommendations
- [ ] Support for custom skill dictionaries
- [ ] Real-time recommendation updates

## Recent Changes

### Discussion Feature Implementation
- **Real-time Chat System**: Added Socket.IO-based discussion system for hackathon participants
- **Role-based UI**: Implemented different message colors and badges for Admin (Red), Judge (Purple), Mentor (Green), and User (Blue) roles
- **Message Persistence**: Added MongoDB schema for storing discussion messages with support for threaded conversations
- **Authentication**: Integrated JWT-based socket authentication for secure real-time connections
- **Frontend Components**: Created reusable DiscussionPanel and Discussion page components with responsive design

### Teammate Search Simplification
- **Tag-based Search**: Converted from complex AI vector embeddings to simple skill tag matching
- **Performance Improvement**: Removed heavy @xenova/transformers dependency, reducing memory usage and query time
- **Simplified API**: Changed from natural language queries (`?q=looking for python expert`) to tag-based (`?tags=javascript,react`)
- **User Experience**: Results now show exact matching skills, making search results more transparent
- **Maintenance**: Eliminated complex AI model management while maintaining search functionality

### Branding and Navigation Updates
- **Consistent Branding**: Standardized all references to "HackHub" across the platform
- **React Router Integration**: Converted all navigation links from `<a href>` to `<Link to>` for proper SPA behavior
- **Footer Consistency**: Updated all footers to use consistent styling and navigation links

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env` file
- Verify network connectivity

### No Recommendations Generated
- Ensure team skill profile exists (extract skills first)
- Verify problem statements exist in database
- Check if problem metadata and embeddings are generated

### Low Match Scores
- Update team skill profiles
- Add more problem statements
- Verify problem descriptions are detailed enough

## License

ISC

## Support

For issues or questions, please contact the AI team.
