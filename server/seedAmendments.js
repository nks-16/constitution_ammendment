require('dotenv').config();
const mongoose = require('mongoose');
const Amendment = require('./models/Amendment');

async function seedAmendments() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const amendments = [
      {
        title: "Amendment 1: Freedom of Speech",
        description: "Protects the right to freedom of speech and expression",
        isVotingOpen: false,
        showResults: false
      },
      {
        title: "Amendment 2: Right to Privacy",
        description: "Establishes constitutional protection for personal privacy",
        isVotingOpen: false,
        showResults: false
      },
      // Add more amendments as needed
    ];

    await Amendment.deleteMany({}); // Clear existing
    await Amendment.insertMany(amendments);
    
    console.log('Amendments seeded successfully!');
    process.exit();
  } catch (err) {
    console.error('Error seeding amendments:', err);
    process.exit(1);
  }
}

seedAmendments();