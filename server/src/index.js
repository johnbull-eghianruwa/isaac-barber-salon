const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require("bcrypt");
const dotenv = require('dotenv');
const saltRounds = 10;
const { connectDB, IsaacDBModel, Appointment } = require('./Models/IsaacDB');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// User signup
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Create the new user with the hashed password
    const newUser = await IsaacDBModel.create({ name, email, password: hashedPassword });
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error creating user' });
  }
});

// User login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await IsaacDBModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'No account exists with this email' });
    }
    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    // Password is valid, login successful
    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'An error occurred while processing the request' });
  }
});

// Get all appointments
app.get('/bookForm', async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new appointment
app.post('/bookForm', async (req, res) => {
  const { customerName, email, date, time } = req.body;

  // Validate the input data
  if (!customerName || !email || !date || !time) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Create a new Appointment instance
  const appointment = new Appointment({ customerName, email, date, time });

  try {
    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

// Delete an appointment
app.delete('/bookForm/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
