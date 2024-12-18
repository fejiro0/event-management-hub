import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Assuming this is the correct path

const router = express.Router();

// Environment variable for secret key
const JWT_SECRET = process.env.JWT_SECRET || 'aIolnC0R1sH72ABX';

// Register (Signup) Route
router.post('/signup', async (req, res) => {
  const { fullName, email, password, role, preferences } = req.body;

  // Check if required fields are provided
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'Full name, email, and password are required' });
  }

  // Validate role if provided (optional field)
  if (role && role !== 'admin' && role !== 'user') {
    return res.status(400).json({ message: 'Invalid role, must be either "admin" or "user"' });
  }

  try {
    // Check if user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      fullName,
      email,
      password,
      role: role || 'user', // Default role to 'user'
      preferences: preferences || {}, // Optional preferences field
    });

    // Save user to database
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send success response with token and user details
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        preferences: newUser.preferences,
      },
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Check if both email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Compare provided password with stored hash
    const isMatch = await (password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send response with token, role, and user details
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify route
router.get('/verify', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract the token from the authorization header
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Verify the token
    res.status(200).json({ message: 'Token is valid', userId: decoded.userId });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

export default router;
