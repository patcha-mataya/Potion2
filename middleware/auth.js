import jwt from 'jsonwebtoken';

// Middleware to authenticate JWT token
export function authenticateToken(req, res, next) {
    // Get the token from the Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // If there's no token, deny access
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = decoded; // Attach decoded user data to request object
        next(); // Proceed to the next middleware or route handler
    });
}
