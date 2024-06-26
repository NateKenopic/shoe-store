// src/routes/index.js

const express = require("express");

// version and author from package.json
const { version, author } = require("../../package.json");
const { authenticate } = require("../auth");

const { createSuccessResponse } = require("../response");

const logger = require('../logger');

const { hostname } = require("os");

const jwt = require("jsonwebtoken");

const { login, createUser } = require("../database/database");

const saltRounds = 10;

const bcrypt = require("bcrypt");

// Create a router that we can use to mount our API
const router = express.Router();

/**
 * Expose all of our API routes on /v1/* to include an API version.
 * Protect them all so you have to be authenticated in order to access.
 */
router.use(`/v1`, authenticate(), require('./api'));

/**
 * Define a simple health check route. If the server is running
 * we'll respond with a 200 OK.  If not, the server isn't healthy.
 */
router.get("/", (req, res) => {
  // Client's shouldn't cache this response (always request it fresh)
  res.setHeader("Cache-Control", "no-cache");
  // Send a 200 'OK' response
  const data = createSuccessResponse({ author, version });

  res.status(200).json({
    ...data,
    // Use your own GitHub URL for this!
    githubUrl: "https://github.com/NateKenopic/shoe-store",
    hostname: hostname(),
  });
});

/**
 * Define a login route for authentication
 */
router.post(`/login`, async (req, res) => {
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
    logger.warn("Login failed for ", req.body.username);
    return res.status(401).send("Invalid username or password");
  }

  if (user[0].result == 'true') {
    logger.info("Login successful for ", req.body.username);
    var payload = {
      id: user.userid,
    };

    var token = jwt.sign(payload, process.env.JWT_SECRET);

    res.status(200).json({ message: "login successful", token: token, userid: user[0].userid });
  }
});

/**
 * Define a signup route for creating new users
 */
router.post(`/signup`, async (req, res) => {
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

  const resData = await createUser(
    req.body.username,
    req.body.email,
    pw,
    currDate
  );
  if (resData.length == 0) {
    console.log("Signup failed for ", req.body.username);
    return res.status(401).send("Signup failed for " + req.body.username);
  }

  res.json(resData);
});

module.exports = router;
