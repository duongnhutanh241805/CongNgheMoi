const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware
app.use(session({
  secret: 'my-secret-key-12345',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}));

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
app.use('/auth', authRoutes);
app.use('/', productRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
