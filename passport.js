const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Models = require('./models.js'),
    passportJWT = require('passport-jwt');

require('dotenv').config();

let Users = Models.User,
    JWTStrategy = passportJWT.Strategy,
    ExtractJWT = passportJWT.ExtractJwt;

// Local strategy for username and password login    
passport.use(
    new LocalStrategy(
        {
            usernameField: 'username',
            passwordField: 'password',
        },
        async (username, password, callback) => {
            await Users.findOne({ username: username })
                .then((user) => {
                    if (!user) {
                        return callback(null, false, {
                            message: 'Incorrect username or password.',
                        });
                    }
                    if (!user.validatePassword(password)) {
                        return callback(null, false, { message: 'Incorrect password.' });
                    }
                    return callback(null, user);
                })
                .catch((error) => {
                    if (error) {
                        return callback(error);
                    }
                })
        }
    )
);

// JWT strategy for token verification
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
}, async (jwtPayload, callback) => {
    return await Users.findById(jwtPayload._id)
        .then((user) => {
            return callback(null, user);
        })
        .catch((error) => {
            return callback(error)
        });
}));