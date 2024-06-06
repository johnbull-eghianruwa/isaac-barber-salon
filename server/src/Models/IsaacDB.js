const mongoose = require('mongoose');

// Define IsaacDB schema and model for user signup
const IsaacDBSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

const IsaacDBModel = mongoose.model('Isaac', IsaacDBSchema);

// Define the Appointment schema and model
const appointmentSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

// Define the function to connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/isaacDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = { connectDB, IsaacDBModel, Appointment };
