const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


// Genre subdocument schema
/**
 * @typedef Genre
 * @property {string} name
 * @property {string} description
 */
let genreSchema = mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true }
});

// Director subdocument schema
/**
 * @typedef Director
 * @property {string} name
 * @property {string} bio
 * @property {number} [birthYear]
 * @property {number} [deathYear]
 */
let directorSchema = mongoose.Schema({
    name: { type: String, required: true },
    bio: { type: String, required: true },
    birthYear: { type: Number },
    deathYear: { type: Number }
});

// Movie schema
/**
 * @typedef Movie
 * @property {string} title
 * @property {number} year
 * @property {string} description
 * @property {Genre} genre
 * @property {Director} director
 * @property {boolean} [featured]
 * @property {string} imageURL
 */
let movieSchema = mongoose.Schema({
    title: { type: String, required: true },
    year: { type: Number, required: true },
    description: { type: String, required: true },
    genre: genreSchema,
    director: directorSchema,
    featured: { type: Boolean, default: false },
    imageURL: { type: String, required: true }
});

// User schema
/**
 * @typedef User
 * @property {string} username
 * @property {string} email
 * @property {string} password
 * @property {Date} birthday
 * @property {Array<string>} favoriteMovies
 */
let userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    birthday: { type: Date, required: true },
    favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

/**
 * Hashes a password using bcrypt.
 * @param {string} password
 * @returns {string} Hashed password
 */
userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

/**
 * Validates a password.
 * @param {string} password
 * @returns {boolean}
 */
userSchema.methods.validatePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

// Create models
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

// Export models
module.exports.Movie = Movie;
module.exports.User = User;