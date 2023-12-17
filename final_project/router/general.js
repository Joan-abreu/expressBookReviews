const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Register a new user
public_users.post("/register", (req, res) => {
    // Extract username and password from the request body
    const { username, password } = req.body;
  
    // Check if both username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
  
    // Check if the username already exists
    if (users.hasOwnProperty(username)) {
      return res.status(409).json({ message: 'Username already exists' });
    }
  
    // Register the new user
    users[username] = { username, password };
  
    return res.status(201).json({ message: 'User registered successfully' });
  });


// Function to get the list of books using async-await with Axios
const getBookListAsync = async () => {
    try {
      // Simulating async operation with a promise
      return Promise.resolve(books);
    } catch (error) {
      throw error;
    }
  };

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    try {
        const bookList = await getBookListAsync();

        // Customize the book details as needed
        const formattedBookList = Object.values(bookList).map(book => ({
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            reviews: book.reviews
        }));

        // Send the formatted book list as a JSON response
        res.status(200).json({ books: formattedBookList });

    } catch (error) {
        // Handle errors
        console.error('Error fetching book list:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    // Retrieve the ISBN from the request parameters
    const requestedISBN = req.params.isbn;
  
    // Find the book with the specified ISBN in the books object
    const book = Object.values(books).find(book => book.isbn === requestedISBN);
  
    if (!book) {
      // If the book is not found, return a 404 Not Found response
      return res.status(404).json({ message: 'Book not found' });
    }
  
    // Customize the book details you want to include in the response
    const bookDetails = {
      title: book.title,
      author: book.author,
      isbn: book.isbn,
    };
  
    // Use JSON.stringify to format the JSON response with indentation
    const formattedBookDetails = JSON.stringify({ book: bookDetails }, null, 2);
  
    // Send the formatted book details as a JSON response
    return res.status(200).send(formattedBookDetails);
  });
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    // Retrieve the author from the request parameters
    const requestedAuthor = req.params.author;
  
    // Get all keys (ISBNs) for the 'books' object
    const bookISBNs = Object.keys(books);
  
    // Array to store books with matching author
    const matchingBooks = [];
  
    // Iterate through the 'books' array & check if the author matches
    bookISBNs.forEach(isbn => {
      const book = books[isbn];
      if (book.author === requestedAuthor) {
        // Customize the book details you want to include in the response
        const bookDetails = {
          title: book.title,
          author: book.author,
          isbn: book.isbn,
        };
        matchingBooks.push(bookDetails);
      }
    });
  
    if (matchingBooks.length === 0) {
      // If no matching books are found, return a 404 Not Found response
      return res.status(404).json({ message: 'Books by the author not found' });
    }
  
    // Use JSON.stringify to format the JSON response with indentation
    const formattedMatchingBooks = JSON.stringify({ books: matchingBooks }, null, 2);
  
    // Send the formatted matching books as a JSON response
    return res.status(200).send(formattedMatchingBooks);
  });

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    // Retrieve the title from the request parameters
    const requestedTitle = req.params.title;
  
    // Array to store books with matching title
    const matchingBooks = [];
  
    // Iterate through the 'books' object & check if the title matches
    Object.values(books).forEach(book => {
      if (book.title.toLowerCase().includes(requestedTitle.toLowerCase())) {
        // Customize the book details you want to include in the response
        const bookDetails = {
          title: book.title,
          author: book.author,
          isbn: book.isbn,
        };
        matchingBooks.push(bookDetails);
      }
    });
  
    if (matchingBooks.length === 0) {
      // If no matching books are found, return a 404 Not Found response
      return res.status(404).json({ message: 'Books with the title not found' });
    }
  
    // Use JSON.stringify to format the JSON response with indentation
    const formattedMatchingBooks = JSON.stringify({ books: matchingBooks }, null, 2);
  
    // Send the formatted matching books as a JSON response
    return res.status(200).send(formattedMatchingBooks);
  });

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    // Retrieve the ISBN from the request parameters
    const requestedISBN = req.params.isbn;
  
    // Check if the requested ISBN exists in any book object
    const foundBook = Object.values(books).find(book => book.isbn === requestedISBN);
  
    if (!foundBook) {
      return res.status(404).json({ message: 'Book not found' });
    }
  
    // Get the reviews for the book with the specified ISBN
    const bookReviews = foundBook.reviews;
  
    // Use JSON.stringify to format the JSON response with indentation
    const formattedReviews = JSON.stringify({ reviews: bookReviews }, null, 2);
  
    // Send the formatted reviews as a JSON response
    return res.status(200).send(formattedReviews);
  });

module.exports.general = public_users;
