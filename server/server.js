require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { user } = require('./models');

const app = express();
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

const saltRounds = 10;

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

app.get('/', (req, res) => {
  res.status(200).send('This is the backend API from Galseez')
})
app.post('/user/create', async (req, res) => {
  try {
    const userSearch = await user.findOne({ userName: req.body.userName });
    if (userSearch) return res.status(400).json('Username taken');

    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds); // Await the hashing process

    const newUser = new user({
      userName: req.body.userName,
      password: hashedPassword, // Assign the hashed password
      token: uuidv4()
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    console.error(err)
    res.status(500).json('Internal server error')
  }
})
app.post('/user/login', async (req, res) => {
  try {
    const userSearch = await user.findOne({ userName: req.body.userName})
    if (!userSearch) return res.status(404).json('Username not found')
    const passwordCheck = await bcrypt.compare(req.body.password, userSearch.password)
    if (!passwordCheck) return res.status(401).json('Unauthorized | Wrong password')

    userSearch.updateOne(
      {$set: {
          token: uuidv4()
        }
      }
    )
    .then(res.status(200).json(userSearch))
    .catch(err => {
      res.status(500).json('Internal server error')
      console.error(err);
    });
  } catch(err) {
    console.error(err)
    res.status(500).json('Internal server error')
  }
})
app.post('user/validate', (req, res) => {

})
app.listen(process.env.PORT, () => { console.log(`Listening on port: http://localhost:${process.env.PORT}`) })