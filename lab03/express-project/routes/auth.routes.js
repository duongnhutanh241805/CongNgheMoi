const express = require('express');
const router = express.Router();

// Show login page
router.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/');
  }
  res.render('login', { error: null });
});

// Handle login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Simple authentication (username: admin, password: admin)
  if (username === 'admin' && password === 'admin') {
    req.session.userId = 1;
    req.session.username = username;
    res.redirect('/');
  } else {
    res.render('login', { error: 'Sai tên đăng nhập hoặc mật khẩu!' });
  }
});

// Handle logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect('/auth/login');
  });
});

module.exports = router;
