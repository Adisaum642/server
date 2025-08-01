const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register
router.post('/signup', async (req, res) => {
  console.log('🔄 Signup request received');
  console.log('📥 Request body:', req.body);
  
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      console.log('❌ Validation failed: Missing fields');
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password.length < 6) {
      console.log('❌ Validation failed: Password too short');
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    console.log('✅ Basic validation passed');

    // Check if user exists
    console.log('🔍 Checking if user exists...');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }

    console.log('✅ User does not exist, proceeding...');

    // Hash password
    console.log('🔐 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('✅ Password hashed successfully');

    // Create user
    console.log('👤 Creating new user...');
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    const savedUser = await user.save();
    console.log('✅ User saved to database:', savedUser._id);

    // Generate JWT
    console.log('🎫 Generating JWT token...');
    const token = jwt.sign(
      { userId: savedUser._id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );
    console.log('✅ JWT token generated');

    console.log('🎉 Signup successful, sending response...');
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email
      }
    });
  } catch (error) {
    console.error('💥 Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login (add similar logging)
router.post('/login', async (req, res) => {
  console.log('🔄 Login request received');
  console.log('📥 Request body:', { email: req.body.email, password: '[HIDDEN]' });
  
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      console.log('❌ Login validation failed: Missing fields');
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check if user exists
    console.log('🔍 Finding user...');
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('✅ User found, checking password...');

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Password mismatch');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('✅ Password verified, generating token...');

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    console.log('🎉 Login successful');
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('💥 Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
