//import express from 'express';
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// author and version from our package.json file
// const { author, version } = require('../package.json');

const logger = require('./logger');
const pino = require('pino-http')({
  // Use our default logger instance, which is already configured
  logger,
});

// modifications to src/app.js
const passport = require('passport');
const authenticate = require('./auth');

const app = express();

const { createErrorResponse } = require('./response');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Use pino logging middleware
app.use(pino);

// Use helmetjs security middleware
app.use(helmet());

var corsOptions = {
  origin: 'http://localhost:1234',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Use CORS middleware so we can make requests across origins
app.use(cors(corsOptions));

// Use gzip/deflate compression middleware
app.use(compression());

// Set up our passport authentication middleware
passport.use(authenticate.strategy());
app.use(passport.initialize());

// modifications to src/app.js
// Remove `app.get('/', (req, res) => {...});` and replace with:
// Define our routes
app.use('/', require('./routes'));

// Add 404 middleware to handle any requests for resources that can't be found
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    error: {
      message: 'not found',
      code: 404,
    },
  });
});

// Add error-handling middleware to deal with anything else
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // We may already have an error response we can use, but if not,
  // use a generic `500` server error and message.
  const status = err.status || 500;
  const message = err.message || 'unable to process request';

  // If this is a server error, log something so we can see what's going on.
  if (status > 499) {
    logger.error({ err }, `Error processing request`);
  }

  const data = createErrorResponse(status, message);

  res.status(status).json({
    ...data,
  });
});

// Export our `app` so we can access it in server.js
module.exports = app;




// import bcrypt from 'bcrypt';

// import cors from 'cors';

// import { getUsers, getUserByID, createUser, login, getShoes } from './database/database.js';

// const saltRounds = 10

// const app = express();

// app.use(express.json());
// app.use(express.urlencoded({extended: true}));
// app.use(cors());

// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     next();
// });

// app.get('/users', async (req, res) => {
//     const users = await getUsers();
//     if (!users) return res.status(500).send('No users in database');
//     res.json(users);
// })

// app.get('/shoes', async (req, res) => {
//     const users = await getShoes();
//     if (!users) return res.status(500).send('No shoes in database');
//     res.json(users);
// })

// app.get('/users/:id', async (req, res) => {
//     const id = req.params.id;
//     const user = await getUserByID(id);
//     if (!user) return res.status(500).send('No user found');
//     res.json(user);
// })

// app.post('/login/user', async (req, res) => {
//     const resData = await login(req.body.username, req.body.password);
//     if(resData.length == 0) {
//         console.log('Login failed for ', req.body.username);
//         return res.status(401).send("Invalid username or password");
//     }

//     res.json(resData);
// })

// app.post('/signup/user', async (req, res) => {
//     const pw = await bcrypt.genSalt(saltRounds).then(salt => {
//             return bcrypt.hash(req.body.password, salt)
//         }).then(hash => {
//             return hash;
//         }).catch(err => console.error(err.message))

//     console.log(pw);
    
//     let currDate = new Date();

//     const resData = await createUser(req.body.username, req.body.email, pw, currDate);
//     if(resData.length == 0) {
//         console.log('Signup failed for ', req.body.username);
//         return res.status(401).send("Signup failed for " + req.body.username);
//     }

//     res.json(resData);
// })

// app.get('/', async (req, res) => {
//     const healthcheck = {
//         uptime: process.uptime(),
//         message: 'OK',
//         timestamp: Date.now()
//     };
//     try {
//         res.send(healthcheck);
//     } catch (error) {
//         healthcheck.message = error;
//         res.status(503).send();
//     }
// });

// app.use((err, req, res, next) => {
//     console.log(err.stack);
//     res.status(500).send('Something Broke!');
// })

// // error handler for 404 - not found
// app.use((req, res) => {
//     res.status(415).send('404 Not Found');
// });

// // make sure to call listen after all routes are defined
// app.listen(8080, () => {
//     console.log("Listening on port 8080");
// });
