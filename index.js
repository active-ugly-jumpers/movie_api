const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path');

const app = express();

let topMovies = [
    {
        title: 'No Other Land',
        directors: 'Basel Adra, Hamdan Ballal, Yuval Abraham, Rachel Szor'
    },
    {
        title: 'Uncle Boonmee Who Can Recall His Past Lives',
        directors: 'Apichatpong Weerasethakul'
    },
    {
        title: 'Tár',
        directors: 'Todd Field'
    },
    {
        title: 'Neptune Frost',
        directors: 'Anisia Uzeyman, Saul Williams'
    },
    {
        title: 'The Banshees of Inisherin',
        directors: 'Martin McDonagh'
    },
    {
        title: 'Evil Does Not Exist',
        directors: 'Ryusuke Hamaguchi'
    },
    {
        title: 'Blade Runner',
        directors: 'Ridley Scott'
    },
    {
        title: '2001: A Space Odyssey',
        directors: 'Stanley Kubrick'
    },
    {
        title: 'La Jetée',
        directors: 'Chris Marker'
    },
    {
        title: 'Nostalgia for the Light',
        directors: 'Patricio Guzmán'
    }
];

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' })
app.use(morgan('common', { stream: accessLogStream }));

app.get('/', (req, res) => {
    res.send('Welcome to my movies club in the making!');
});

app.use(express.static('public'));

app.get('/movies', (req, res) => {
    res.json(topMovies);
});

app.use((err, req, res, next) => {
    console.error('Error occurred:');
    console.error('Time:', new Date().toISOString());
    console.error('URL:', req.url);
    console.error('Method:', req.method);
    console.error('Error message:', err.message);
    console.error('Stack trace:', err.stack);
    console.error('---');

    // Send error response to client
    res.status(500).send('Something went wrong!');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
