const express = require('express');
const router = express.Router();
const connection = require('../config/connection');
const { verifyToken, isAdmin } = require('../middleware/tokenNadminHandlers');

// Route to get tasks
router.get('/getTask', verifyToken, async (req, res) => {
    try {
        const userId = req.email;
        const query = 'SELECT * FROM tasks WHERE user_id = ?';
        connection.query(query, userId, (error, result) => {
            if (error) res.status(500).json("Failed");
            res.status(200).json({
                message: "Successfully get task",
                task: result
            })
        })
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Error fetching tasks' });
    }
});
  
  // Route to get all tasks
  router.get('/getAllTask', verifyToken, async (req, res) => {
    try {
        const userRole = req.role;
        if (req.role === "admin") {
            const userId = req.email;
            const query = 'SELECT * FROM tasks';
            connection.query(query, (error, result) => {
                if (error) res.status(500).json("Failed");
                res.status(200).json({
                    message: "Successfully get task",
                    task: result
                })
            })
        } else res.status(404).json("You are not an admin");

    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Error fetching tasks' });
    }
});
  
  // Read all tasks with optional filtering and sorting
  router.get('/tasks', (req, res) => {
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
  router.get('/tasks/search', (req, res) => {
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
  
// Route to add a task
router.post('/addTask', verifyToken, async (req, res) => {
    try {
        const userId = req.email;
        const { title, description, status } = req.body;
        const query = 'INSERT INTO tasks (title, description, status, user_id) VALUES (?, ?, ?, ?)';
        await connection.query(query, [title, description, status, userId]);

        res.status(201).json({ message: 'Task created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error creating task' });
    }
});
  
// Route to update a task  
  router.put('/updateTask/:id', verifyToken, async (req, res) => {
    try {
        const userId = req.email; // Retrieve user ID from the authenticated user
        const taskId = req.params.id;

        const query = 'UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ? AND user_id = ?';
        const values = [
            req.body.title,
            req.body.description,
            req.body.status,
            taskId,
            userId
        ]

        connection.query(query, values, (error, result) => {
            if (error) res.status(500).json("Failed");
            res.status(200).json({
                message: "Successfully Updated"
            })
        })

    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Error updating task' });
    }
});
  
// Route to delete a task ( admin only)
router.delete('/tasks/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const taskId = req.params.id;
        const query = 'DELETE FROM tasks WHERE id = ?';
        await dbConnection.query(query, [taskId]);
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Error deleting task' });
    }
});

// Route to delete user's own task
router.delete('/deleteTask/:id', verifyToken, async (req, res) => {
    try {
        const userId = req.email;
        const taskId = req.params.id;
        const query = 'DELETE FROM tasks WHERE id = ? AND user_id = ?';
        const values = [
            taskId,
            userId
        ]

        connection.query(query, values, (error, result) => {
            if (error) res.status(500).json("Failed");
            res.status(200).json({
                message: "Successfully deleted",
                result: result
            })
        })
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Error deleting task'});
    }
});

module.exports=router;

