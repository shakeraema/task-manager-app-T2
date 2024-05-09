const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const { authorization } = req.headers;
    try {
        const token = authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const { email, username, role } = decoded;
        req.email = email;
        req.name = username;
        req.role = role;
        next();
    } catch {
        next('Authentication Failure');
    }
}

const isAdmin = (req, res, next) => {
    if (req.role !== 'admin') {
        return res.status(403).json({ error: 'Authorization failed!' });
    }
    next();
};

module.exports = { verifyToken, isAdmin };