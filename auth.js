

require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport'); // Local passport strategy config

/**
 * Generates a JWT token for a user.
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.username, // Encoded username
    expiresIn: '7d', // Token expires in 7 days
    algorithm: 'HS256' // Signing algorithm
  });
}

/**
 * POST /login route for user authentication.
 * @param {Object} router - Express router
 */
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
}