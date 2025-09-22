const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path');

const app = express();

let topBooks = [
    {
        title: 'Harry Potter and the Sorcerer\'s Stone',
        author: 'J.K. Rowling'
    },
    {
        title: 'Lord of the Rings',
        author: 'J.R.R. Tolkien'
    },
    {
        title: 'Twilight',
        author: 'Stephanie Meyer'
    }
];
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' })

app.use(morgan('common', { stream: accessLogStream }));
// GET requests
app.get('/', (req, res) => {
    res.send('Welcome to my book club!');
});
app.use(express.static('public'));

app.get('/books', (req, res) => {
    res.json(topBooks);
});


// listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
