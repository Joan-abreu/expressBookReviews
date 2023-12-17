const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    return users.hasOwnProperty(username);
}

const authenticatedUser = (username, password) => {
    // Check if the provided username exists in the users object
    const user = users[username];

    // If the username doesn't exist, authentication fails
    if (!user) {
      return false;
    }

    // Check if the provided password matches the stored password
    return user.password === password;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
  
    // Check if both username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
  
    // Check if the user is a valid registered user
    if (!isValid(username) || !authenticatedUser(username, password)) {
        console.log(authenticatedUser(username, password))
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  
    // Create a JWT token for the user
    const token = jwt.sign({ username }, 'your_secret_key', { expiresIn: '1h' });
  
    // Save the user credentials for the session (You may save this in a secure way)
    users.push({ username, token });
  
    return res.status(200).json({ message: 'Login successful', token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { username } = req.body;
    const isbn = req.params.isbn;
    const review = req.query.review;
  
    // Check if the user is authenticated
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, 'your_secret_key');
  
    if (!decoded || decoded.username !== username) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    for (const key in books) {
        if (books[key].hasOwnProperty('isbn') && (books[key].isbn === isbn)) {
            // Check if the user has already posted a review for the same ISBN
            if (books[key].reviews && books[key].reviews[username]) {
                // Modify the existing review
                books[key].reviews[username].review = review;
            } else {
                // Add a new review
                if (!books[key].reviews) {
                    books[key].reviews = {};
                }
                books[key].reviews[username] = {};
                books[key].reviews[username].review = review;
            }
            return res.status(200).json({ message: 'Review added or modified successfully' });
        }
    }
    return res.status(404).json({ message: 'Book not found' });
});

//Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { username } = req.body;
    const isbn = req.params.isbn;
  
    // Check if the user is authenticated
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, 'your_secret_key');
  
    if (!decoded || decoded.username !== username) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    for (const key in books) {
        if (books[key].hasOwnProperty('isbn') && (books[key].isbn === isbn)) {
            // Check if the user has already posted a review for the same ISBN
            if (books[key].reviews && books[key].reviews[username]) {
                delete books[key].reviews[username];
                return res.status(200).json({ message: 'Review deleted successfully' });
            } else

            return res.status(404).json({ message: 'This book do not havent a review for this user' });
        }
    }
    return res.status(404).json({ message: 'Book not found' });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
