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

const jwt = require('jsonwebtoken');

const { login, createUser } = require('./database/database');

const saltRounds = 10;

const bcrypt = require('bcrypt');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Use pino logging middleware
app.use(pino);

// Use helmetjs security middleware
app.use(helmet());

var corsOptions = {
  origin: '*',
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Use CORS middleware so we can make requests across origins
app.use(cors(corsOptions));

// Use gzip/deflate compression middleware
app.use(compression());

// Set up our passport authentication middleware
// passport.use('shoeauth',authenticate.strategy());
passport.use('shoeauth', authenticate.strategy);
app.use(passport.initialize());

/**
 * Define a login route for authentication
 */
app.post(`/login`, async (req, res) => {
  // data.LoginUser(req.body).then((user) => {
  //     var payload = {
  //         _id: user._id,
  //         email: user.email,
  //         userName: user.userName,
  //         password: user.password
  //     };

  //     var token = jwt.sign(payload, jwtOptions.secretOrKey);

  //     var isAdmin = false;

  //     if (user.userName == "admin") {
  //         isAdmin = true;
  //     }

  //     res.json({ message: "login successful", token: token, isAdmin: isAdmin, username: user.userName });
  // }).catch((err) => {
  //     res.status(422).json({ message: JSON.stringify(err) });
  // });
  let user = await login(req.body.username, req.body.password);

  if (user.length == 0 || user[0].result == false) {
    logger.warn('Login failed for ' + req.body.username);
    return res.status(401).send('Invalid username or password');
  }

  if (user[0].result == 'true') {
    logger.info('Login successful for ' + req.body.username);
    var payload = {
      id: user[0].userid,
      username: user[0].username,
      email: user[0].email,
    };

    var token = jwt.sign(payload, process.env.JWT_SECRET);

    res.status(200).json({
      message: 'login successful',
      token: token,
      userid: user[0].userid,
    });
  }
});

/**
 * Define a signup route for creating new users
 */
app.post(`/signup`, async (req, res) => {
  const pw = await bcrypt
    .genSalt(saltRounds)
    .then((salt) => {
      return bcrypt.hash(req.body.password, salt);
    })
    .then((hash) => {
      return hash;
    })
    .catch((err) => console.error(err.message));

  console.log(pw);

  let currDate = new Date();

  const resData = await createUser(req.body.username, req.body.email, pw, currDate);
  if (resData.length == 0) {
    console.log('Signup failed for ', req.body.username);
    return res.status(401).send('Signup failed for ' + req.body.username);
  }

  res.json(resData);
});

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
