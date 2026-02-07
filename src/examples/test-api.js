/**
 * Example script to test the AI Recommendation API
 * 
 * Usage:
 * 1. Make sure the server is running (npm start)
 * 2. Update the MongoDB connection and team IDs as needed
 * 3. Run: node examples/test-api.js
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Example team ID (replace with actual team ID from your database)
const TEAM_ID = '507f1f77bcf86cd799439011'; // Replace with actual team ID

// Example problem statement
const exampleProblem = {
  source: 'platform',
  title: 'AI-Powered Learning Platform',
  description: `
    Develop an AI-powered learning platform that personalizes educational content 
    for students. The platform should use machine learning algorithms to analyze 
    student performance and recommend customized learning paths. 
    
    Required skills: Python, Machine Learning, React, Node.js, MongoDB
    Domain: EdTech, AI/ML, Web Development
    Difficulty: Medium
  `,
};

/**
 * Test creating a problem statement
 */
async function testCreateProblem() {
  try {
    console.log('📝 Creating problem statement...');
    const response = await axios.post(`${API_BASE_URL}/problems`, exampleProblem);
    console.log('✅ Problem created:', response.data.data._id);
    return response.data.data._id;
  } catch (error) {
    console.error('❌ Error creating problem:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Test extracting team skills
 */
async function testExtractTeamSkills(teamId) {
  try {
    console.log(`\n🔍 Extracting skills for team ${teamId}...`);
    const response = await axios.post(
      `${API_BASE_URL}/recommendations/teams/${teamId}/extract-skills`
    );
    console.log('✅ Skills extracted:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ Error extracting skills:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Test getting team skills
 */
async function testGetTeamSkills(teamId) {
  try {
    console.log(`\n📊 Getting team skills for team ${teamId}...`);
    const response = await axios.get(
      `${API_BASE_URL}/recommendations/teams/${teamId}/skills`
    );
    console.log('✅ Team skills:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ Error getting skills:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Test generating recommendations
 */
async function testGenerateRecommendations(teamId) {
  try {
    console.log(`\n🎯 Generating recommendations for team ${teamId}...`);
    const response = await axios.post(
      `${API_BASE_URL}/recommendations/teams/${teamId}/generate`,
      { topN: 5 }
    );
    console.log('✅ Recommendations generated:');
    response.data.data.forEach((rec, index) => {
      console.log(`\n  ${index + 1}. ${rec.problem.title}`);
      console.log(`     Match Score: ${(rec.matchScore * 100).toFixed(2)}%`);
      console.log(`     Difficulty: ${rec.metadata?.difficulty || 'N/A'}`);
      console.log(`     Domains: ${rec.metadata?.domains?.join(', ') || 'N/A'}`);
    });
    return response.data.data;
  } catch (error) {
    console.error('❌ Error generating recommendations:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Test getting stored recommendations
 */
async function testGetRecommendations(teamId) {
  try {
    console.log(`\n📋 Getting stored recommendations for team ${teamId}...`);
    const response = await axios.get(
      `${API_BASE_URL}/recommendations/teams/${teamId}?limit=5`
    );
    console.log('✅ Stored recommendations:', response.data.count);
    return response.data.data;
  } catch (error) {
    console.error('❌ Error getting recommendations:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Test getting recommendation statistics
 */
async function testGetStats(teamId) {
  try {
    console.log(`\n📈 Getting recommendation stats for team ${teamId}...`);
    const response = await axios.get(
      `${API_BASE_URL}/recommendations/teams/${teamId}/stats`
    );
    console.log('✅ Stats:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ Error getting stats:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  console.log('⚠️  Make sure the server is running on http://localhost:3001');
  console.log(`⚠️  Update TEAM_ID in this file to use an actual team ID from your database\n`);

  // Test health check
  try {
    const health = await axios.get('http://localhost:3001/health');
    console.log('✅ Server is running:', health.data.message);
  } catch (error) {
    console.error('❌ Server is not running. Please start the server first.');
    return;
  }

  // Create a test problem
  const problemId = await testCreateProblem();

  // Test with the provided team ID
  if (TEAM_ID && TEAM_ID !== '507f1f77bcf86cd799439011') {
    await testExtractTeamSkills(TEAM_ID);
    await testGetTeamSkills(TEAM_ID);
    await testGenerateRecommendations(TEAM_ID);
    await testGetRecommendations(TEAM_ID);
    await testGetStats(TEAM_ID);
  } else {
    console.log('\n⚠️  Please update TEAM_ID in this file to test team-related endpoints');
  }

  console.log('\n✨ Tests completed!');
}

// Run tests
runTests().catch(console.error);

