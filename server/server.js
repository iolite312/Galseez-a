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
app.post('/user/delete', async (req, res) => {
  try {
    const userSearch = await user.findOne({ _id: req.body._id })
    if (!userSearch) return res.status(404).json(req.body._id + ": doesn't exists")

    const userDelete = await user.deleteOne({ _id: req.body._id })
    if (userDelete.deletedCount !== 1) return res.status(500).json('User was not deleted')
    res.status(200).json('Deletion successful')
  } catch (err) {
    console.error(err)
    res.status(500).json('Internal server error')
  }
})
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
app.post('/user/all', async (req, res) => {
  try {
    const userSearch = await user.find()
    if (!userSearch) return res.status(404).json('No users exists')

    res.status(200).json(userSearch)
  } catch(err) {
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
  socket.on('createMarker', (data) => {
    createMarker(data)
      .then((markers) => {
        socket.emit('createMarker', markers)
      })
      .catch((error) => {
        console.log(error)
        socket.emit('createMarker', 0)
      })
  })
  socket.on('updateMarker', (data) => {
    updateMarker(data)
      .then((markers) => {
        socket.emit('updateMarker', markers)
      })
      .catch((error) => {
        console.log(error)
        socket.emit('updateMarker', 0)
      })
  })

  socket.on('allMarkers', () => {
    getAllMarkers()
      .then((markers) => {
        io.emit('allMarkers', markers);
      })
      .catch((error) => {
        console.error(error);
        socket.emit('allMarkers', 'Server Error');
      });
  })

  getAllMarkers()
    .then((markers) => {
      io.emit('allMarkers', markers);
    })
    .catch((error) => {
      console.error(error);
      socket.emit('allMarkers', 'Server Error');
    });
  socket.on('deleteMarker', (arg) => {
    destroyMarker(arg)
      .then((destroy) => {
        socket.emit('RdeleteMarker', destroy)
      })
      .catch((err) => {
        console.log(err)
        socket.emit('RdeleteMarker', 'Server Error')
      })
  })
})
async function createMarker(data) {
  try {
    const markerSearch = await marker.findOne({ 'object.name': data[2] })
    if (markerSearch) return 2

    const createMarker = new marker({
      lat: data[0],
      lng: data[1],
      object: {
        name: data[2],
        object: data[4],
        visible: data[5],
        friendOrFoe: data[3]
      },
      user: data[6]
    })
    await createMarker.save()
    return 1
  } catch (err) {
    console.error(err)
    throw new Error('Server Error')
  }
}
async function updateMarker(data) {
  try {
    const markerSearch = await marker.findOne({ _id: data[0] })
    if (!markerSearch) return 2

    await markerSearch.updateOne({
      $set: {
        lat: data[1],
        lng: data[2],
        object: {
          name: data[3],
          object: data[5],
          visible: data[6],
          friendOrFoe: data[4]
        },
        orderStrike: data[7]
      }
    })
    return 1

  } catch (err) {
    console.error(err)
    throw new Error("Server Error")
  }
}
async function getAllMarkers() {
  try {
    const markerSearch = await marker.find().populate({ path: 'user' }).populate({ path: 'orderStrike' }).exec();
    if (!markerSearch || markerSearch.length === 0) {
      return 'No markers';
    }
    return markerSearch;
  } catch (error) {
    console.error(error);
    throw new Error('Server Error');
  }
}
async function destroyMarker(id) {
  try {
    const markerSearch = await marker.findOne({ _id: id })
    if (!markerSearch) return 404

    const markerDelete = await marker.deleteOne({ _id: id })
    if (markerDelete.deletedCount !== 1) return 0
    return 1
  } catch (err) {
    console.error(err)
    throw new Error('Server Error');
  }
}

const port = process.env.PORT || 3000
server.listen(port, () => { console.log(`Listening on port: http://localhost:${port}`) })