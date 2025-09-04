const mongoose = require('mongoose');

class DatabaseConfig {
  async connect() {
    try {
      let mongoUri;

      if (process.env.NODE_ENV === 'production') {
        // Use production MongoDB URI
        mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
          throw new Error('MONGODB_URI is required in production');
        }
      } else {
        // Use local MongoDB for development if provided, else default
        mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/social-poll-platform';
      }

      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      console.log('MongoDB connected successfully at', mongoUri);
      return true;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      return false;
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('MongoDB disconnected');
    } catch (error) {
      console.error('MongoDB disconnection error:', error);
    }
  }
}

module.exports = new DatabaseConfig();
