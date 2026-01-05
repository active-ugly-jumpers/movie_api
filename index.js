const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path'),
    mongoose = require('mongoose'),
    Models = require('./models.js'),
    { check, validationResult } = require('express-validator'),
    helmet = require('helmet'),
    rateLimit = require('express-rate-limit');

require('dotenv').config();

const app = express();

// Import models
const Movies = Models.Movie;
const Users = Models.User;

// Connect to MongoDB using environment variable
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const port = process.env.PORT || 8080;

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"]
        }
    }
}));

// Rate limiting to prevent brute force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Middleware to parse JSON bodies with size limit
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size

const cors = require('cors');
let allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:4200',
    'https://active-ugly-jumpers.netlify.app',
    'https://active-ugly-jumpers.github.io/myFlix-Angular-client/'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
            let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
            return callback(new Error(message), false);
        }
        return callback(null, true);
    }
}));

let auth = require('./auth')(app); // Import auth.js file and pass in app
const passport = require('passport');
require('./passport'); // Import passport.js file

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' })
app.use(morgan('common', { stream: accessLogStream }));

app.get('/', (req, res) => {
    res.send('Welcome to my movies club in the making!');
});

app.use(express.static('public'));

// GET: Returns a list of all movies
app.get('/movies', passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Movies.find()
            .then((movies) => {
                res.status(200).json(movies);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });
    });

// GET: Return data about a single movie by title
app.get('/movies/:title', passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Movies.findOne({ title: req.params.title })
            .then((movie) => {
                if (movie) {
                    res.status(200).json(movie);
                } else {
                    res.status(404).send('Movie not found');
                }
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });
    });

// GET: Return data about a genre by name
app.get('/genres/:name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'genre.name': req.params.name })
        .then((movie) => {
            if (movie) {
                res.status(200).json(movie.genre);
            } else {
                res.status(404).send('Genre not found');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// GET: Return data about a director by name
app.get('/directors/:name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'director.name': req.params.name })
        .then((movie) => {
            if (movie) {
                res.status(200).json(movie.director);
            } else {
                res.status(404).send('Director not found');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// POST: Allow new users to register
app.post('/users', [
    // Validation rules
    check('username', 'Username is required').isLength({ min: 5 }),
    check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('password', 'Password is required').not().isEmpty(),
    check('password', 'Password must be at least 8 characters long').isLength({ min: 8 }),
    check('email', 'Email does not appear to be valid').isEmail(),
    check('birthday', 'Birthday must be a valid date').isDate()
], (req, res) => {
    // Check validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.password);
    Users.findOne({ username: req.body.username })
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.username + ' already exists');
            } else {
                Users.create({
                    username: req.body.username,
                    email: req.body.email,
                    password: hashedPassword,
                    birthday: req.body.birthday
                })
                    .then((user) => {
                        res.status(201).json(user);
                    })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send('Error: ' + error);
                    });
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

// PUT: Allow users to update their user info with validation
app.put('/users/:username', [
    // Validation rules (all optional for updates)
    check('username', 'Username must be at least 5 characters long').optional().isLength({ min: 5 }),
    check('username', 'Username contains non alphanumeric characters - not allowed.').optional().isAlphanumeric(),
    check('password', 'Password must be at least 8 characters long').optional().isLength({ min: 8 }),
    check('email', 'Email does not appear to be valid').optional().isEmail(),
    check('birthday', 'Birthday must be a valid date').optional().isDate()
], passport.authenticate('jwt', { session: false }), (req, res) => {
    // Check validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    // Check if the user is updating their own info
    if (req.user.username !== req.params.username) {
        return res.status(400).send('Permission denied: You can only update your own profile.');
    }

    // Prepare update object with only provided fields
    let updateFields = {};
    if (req.body.username) updateFields.username = req.body.username;
    if (req.body.email) updateFields.email = req.body.email;
    if (req.body.password) updateFields.password = Users.hashPassword(req.body.password);
    if (req.body.birthday) updateFields.birthday = req.body.birthday;

    Users.findOneAndUpdate(
        { username: req.params.username },
        { $set: updateFields },
        { new: true } // This line makes sure that the updated document is returned
    )
        .then((updatedUser) => {
            if (!updatedUser) {
                return res.status(404).send('User not found');
            }
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// PUT: Allow users to add a movie to their list of favorites
app.put('/users/:username/movies/:movieId', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate(
        { username: req.params.username },
        { $push: { favoriteMovies: req.params.movieId } },
        { new: true }
    )
        .then((updatedUser) => {
            if (!updatedUser) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.status(200).json({ message: `Movie has been added to ${req.params.username}'s favorites`, user: updatedUser });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err.toString() });
        });
});

// DELETE: Allow users to remove a movie from their list of favorites
app.delete('/users/:username/movies/:movieId', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate(
        { username: req.params.username },
        { $pull: { favoriteMovies: req.params.movieId } },
        { new: true }
    )
        .then((updatedUser) => {
            if (!updatedUser) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.status(200).json({ message: `Movie has been removed from ${req.params.username}'s favorites`, user: updatedUser });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err.toString() });
        });
});

// DELETE: Allow existing users to deregister
app.delete('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndDelete({ username: req.params.username })
        .then((user) => {
            if (!user) {
                res.status(404).send(req.params.username + ' was not found');
            } else {
                res.status(200).send(req.params.username + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});


// GET: Return a single user by username
app.get('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOne({ username: req.params.username })
        .select('-password')
        .then((user) => {
            if (!user) {
                return res.status(404).send('User not found');
            }
            res.status(200).json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// GET: Return all users (INSECURE - for development only)
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.find()
        .select('-password') // At least exclude passwords from response
        .then((users) => {
            res.status(200).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error occurred:');
    console.error('Time:', new Date().toISOString());
    console.error('URL:', req.url);
    console.error('Method:', req.method);
    console.error('Error message:', err.message);
    console.error('Stack trace:', err.stack);
    console.error('---');

    res.status(500).send('Something went wrong!');
});

app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});
