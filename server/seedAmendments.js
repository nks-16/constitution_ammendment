const mongoose = require('mongoose');
const Amendment = require('./models/Amendment'); // Adjust path as needed

// Replace with your MongoDB connection string
const MONGO_URI = 'mongodb+srv://mind-quest:Dheeraj2004@mindquest.oefn1.mongodb.net/constitution?retryWrites=true&w=majority&appName=mindquest'; // or your Atlas URL

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');

  // Create 15 amendments
  const amendments = Array.from({ length: 15 }, (_, i) => ({
    title: `Amendment ${i + 1}`,
    description: '  ', // empty description
  }));

  try {
    await Amendment.insertMany(amendments);
    console.log('15 amendments added successfully!');
  } catch (err) {
    console.error('Error inserting amendments:', err);
  } finally {
    mongoose.connection.close();
  }
})
.catch(err => console.error('MongoDB connection error:', err));
