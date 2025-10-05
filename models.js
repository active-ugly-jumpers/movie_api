const mongoose = require('mongoose');

// Genre subdocument schema
let genreSchema = mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true }
});

// Director subdocument schema
let directorSchema = mongoose.Schema({
    name: { type: String, required: true },
    bio: { type: String, required: true },
    birthYear: { type: Number },
    deathYear: { type: Number }
});

// Movies schema
let movieSchema = mongoose.Schema({
    title: { type: String, required: true },
    year: { type: Number, required: true },
    description: { type: String, required: true },
    genre: genreSchema,
    director: directorSchema,
    featured: { type: Boolean, default: false },
    imageURL: { type: String, required: true }
});

// Users schema
let userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    birthday: { type: Date, required: true },
    favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

// Create models
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

// Export models
module.exports.Movie = Movie;
module.exports.User = User;