const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const connection = require('../config/connection');
const { verifyToken } = require('../middleware/tokenNadminHandlers');
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    console.log(username);
    const hashedPassword = bcrypt.hashSync(password, 10);
    const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
    await connection.query(query, [username, email, hashedPassword, role]);
    res.status(201).json({ message: 'User registered successfully' });
} catch (err) {
    console.error('Error occured in registering!', err);
    res.status(500).json({ err: 'Error occured while registering!' });
}
  });

  router.post('/login', async (req, res) => {
    try {
      const sql = "SELECT * FROM users WHERE username = ?";
      const values = [req.body.username]

      connection.query(sql, [values], async (err, result) => {
          if (err) return res.json("Error while login!");
          if (result.length > 0) {
              const isValid = await bcrypt.compare(req.body.password, result[0].password);
              if (isValid) {
                  const token = jwt.sign({
                      email: result[0].email,
                      username: result[0].username,
                      role : result[0].role
                  }, process.env.ACCESS_TOKEN_SECRET, {
                      expiresIn: '1h'
                  });

                  return res.status(200).json({
                      authentication_token: token,
                      message: 'Login Successfully'
                  });
              } else {
                  return res.status(402).json("Login Failed");
              }
          } else return res.status(500).json("Login Failed");
      })
  } catch (err) {
      console.log(err);
      res.status(500).json({ err: 'Login Failed' });
  }
  });
  
  module.exports = router;