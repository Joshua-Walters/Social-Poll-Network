const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

class DatabaseConfig {
  constructor() {
    this.mongoServer = null;
  }

  async connect() {
    try {
      let mongoUri;
      
      if (process.env.NODE_ENV === 'production') {
        // Use production MongoDB URI
        mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
          throw new Error('MONGODB_URI is required in production');
        }
      } else if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'mongodb://localhost:27017/social-poll-platform') {
        // Use provided MongoDB URI (e.g., Atlas)
        mongoUri = process.env.MONGODB_URI;
      } else {
        // Use in-memory MongoDB for development
        console.log('Starting in-memory MongoDB for development...');
        this.mongoServer = await MongoMemoryServer.create();
        mongoUri = this.mongoServer.getUri();
        console.log('In-memory MongoDB started at:', mongoUri);
      }

      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      console.log('MongoDB connected successfully');
      return true;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      return false;
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      if (this.mongoServer) {
        await this.mongoServer.stop();
        console.log('In-memory MongoDB stopped');
      }
    } catch (error) {
      console.error('MongoDB disconnection error:', error);
    }
  }
}

module.exports = new DatabaseConfig();