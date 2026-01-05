# Movie API

A RESTful API for managing movies and user data, built with Node.js, Express.js, MongoDB, and JWT authentication.

## Overview

The Movie API provides endpoints for retrieving movie information, managing user accounts, and maintaining user favorite movie lists. It includes secure authentication, input validation, and comprehensive security middleware.

## Live Demo & Documentation

You can view the live API documentation here: [Movie API Documentation](https://arcane-movies-f00164225bec.herokuapp.com/documentation.html)

## Features

- **Movie Management**: Get all movies, search by title, filter by genre or director
- **User Authentication**: JWT-based authentication with secure login/registration
- **User Management**: Create, update, and delete user accounts
- **Favorites System**: Add/remove movies from user favorites
- **Security**: Rate limiting, input validation, password hashing, CORS protection
- **Cloud Database**: MongoDB Atlas integration
- **Deployment Ready**: Configured for Heroku deployment

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js with JWT strategy
- **Security**: Helmet, bcrypt, express-rate-limit, express-validator
- **Deployment**: Heroku
- **Cloud Database**: MongoDB Atlas

## API Endpoints

### Authentication
- `POST /login` - User login (returns JWT token)
- `POST /users` - User registration

### Movies (Protected Routes)
- `GET /movies` - Get all movies
- `GET /movies/:title` - Get movie by title
- `GET /genres/:name` - Get genre information
- `GET /directors/:name` - Get director information

### User Management (Protected Routes)
- `PUT /users/:username` - Update user information
- `PUT /users/:username/movies/:movieId` - Add movie to favorites
- `DELETE /users/:username/movies/:movieId` - Remove movie from favorites
- `DELETE /users/:username` - Delete user account

## Usage Examples

### Register a New User
```bash
POST /users
Content-Type: application/json

{
  "username": "moviefan123",
  "email": "moviefan@example.com",
  "password": "securepass123",
  "birthday": "1990-05-15"
}
```

### Login
```bash
POST /login
Content-Type: application/json

{
  "username": "moviefan123",
  "password": "securepass123"
}
```

### Get All Movies (Protected)
```bash
GET /movies
Authorization: Bearer <jwt-token>
```

### Add Movie to Favorites (Protected)
```bash
PUT /users/moviefan123/movies/60d21b4667d0d8992e610c85
Authorization: Bearer <jwt-token>
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt encryption for user passwords
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive validation using express-validator
- **CORS Protection**: Cross-origin resource sharing configuration
- **Security Headers**: Helmet middleware for security headers
- **Environment Variables**: Secure configuration management