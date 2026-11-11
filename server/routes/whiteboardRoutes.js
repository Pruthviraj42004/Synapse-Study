const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, (req, res) => {
  res.json({ message: 'Whiteboard routes working' });
});

module.exports = router;