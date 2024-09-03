const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Validate email function
const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@up\.ac\.th$/;
  return emailRegex.test(email);
};

// Clean email function
const cleanEmail = (email) => {
  return email.toLowerCase().trim();
};

// Check if email exists
const emailExists = async (email) => {
  const cleanedEmail = cleanEmail(email);
  console.log('Checking if email exists:', cleanedEmail);
  const user = await User.findOne({ email: cleanedEmail });
  console.log('User found:', !!user);
  return !!user;
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanedEmail = cleanEmail(email);

    console.log('Registration attempt:', cleanedEmail);

    // Validate input
    if (!cleanedEmail || !password) {
      return res.status(400).json({ message: 'กรุณากรอกอีเมลและรหัสผ่านทั้งสอง' });
    }

    // Validate email format
    if (!isValidEmail(cleanedEmail)) {
      return res.status(400).json({ message: 'กรุณาใช้อีเมล @up.ac.th เท่านั้น' });
    }

    // Check if user already exists
    const exists = await emailExists(cleanedEmail);
    if (exists) {
      console.log('User already exists:', cleanedEmail);
      return res.status(400).json({ message: 'อีเมลนี้มีผู้ใช้งานแล้ว' });
    }

    // Create new user
    const user = new User({ email: cleanedEmail, password });
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    console.log('User registered successfully:', cleanedEmail);
    res.status(201).json({ message: 'ลงทะเบียนผู้ใช้สำเร็จ' });
  } catch (error) {
    console.error('ข้อผิดพลาดในการลงทะเบียน:', error);
    res.status(500).json({ message: 'ข้อผิดพลาดในการลงทะเบียน', error: error.message });
  }
});

// Check email availability
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    const cleanedEmail = cleanEmail(email);

    console.log('Checking email availability:', cleanedEmail);

    // Validate email format
    if (!isValidEmail(cleanedEmail)) {
      return res.status(400).json({ message: 'กรุณาใช้อีเมล @up.ac.th เท่านั้น', available: false });
    }

    const exists = await emailExists(cleanedEmail);
    const available = !exists;
    console.log('Email availability result:', { email: cleanedEmail, available });
    res.json({ available, message: available ? 'อีเมลนี้สามารถใช้ได้' : 'อีเมลนี้ถูกใช้แล้ว' });
  } catch (error) {
    console.error('ข้อผิดพลาดในการตรวจสอบอีเมล:', error);
    res.status(500).json({ message: 'ข้อผิดพลาดของเซิร์ฟเวอร์', error: error.message, available: false });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanedEmail = cleanEmail(email);

    console.log('Login attempt:', cleanedEmail);

    // Validate email format
    if (!isValidEmail(cleanedEmail)) {
      return res.status(400).json({ message: 'กรุณาใช้อีเมล @up.ac.th เท่านั้น' });
    }

    // Check if user exists
    const user = await User.findOne({ email: cleanedEmail });
    if (!user) {
      console.log('Login failed: User not found:', cleanedEmail);
      return res.status(400).json({ message: 'ข้อมูลการเข้าสู่ระบบไม่ถูกต้อง' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Login failed: Incorrect password:', cleanedEmail);
      return res.status(400).json({ message: 'ข้อมูลการเข้าสู่ระบบไม่ถูกต้อง' });
    }

    // Create and assign token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('Login successful:', cleanedEmail);
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการเข้าสู่ระบบ:', error);
    res.status(500).json({ message: 'ข้อผิดพลาดของเซิร์ฟเวอร์', error: error.message });
  }
});

// Verify Token (ไม่มีการเปลี่ยนแปลง)
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    }
    res.json({ user });
  } catch (error) {
    console.error('ข้อผิดพลาดในการตรวจสอบโทเค็น:', error);
    res.status(401).json({ message: 'โทเค็นไม่ถูกต้อง' });
  }
});

module.exports = router;