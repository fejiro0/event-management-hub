import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Assuming this is the correct path

const router = express.Router();

// Signup route with role validation
router.post('/signup', async (req, res) => {
  const { fullName, email, password, role } = req.body;

  // Check if any required fields are missing
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate the role to make sure it is either 'admin' or 'user'
  if (role && role !== 'admin' && role !== 'user') {
    return res.status(400).json({ message: 'Invalid role, must be either "admin" or "user"' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role: role || 'user', // Default to 'user' if role is not provided
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      'your-secret-key',
      { expiresIn: '1h' }
    );

    res.status(201).json({ token });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      'your-secret-key',
      { expiresIn: '1h' }
    );

    // Send token and role as response
    res.status(200).json({ token, role: user.role });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
