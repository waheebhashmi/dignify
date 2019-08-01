const express = require('express');
const router = express.Router();
const path = require('path');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.sendFile(path.join(__dirname, '../views', 'dignifyuse.html')));

// Dashboard
router.get('/', ensureAuthenticated, (req, res) =>
  res.sendFile(path.join(__dirname, '../views', 'dignifyuse.html'), {
    user: req.user
  })
);

module.exports = router;
