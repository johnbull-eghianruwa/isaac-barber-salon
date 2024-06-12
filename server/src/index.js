const express = require ('express');
const cors = require ('cors');
const bcrypt = require ("bcrypt");
const jwt = require ('jsonwebtoken');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const saltRounds = 10;
const { body, validationResult } = require('express-validator');
const { connectDB, IsaacDBModel, Appointment, BookingDate } = require('./Models/IsaacDB');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

connectDB

const STORE_OPENING_TIME = 9; // Store opens at 9 AM
const STORE_CLOSING_TIME = 17; // Store closes at 5 PM
const INTERVAL = 30; // Interval in minutes

// CORS middleware to allow cross-origin requests
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user with the hashed password and role
    const newUser = await IsaacDBModel.create({ name, email, password: hashedPassword, role });

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Secured endpoint for getting users
app.get('/api/users', async (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = await jwt.verify(token, 'secret');

    // Check if the user is an admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Fetch all users
    const users = await IsaacDBModel.find({}, { name: 1, email: 1, role: 1 });

    res.status(200).json(users);
  } catch (error) {
    console.error(error.message);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// User login
app.post('/api/login', async (req, res) => {
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
    const idToken = jwt.sign(
      {
        email: user.email,
        role: user.role,
      },
      'secret'
    );

    res.status(200).json({ message: 'Login successful', idToken });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'An error occurred while processing the request' });
  }
});

// Existing secured endpoint for getting users
app.get('/users', async (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = await jwt.verify(token, 'secret');

    // Check if the user is an admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Fetch all users
    const users = await IsaacDBModel.find({}, { name: 1, email: 1, role: 1 });

    res.status(200).json(users);
  } catch (error) {
    console.error(error.message);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Book an appointment
app.post('/bookForm', async (req, res) => {
  const { customerName, email, date, time } = req.body;
  const appointment = new Appointment({
    customerName,
    email,
    date,
    time,
  });

  try {
    const newAppointment = await appointment.save();
    res.status(201).json(newAppointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Cancel an appointment
app.delete('/bookForm/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    await appointment.remove();
    res.json({ message: 'Appointment canceled successfully!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// BookingDate routes
app.post(
  '/api/bookingDates',
  [
    body('justDate').isDate().withMessage('justDate must be a valid date'),
    body('dateTime')
      .isDate()
      .withMessage('dateTime must be a valid date')
      .custom((value, { req }) => {
        if (value < req.body.justDate) {
          throw new Error('dateTime must be on or after justDate');
        }
        return true;
      }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { justDate, dateTime } = req.body;
      const bookingDate = new BookingDate({ justDate, dateTime });
      await bookingDate.save();
      res.status(201).json(bookingDate);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

app.get('/api/bookingDates', async (req, res) => {
  try {
    const bookingDates = await BookingDate.find();
    res.json(bookingDates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/bookingDates/:id', getBookingDate, (req, res) => {
  res.json(res.bookingDate);
});

app.put(
  '/api/bookingDates/:id',
  getBookingDate,
  [
    body('justDate').isDate().withMessage('justDate must be a valid date'),
    body('dateTime')
      .isDate()
      .withMessage('dateTime must be a valid date')
      .custom((value, { req }) => {
        if (value < req.body.justDate) {
          throw new Error('dateTime must be on or after justDate');
        }
        return true;
      }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { justDate, dateTime } = req.body;
    res.bookingDate.justDate = justDate;
    res.bookingDate.dateTime = dateTime;
    try {
      const updatedBookingDate = await res.bookingDate.save();
      res.json(updatedBookingDate);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

app.delete('/api/bookingDates/:id', getBookingDate, async (req, res) => {
  try {
    await res.bookingDate.remove();
    res.json({ message: 'BookingDate deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function getBookingDate(req, res, next) {
  let bookingDate;
  try {
    bookingDate = await BookingDate.findById(req.params.id);
    if (bookingDate == null) {
      return res.status(404).json({ message: 'Cannot find bookingDate' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.bookingDate = bookingDate;
  next();
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});