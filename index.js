const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path'),
    { v4: uuidv4 } = require('uuid');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

let topMovies = [
    {
        id: 1,
        title: 'No Other Land',
        description: 'A powerful documentary about life in the West Bank',
        genre: { name: 'Documentary', description: 'Non-fiction films' },
        directors: { name: 'Basel Adra, Hamdan Ballal, Yuval Abraham, Rachel Szor', bio: 'Collaborative filmmaking team', birthYear: 'Various' },
        imageURL: 'https://example.com/no-other-land.jpg',
        featured: true
    },
    {
        id: 2,
        title: 'Uncle Boonmee Who Can Recall His Past Lives',
        description: 'A dying man recalls his past lives with the help of spirits',
        genre: { name: 'Fantasy', description: 'Films with supernatural elements' },
        directors: { name: 'Apichatpong Weerasethakul', bio: 'Thai independent film director', birthYear: '1970' },
        imageURL: 'https://example.com/uncle-boonmee.jpg',
        featured: true
    },
    {
        id: 3,
        title: 'Tár',
        description: 'A renowned conductor faces accusations that threaten her career',
        genre: { name: 'Drama', description: 'Character-driven narratives' },
        directors: { name: 'Todd Field', bio: 'American filmmaker and former actor', birthYear: '1964' },
        imageURL: 'https://example.com/tar.jpg',
        featured: false
    },
    {
        id: 4,
        title: 'Neptune Frost',
        description: 'An afrofuturist musical about coltan mining and technology',
        genre: { name: 'Musical', description: 'Films featuring music and dance' },
        directors: { name: 'Anisia Uzeyman, Saul Williams', bio: 'Collaborative directing duo', birthYear: 'Various' },
        imageURL: 'https://example.com/neptune-frost.jpg',
        featured: true
    },
    {
        id: 5,
        title: 'The Banshees of Inisherin',
        description: 'A friendship ends abruptly on a remote Irish island',
        genre: { name: 'Comedy-Drama', description: 'Films blending comedy and drama' },
        directors: { name: 'Martin McDonagh', bio: 'British-Irish playwright and filmmaker', birthYear: '1970' },
        imageURL: 'https://example.com/banshees.jpg',
        featured: false
    }
];

// Sample users array for testing (with UUID)
let users = [
    {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        username: 'moviefan123',
        password: 'hashedpassword',
        favoriteMovies: [1, 3]
    }
];

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' })
app.use(morgan('common', { stream: accessLogStream }));

app.get('/', (req, res) => {
    res.send('Welcome to my movies club in the making!');
});

app.use(express.static('public'));

// GET: Returns a list of all movies
app.get('/movies', (req, res) => {
    res.status(200).json(topMovies);
});

// GET: Return data about a single movie by title
app.get('/movies/:title', (req, res) => {
    const movie = topMovies.find((movie) => movie.title === req.params.title);
    
    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(404).send('Movie not found');
    }
});

// GET: Return data about a genre by name
app.get('/genres/:name', (req, res) => {
    const movie = topMovies.find((movie) => movie.genre.name === req.params.name);
    
    if (movie) {
        res.status(200).json(movie.genre);
    } else {
        res.status(404).send('Genre not found');
    }
});

// GET: Return data about a director by name
app.get('/directors/:name', (req, res) => {
    const movie = topMovies.find((movie) => movie.directors.name === req.params.name);
    
    if (movie) {
        res.status(200).json(movie.directors);
    } else {
        res.status(404).send('Director not found');
    }
});

// POST: Allow new users to register
app.post('/users', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).send('Missing required fields: username, password');
    }
    
    // Check if user already exists
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).send('User already exists');
    }
    
    const newUser = {
        id: uuidv4(),
        username: username,
        password: password,
        favoriteMovies: []
    };
    
    users.push(newUser);
    
    // Return user data without password
    const { password: pwd, ...userResponse } = newUser;
    res.status(201).json(userResponse);
});

// PUT: Allow users to update their user info
app.put('/users/:username', (req, res) => {
    const username = req.params.username;
    const user = users.find(user => user.username === username);
    
    if (!user) {
        return res.status(404).send('User not found');
    }
    
    const { username: newUsername, password } = req.body;
    
    // Update user fields if provided
    if (newUsername) user.username = newUsername;
    if (password) user.password = password;
    
    // Return updated user data without password
    const { password: pwd, ...userResponse } = user;
    res.status(200).json(userResponse);
});

// PUT: Allow users to add a movie to their list of favorites
app.put('/users/:username/movies/:movieId', (req, res) => {
    const username = req.params.username;
    const movieId = parseInt(req.params.movieId);
    
    const user = users.find(user => user.username === username);
    if (!user) {
        return res.status(404).send('User not found');
    }
    
    const movie = topMovies.find(movie => movie.id === movieId);
    if (!movie) {
        return res.status(404).send('Movie not found');
    }
    
    if (!user.favoriteMovies.includes(movieId)) {
        user.favoriteMovies.push(movieId);
        res.status(200).send(`Movie "${movie.title}" has been added to ${username}'s favorites`);
    } else {
        res.status(400).send('Movie is already in favorites');
    }
});

// DELETE: Allow users to remove a movie from their list of favorites
app.delete('/users/:username/movies/:movieId', (req, res) => {
    const username = req.params.username;
    const movieId = parseInt(req.params.movieId);
    
    const user = users.find(user => user.username === username);
    if (!user) {
        return res.status(404).send('User not found');
    }
    
    const movieIndex = user.favoriteMovies.indexOf(movieId);
    if (movieIndex > -1) {
        user.favoriteMovies.splice(movieIndex, 1);
        const movie = topMovies.find(movie => movie.id === movieId);
        const movieTitle = movie ? movie.title : 'Unknown Movie';
        res.status(200).send(`Movie "${movieTitle}" has been removed from ${username}'s favorites`);
    } else {
        res.status(400).send('Movie not found in favorites');
    }
});

// DELETE: Allow existing users to deregister
app.delete('/users/:username', (req, res) => {
    const username = req.params.username;
    const userIndex = users.findIndex(user => user.username === username);
    
    if (userIndex > -1) {
        const deletedUser = users.splice(userIndex, 1)[0];
        res.status(200).send(`User ${deletedUser.username} has been removed`);
    } else {
        res.status(404).send('User not found');
    }
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

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
