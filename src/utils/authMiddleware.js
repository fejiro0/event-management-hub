import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Adjust this path as needed

const isAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    req.user = user; // Attach the user to the request
    next();  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export default isAdmin; // Ensure this is the default export
