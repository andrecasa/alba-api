require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
const port = 3000;

app.use(express.json());

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const userRoutes = require('./routes/users');
app.use('/users', userRoutes);

const avatarRoutes = require('./routes/avatar');
app.use('/avatar', avatarRoutes);

app.use('/upload', express.static('upload'));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

