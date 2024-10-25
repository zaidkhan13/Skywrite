import mongoose from "mongoose"; // imports the Mongoose library

const mongoURI = "mongodb://localhost:27017/SkyWriteDB"; // URI used to connect to the MongoDB database.

async function connectToDatabase() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB Successfully!');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

// Export the function
export default connectToDatabase;