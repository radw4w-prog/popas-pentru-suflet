// backend/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Mongoose 7+ nu mai are nevoie de aceste opțiuni, dar le păstrăm pentru claritate
    });
    
    console.log(`MongoDB conectat: ${conn.connection.host}`);
    
    // Gestionare evenimente conexiune
    mongoose.connection.on('error', (err) => {
      console.error('Eroare conexiune MongoDB:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB deconectat. Se încearcă reconectarea...');
    });
    
    return conn;
  } catch (error) {
    console.error('Eroare la conectarea MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;