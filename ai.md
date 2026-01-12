# AI Features Integration Guide

This guide explains how to integrate the Semantic Search and User
Embedding features into the frontend application.

## Prerequisites

Before using these features, ensure the new dependencies are installed
on the backend server:

``` bash
npm install @xenova/transformers
```

Note: The first time the embedding API is called, the server will
automatically download the AI model. This may cause a 30--60 second
delay for the very first request only.

------------------------------------------------------------------------

## 1. Embed User (Generate Vector)

When to call: Trigger this API immediately after a user updates their
profile (for example, changes skills, bio, or department). This ensures
the AI search engine has the latest data for that user.

Endpoint: `POST /api/ai/embed`\
Method: `POST`\
Auth: `Bearer <token>` (Required)\
Body: None (The backend automatically uses the logged-in user's profile
data)

### Success Response

``` json
{
  "success": true,
  "message": "User embedding generated and saved successfully."
}
```

------------------------------------------------------------------------

## 2. Semantic Search (Find Teammates)

When to call: When a user types into the "Find Teammates" search bar.
This uses natural language processing (vector similarity) rather than
simple keyword matching.

Endpoint: `GET /api/ai/search`\
Method: `GET`\
Auth: `Bearer <token>` (Required)\
Query Param: `?q=` (The search text, for example: "looking for python
backend dev")

### Example Request

    GET /api/ai/search?q=expert in react and nodejs

### Success Response

Returns the top 10 matches sorted by relevance score.

``` json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "65a1b2...",
      "fullName": "Jane Doe",
      "email": "jane@example.com",
      "skills": ["React", "Node.js", "Express"],
      "bio": "Full stack developer with 3 years of experience...",
      "score": 0.8921
    },
    {
      "_id": "65b2c3...",
      "fullName": "John Smith",
      "email": "john@example.com",
      "skills": ["JavaScript", "HTML", "CSS"],
      "bio": "Frontend enthusiast...",
      "score": 0.751
    }
  ]
}
```
