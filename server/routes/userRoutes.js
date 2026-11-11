const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// Placeholder routes - will be implemented later
router.get('/', auth, (req, res) => {
  res.json({ message: 'User routes working' });
});

module.exports = router;