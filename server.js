const app = require('./app');
const express = require('express');
const passport = require('passport');
const cookieSession = require('cookie-session');
const { errorHandler } = require('./middleware/errorMiddleware');
const PORT = process.env.PORT || 5000;
const connectDB = require('./config/db');
const cors = require('cors');
const passportSetup = require('./passport');
const authRoutes = require('./user/userRoutes');

//Connect to Database
connectDB();

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to Send Easy' });
});

//Routes
app.use('/api/users', require('./user/userRoutes'));
app.use(errorHandler);
app.use(
  cookieSession({
    name: 'Session',
    keys: ['aryansaini'],
    maxAge: 24 * 60 * 60 * 100,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  })
);

app.use('/auth', authRoutes);
app.listen(PORT, () => console.log(`Server sarted on port ${PORT}`));
