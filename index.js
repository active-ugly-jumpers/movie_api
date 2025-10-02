const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path'),
    mongoose = require('mongoose'),
    Models = require('./models.js');

const app = express();

// Import models
const Movies = Models.Movie;
const Users = Models.User;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/cfDB', { useNewUrlParser: true, useUnifiedTopology: true });

// Middleware to parse JSON bodies
app.use(express.json());

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' })
app.use(morgan('common', { stream: accessLogStream }));

app.get('/', (req, res) => {
    res.send('Welcome to my movies club in the making!');
});

app.use(express.static('public'));

// GET: Returns a list of all movies
app.get('/movies', (req, res) => {
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
app.get('/movies/:title', (req, res) => {
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
app.get('/genres/:name', (req, res) => {
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
app.get('/directors/:name', (req, res) => {
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
app.post('/users', (req, res) => {
    Users.findOne({ username: req.body.username })
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.username + ' already exists');
            } else {
                Users.create({
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password,
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

// PUT: Allow users to update their user info
app.put('/users/:username', (req, res) => {
    Users.findOneAndUpdate(
        { username: req.params.username },
        {
            $set: {
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                birthday: req.body.birthday
            }
        },
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
app.put('/users/:username/movies/:movieId', (req, res) => {
    Users.findOneAndUpdate(
        { username: req.params.username },
        { $push: { favoriteMovies: req.params.movieId } },
        { new: true }
    )
    .then((updatedUser) => {
        if (!updatedUser) {
            return res.status(404).send('User not found');
        }
        res.status(200).send(`Movie has been added to ${req.params.username}'s favorites`);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// DELETE: Allow users to remove a movie from their list of favorites
app.delete('/users/:username/movies/:movieId', (req, res) => {
    Users.findOneAndUpdate(
        { username: req.params.username },
        { $pull: { favoriteMovies: req.params.movieId } },
        { new: true }
    )
    .then((updatedUser) => {
        if (!updatedUser) {
            return res.status(404).send('User not found');
        }
        res.status(200).send(`Movie has been removed from ${req.params.username}'s favorites`);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// DELETE: Allow existing users to deregister
app.delete('/users/:username', (req, res) => {
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

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});
