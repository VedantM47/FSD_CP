# AI Problem Statement Recommendation System

## Overview
The AI recommendation system analyzes team members' skills, interests, and bio to suggest the most suitable problem statement for a hackathon team.

## Architecture

### Backend Components

1. **Models** (`src/models/`)
   - `TeamSkillProfile.js` - Stores extracted skills from team members
   - `ProblemEmbedding.js` - Stores TF-IDF embeddings for problem statements
   - `ProblemMetadata.js` - Stores metadata about problem statements
   - `ProblemStatement.js` - Base problem statement model
   - `RecommendationResult.js` - Stores recommendation results

2. **Services** (`src/services/`)
   - `embeddingService.js` - Generates TF-IDF embeddings and calculates cosine similarity
   - `teamSkillExtractor.js` - Extracts skills from team members' profiles
   - `recommendationEngine.js` - Main recommendation logic

3. **Utilities** (`src/utils/`)
   - `skillExtractor.js` - Keyword extraction for skills, domains, and tools

4. **API** (`src/routes/` & `src/controllers/`)
   - Route: `GET /api/recommendations/:hackathonId`
   - Controller: `recommendation.controller.js`

### Frontend Components

1. **UI Elements** (`src/client/src/pages/participant/SingleHackathon.jsx`)
   - Floating AI assistant button (bottom-right corner)
   - AI recommendation modal with loading states
   - Match score display with insights

2. **Styles** (`src/client/src/styles/SingleHackathon.css`)
   - AI button with pulse animation
   - Modal with smooth transitions
   - Responsive design

## How It Works

### 1. Data Extraction
When a user requests a recommendation:
- System fetches the team and all accepted members
- Extracts skills, interests, and bio from each member
- Extracts information from team's project description
- Combines all data into a team skill profile

### 2. Text Processing
- Team skills are converted to text representation
- Problem statements are processed (title + description)
- Keywords are extracted using predefined skill/domain dictionaries

### 3. Embedding Generation
- TF-IDF (Term Frequency-Inverse Document Frequency) embeddings are generated
- Creates vector representations for team skills and problem statements
- Uses `natural` npm package for NLP processing

### 4. Similarity Calculation
- Cosine similarity is calculated between team vector and each problem vector
- Skill overlap and domain overlap are counted
- Final score = (similarity × 0.6) + (skillOverlap × 0.02) + (domainOverlap × 0.05)

### 5. Ranking & Display
- Problem statements are ranked by match score
- Top recommendation is returned with:
  - Match score (0-100%)
  - Rank position
  - Skill overlap count
  - Domain overlap count

## API Usage

### Request
```http
GET /api/recommendations/:hackathonId
Authorization: Bearer <token>
```

### Success Response
```json
{
  "success": true,
  "data": {
    "teamName": "Team Alpha",
    "recommendation": {
      "problemStatement": {
        "title": "Build a Smart Healthcare App",
        "description": "Create an AI-powered healthcare solution..."
      },
      "matchScore": 0.85,
      "rankPosition": 1,
      "skillOverlap": 5,
      "domainOverlap": 2
    }
  }
}
```

### Error Responses
- `404` - Hackathon not found
- `404` - User not part of any team
- `400` - No problem statements available
- `400` - Team has no accepted members
- `400` - Team needs to add skills/interests
- `500` - Server error

## Requirements

### Team Requirements
- At least one accepted member
- At least one member with skills, interests, or bio filled
- OR team must have a project description

### Hackathon Requirements
- Must have at least one problem statement

## Installation

1. Install dependencies:
```bash
npm install natural
```

2. Backend files are automatically loaded via `src/app.js`

3. Frontend component is integrated in `SingleHackathon.jsx`

## Features

### User Experience
- Floating AI button only visible to registered users
- Smooth animations and transitions
- Loading state with spinner
- Error handling with user-friendly messages
- Match score visualization
- Skill overlap insights

### Technical Features
- TF-IDF based text analysis
- Cosine similarity for matching
- Keyword extraction for 60+ skills
- Domain detection for 10+ categories
- Real-time recommendation generation
- No external API dependencies

## Skill Categories

The system recognizes skills in these categories:
- Programming languages (JavaScript, Python, Java, etc.)
- Web frameworks (React, Angular, Vue, etc.)
- Mobile development (Android, iOS, Flutter, etc.)
- Databases (MongoDB, MySQL, PostgreSQL, etc.)
- Cloud platforms (AWS, Azure, GCP, etc.)
- AI/ML (TensorFlow, PyTorch, NLP, etc.)
- Development tools (Git, Docker, Kubernetes, etc.)

## Domain Categories

The system detects these domains:
- Web Development
- Mobile Development
- Data Science
- Artificial Intelligence
- Blockchain
- IoT
- Cybersecurity
- Game Development
- Cloud Computing
- DevOps

## Future Enhancements

Potential improvements:
1. Cache embeddings for better performance
2. Add user feedback to improve recommendations
3. Support for multiple language models
4. Team collaboration history analysis
5. Past hackathon performance weighting
6. Real-time skill trend analysis
7. Integration with external skill APIs

## Troubleshooting

### "Unable to generate recommendation"
- Ensure team members have filled skills or interests
- Add a project description to the team
- Check that problem statements exist for the hackathon

### Low match scores
- Encourage team members to add more detailed skills
- Update bio with relevant technical information
- Add specific interests related to hackathon themes

### No recommendation returned
- Verify team has accepted members
- Check that user is part of a team
- Ensure hackathon has problem statements defined
