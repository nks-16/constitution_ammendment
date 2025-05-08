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

// Restrict CORS to specific frontend domain
app.use(cors({
  origin: ['https://constitution-ammendment.vercel.app', 'http://localhost:3000'],
  credentials: true,
}));


app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vote', voteRoutes);
app.use('/api/v1/amendments', amendmentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
