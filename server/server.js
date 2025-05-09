const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const voteRoutes = require('./routes/voteRoutes');
const amendmentRoutes = require('./routes/amendmentRoutes');
const cors = require('cors');

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'https://constitution-ammendment.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));



app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vote', voteRoutes);
app.use('/api/v1/amendments', amendmentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
