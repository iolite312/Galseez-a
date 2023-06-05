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
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:5173"
  },
  maxHttpBufferSize: 1e8
});

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
  } catch (err) {
    console.error(err)
    res.status(500).json('Internal server error')
  }
})
io.on('connection', (socket) => {
  console.log('A new connection has appeard socketID: ' + socket.id + " on this timestamp: " + Date())
  // socket.emit('placeMarker')
  socket.on('sendMarker', (arg) => {
    console.log(arg)
    socket.broadcast.emit('placeMarker', arg)
  })

  getAllMarkers()
    .then((markers) => {
      socket.emit('allMarkers', markers);
    })
    .catch((error) => {
      console.error(error);
      socket.emit('allMarkers', 'Server Error');
    });
})
app.post('/marker/create', async (req, res) => {
  try {
    const markerSearch = await marker.findOne({ 'object.name': req.body.object.name })
    if (markerSearch) return res.status(400).json(req.body.object.name + ': already exists')

    const createMarker = new marker({
      lat: req.body.lat,
      lng: req.body.lng,
      object: {
        name: req.body.object.name,
        object: req.body.object.object,
        visible: req.body.object.visible,
        friendOrFoe: req.body.object.friendOrFoe
      },
      user: req.body.id
    })
    await createMarker.save()
    res.status(201).json(createMarker);
  } catch (err) {
    console.error(err)
    res.status(500).json('Internal server error')
  }
})
app.post('/marker/get', async (req, res) => {
  try {
    const markerSearch = await marker.findOne({ _id: req.body._id })
    if (!markerSearch) return res.status(404).json(req.body._id + ": doesn't exists")
    res.status(200).json(markerSearch)
  } catch (err) {
    console.error(err)
    res.status(500).json('Internal server error')
  }
})
async function getAllMarkers() {
  try {
    const markerSearch = await marker.find().populate({ path: 'user' }).exec();
    if (!markerSearch || markerSearch.length === 0) {
      return 'No markers';
    }
    return markerSearch;
  } catch (error) {
    console.error(error);
    throw new Error('Server Error');
  }
}
//TODO still works but this endpoint will be DEPCRECATED
app.post('/marker/all', async (req, res) => {
  try {
    const markerSearch = await marker.find().populate({ path: 'user' }).exec();
    if (!markerSearch || markerSearch.length === 0) {
      return res.status(404).json("No markers exist");
    }
    res.status(200).json(markerSearch);
  } catch (err) {
    console.error(err);
    res.status(500).json('Internal server error');
  }
});
app.post('/marker/destroy', async (req, res) => {
  try {
    const markerSearch = await marker.findOne({ _id: req.body._id })
    if (!markerSearch) return res.status(404).json(req.body._id + ": doesn't exists")

    const markerDelete = await marker.deleteOne({ _id: req.body._id })
    if (markerDelete.deletedCount !== 1) return res.status(500).json('Marker was not deleted')
    res.status(200).json('Deletion successful')
  } catch (err) {
    console.error(err)
    res.status(500).json('Internal server error')
  }
})
app.post('/marker/update', async (req, res) => {
  try {
    const markerSearch = await marker.findOne({ _id: req.body._id })
    if (!markerSearch) return res.status(404).json(req.body._id + ": doesn't exists")

    await markerSearch.updateOne({
      $set: {
        lat: req.body.lat,
        lng: req.body.lng,
        object: {
          name: req.body.object.name,
          object: req.body.object.object,
          visible: req.body.object.visible,
          friendOrFoe: req.body.object.friendOrFoe
        },
      }
    })
    const updatedMarker = await marker.findOne({ _id: req.body._id })
    res.status(201).json(updatedMarker)

  } catch (err) {
    console.error(err)
    res.status(500).json('Internal server error')
  }
})

const port = process.env.PORT || 3000
server.listen(port, () => { console.log(`Listening on port: http://localhost:${port}`) })