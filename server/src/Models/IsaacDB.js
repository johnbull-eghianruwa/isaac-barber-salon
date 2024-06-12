// Models/IsaacDB.js
const mongoose = require('mongoose');

const IsaacSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String
});

const IsaacDBModel = mongoose.model('Isaac', IsaacSchema);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('MongoDB connected...');

  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = {
  connectDB,
  IsaacDBModel,
  Appointment: mongoose.model('Appointment', new mongoose.Schema({
    customerName: String,
    email: String,
    date: String,
    time: String
  })),
  BookingDate: mongoose.model('BookingDate', new mongoose.Schema({
    justDate: Date,
    dateTime: Date
  }))
};
