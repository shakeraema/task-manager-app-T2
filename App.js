const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dotenv = require('dotenv');

const app = express();
const PORT = process.env.PORT || 8000;

// In-memory storage for tasks
// let tasks = [];

// Middleware to parse JSON bodies
app.use(bodyParser.json());
dotenv.config();
// Routes for CRUD operations
app.use('/users', userRoutes);
app.use('/tasks', taskRoutes);





// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// module.exports = connection;