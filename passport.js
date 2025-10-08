const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Models = require('./models.js'),
    passportJWT = require('passport-jwt');

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
    secretOrKey: '19a2e08e75699de81d3747766841dee274c9d96d621cfd1c630ced096bfcef0703689cf939f561127b3986046c8c91854e30d1ed98c089fea2e18def4c78b09a'
}, async (jwtPayload, callback) => {
    return await Users.findById(jwtPayload._id)
        .then((user) => {
            return callback(null, user);
        })
        .catch((error) => {
            return callback(error)
        });
}));