// ====== DEPENDENCIES ====
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const IsaacDBModel = require('./Models/IsaacDB')
const bcrypt = require("bcrypt");
const dotenv = require('dotenv');
const saltRounds = 10;

const app = express();
const port = process.env.PORT ||3001;

app.use(cors((req, callback) => {
  callback(null, { origin: true, credentials: true });
}));


app.use(express.json());
mongoose.connect('mongodb://127.0.0.1:27017/isaacDB');

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  IsaacDBModel.findOne({ email: email })
    .then(user => {
      if (user) {
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            console.error('Error comparing passwords:', err);
            res.status(500).json({ error: 'An error occurred while processing the request' });
          } else if (result) {
            res.status(200).json({ data: 'success', token: 'your_auth_token_here' });
          } else {
            res.status(401).json({ error: 'The password is incorrect' });
          }
        });
      } else {
        res.status(404).json({ error: 'No account existed' });
      }
    })
    .catch(error => {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'An error occurred while processing the request' });
    });
});

app.post('/signup', (req, res) => {
  const {name, email, password } = req.body;

  // Hash the password using bcrypt
  bcrypt.hash(password, 10)
    .then(hash => {
      // Create the new user with the hashed password
      IsaacDBModel.create({name, email, password: hash })
        .then(isaac => res.json(isaac))
        .catch(err => res.json(err));
    })
    .catch(err => {
      console.error(err.message);
      res.status(500).json({ error: 'Error hashing password' });
    });
}); 



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});