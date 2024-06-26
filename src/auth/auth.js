// src/auth/basic-auth.js

// Configure HTTP Basic Auth strategy for Passport, see:
// https://github.com/http-auth/http-auth-passport

//const auth = require('http-auth');
// const passport = require('passport');
//const authPassport = require('http-auth-passport');

const passportJWT = require("passport-jwt");

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

var jwtOptions = {};
// jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
// jwtOptions.jwtFromRequest = ExtractJwt.fromHeader("Authorization");

jwtOptions.secretOrKey = process.env.JWT_SECRET;

// var pstrategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
//     console.log('payload received', jwt_payload);

//     if (jwt_payload) {
//         next(null, {
//             _id: jwt_payload._id,
//             email: jwt_payload.email,
//             userName: jwt_payload.userName,
//             password: jwt_payload.password
//         });
//     } else {
//         next(null, false);
//     }
// });

// We'll use our authorize middle module
const authorize = require("./auth-middleware");

// module.exports.strategy = () =>
//   // For our Passport authentication strategy, we'll look for a
//   // username/password pair in the Authorization header.

//   authPassport(
//     auth.basic({
//       file: process.env.HTPASSWD_FILE,
//     })
//   );

// module.exports.strategy = () => {
//   console.log('inside auth.js strategy');
//   var pstrategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
//     console.log("payload received", jwt_payload);

//     if (jwt_payload) {
//       next(null, {
//         _id: jwt_payload._id,
//         email: jwt_payload.email,
//         userName: jwt_payload.userName,
//         password: jwt_payload.password,
//       });
//     } else {
//       next(null, false);
//     }
//   });

//   return pstrategy;
// };

module.exports.strategy = new JwtStrategy({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: process.env.JWT_SECRET}, function (jwt_payload, next) {
    console.log("payload received: " + JSON.stringify(jwt_payload));

    if (jwt_payload) {
      next(null, {
        _id: jwt_payload.id,
        email: jwt_payload.email,
        username: jwt_payload.username
        //password: jwt_payload.password,
      });
    } else {
      next(null, false);
    }
  });


// Old authenticate()
//module.exports.authenticate = () => passport.authenticate('http', { session: false });

// Now we'll delegate the authorization to our authorize middleware
//module.exports.authenticate = () => authorize("http");
module.exports.authenticate = () => authorize("shoeauth");