const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const PORT = process.env.PORT || 8000;

// In-memory storage for tasks
// let tasks = [];

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mytask'
  });

  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL database:', err);
      return;
    }
    console.log('Connected to MySQL database');
  });
// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Routes for CRUD operations
// Create a new task
app.post('/tasks', (req, res) => {
  const { title, description, status } = req.body;
  if (!title || !status) {
    return res.status(400).json({ error: 'Title and status are required' });
  }

  // const newTask = {
  //   id: tasks.length + 1,
  //   title,
  //   description: description || '',
  //   status
  // };

  // tasks.push(newTask);
  // res.status(201).json(newTask);

  const sql = 'INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)';
  connection.query(sql, [title, description, status], (err, result) => {
    if (err) {
      console.error('Error creating task:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.status(202).json({ id: result.insertId, title, description, status });
  });
});

// Read all tasks
app.get('/tasks', (req, res) => {
  const sql = 'SELECT * FROM tasks';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results);
  });
    // res.json(tasks);
  });

// Read all tasks with optional filtering and sorting
app.get('/tasks', (req, res) => {
  let sql = 'SELECT * FROM tasks';

  // Apply filtering based on status
  if (req.query.status) {
    sql += ' WHERE status = ?';
  }

  // Apply sorting based on title (ascending order)
  if (req.query.sort === 'title') {
    sql += ' ORDER BY title';
  }

  connection.query(sql, [req.query.status], (err, results) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results);
  });
});


// Search tasks by title or description
app.get('/tasks/search', (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Search query parameter (q) is required' });
  }

  const sql = 'SELECT * FROM tasks WHERE title LIKE ? OR description LIKE ?';
  const searchQuery = `%${q}%`; // wildcard (%) for partial matching
  connection.query(sql, [searchQuery, searchQuery], (err, results) => {
    if (err) {
      console.error('Error searching tasks:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results);
  });
});

  

// Update a task
app.put('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const { title, description, status } = req.body;

  const sql = 'UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?';
  connection.query(sql, [title, description, status, taskId], (err, result) => {
    if (err) {
      console.error('Error updating task:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json({ id: taskId, title, description, status });
  });
  // const taskToUpdate = tasks.find(task => task.id === taskId);
  // if (!taskToUpdate) {
  //   return res.status(404).json({ error: 'Task not found' });
  // }

  // taskToUpdate.title = title || taskToUpdate.title;
  // taskToUpdate.description = description || taskToUpdate.description;
  // taskToUpdate.status = status || taskToUpdate.status;

  // res.json(taskToUpdate);
});

// Delete a task
app.delete('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);

  const sql = 'DELETE FROM tasks WHERE id = ?';
  connection.query(sql, taskId, (err, result) => {
    if (err) {
      console.error('Error deleting task:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.sendStatus(204);
  });
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
module.exports = connection;