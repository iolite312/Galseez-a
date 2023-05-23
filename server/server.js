require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const cookieParser = require('cookie-parser');
const { user, marker } = require('./models');

const app = express();
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(cookieParser()) // for parsing cookies

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

    let newUser;
    if (req.body.id) {
      newUser = new user({
        _id: req.body.id,
        userName: req.body.userName,
        password: hashedPassword,
        token: uuidv4()
      });
    } else {
      newUser = new user({
        _id: new mongoose.Types.ObjectId(),
        userName: req.body.userName,
        password: hashedPassword,
        token: uuidv4()
      });
    }

    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json('Internal server error');
  }
});
app.post('/user/login', async (req, res) => {
  try {
    const userSearch = await user.findOne({ userName: req.body.userName })
    if (!userSearch) return res.status(404).json('Username not found')
    const passwordCheck = await bcrypt.compare(req.body.password, userSearch.password)
    if (!passwordCheck) return res.status(401).json('Unauthorized | Wrong password')

    await userSearch.updateOne({
      $set: {
        token: uuidv4()
      }
    })

    const updatedUser = await user.findOne({ userName: req.body.userName })
    res.status(200).json(updatedUser)
  } catch (err) {
    console.error(err)
    res.status(500).json('Internal server error')
  }
})
app.post('/user/validate', async (req, res) => {
  try {
    const search = await user.findOne({ _id: req.cookies.id })
    if (search._id == req.cookies.id && search.token == req.cookies.token) {
      return res.status(200).json('Authorized')
    }
    res.status(401).clearCookie('token').clearCookie('id').json('Unauthorized')
  } catch(err) {
    console.error(err)
    res.status(500).json('Internal server error')
  }
})
app.post('/marker/create', async (req, res) => {
  try {
    const markerSearch = await marker.findOne({ 'object.name': req.body.object[0]})
    if (markerSearch) return res.status(400).json(req.body.object[0] + ': already exists')

    const createMarker = new marker({
      lat: req.body.lat,
      lng: req.body.lng,
      object: {
        name: req.body.object.name,
        object: req.body.object.object,
        icon: req.body.object.icon,
        visible: req.body.object.visible,
        friendOrFoe: req.body.object.friendOrFoe
      },
      user: req.body.id
    })
    await createMarker.save()
    res.status(201).json(createMarker);
  } catch {
    console.error(err)
    res.status(500).json('Internal server error')
  }
})
app.post('/marker/get', async (req, res) => {
  try {
    const markerSearch = await marker.findOne({ _id: req.body._id})
    if (!markerSearch) return res.status(400).json(req.body._id + ": doesn't exists")
    res.status(200).json(markerSearch)
  } catch(err) {

  }
})
app.listen(process.env.PORT, () => { console.log(`Listening on port: http://localhost:${process.env.PORT}`) })