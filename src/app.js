const express = require('express');

const app = express();

// Middleware used to get JSON data from request body₹
app.use(express.json());

// app.use('/api/users', require('./routes/user.routes'));
// app.use('/api/teams', require('./routes/team.routes'));

module.exports = app;policies