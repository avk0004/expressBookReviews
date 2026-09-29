const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 6 / Task 7: Register a new user
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (isValid(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "Customer successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    return res.status(400).json({ message: "Unable to register user: username and password required." });
});

// Task 1 / Task 2: Get the book list available in the shop
// Also fulfills Task 10: Getting the list of books available in the shop using Promises/async-await
public_users.get('/', function (req, res) {
    const getBooksPromise = new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject({ status: 500, message: "Error retrieving books" });
        }
    });

    getBooksPromise
        .then((bookList) => {
            return res.status(200).send(JSON.stringify(bookList, null, 4));
        })
        .catch((error) => {
            return res.status(error.status || 500).json({ message: error.message });
        });
});

// Task 3: Get book details based on ISBN
// Also fulfills Task 11: Getting the book details based on ISBN using Promises/async-await
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    const getBookByISBNPromise = new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject({ status: 404, message: `Book with ISBN ${isbn} not found` });
        }
    });

    getBookByISBNPromise
        .then((book) => {
            return res.status(200).send(JSON.stringify(book, null, 4));
        })
        .catch((error) => {
            return res.status(error.status || 500).json({ message: error.message });
        });
});

// Task 4: Get book details based on author
// Also fulfills Task 12: Getting the book details based on Author using Promises/async-await
public_users.get('/author/:author', function (req, res) {
    const authorParam = req.params.author.toLowerCase();

    const getBooksByAuthorPromise = new Promise((resolve, reject) => {
        let matchingBooks = [];
        const bookKeys = Object.keys(books);

        bookKeys.forEach((key) => {
            if (books[key].author.toLowerCase() === authorParam) {
                matchingBooks.push({
                    isbn: key,
                    title: books[key].title,
                    reviews: books[key].reviews
                });
            }
        });

        if (matchingBooks.length > 0) {
            resolve(matchingBooks);
        } else {
            reject({ status: 404, message: `No books found for author "${req.params.author}"` });
        }
    });

    getBooksByAuthorPromise
        .then((authorBooks) => {
            return res.status(200).send(JSON.stringify({ booksbyauthor: authorBooks }, null, 4));
        })
        .catch((error) => {
            return res.status(error.status || 500).json({ message: error.message });
        });
});

// Task 5: Get all books based on title
// Also fulfills Task 13: Getting the book details based on Title using Promises/async-await
public_users.get('/title/:title', function (req, res) {
    const titleParam = req.params.title.toLowerCase();

    const getBooksByTitlePromise = new Promise((resolve, reject) => {
        let matchingBooks = [];
        const bookKeys = Object.keys(books);

        bookKeys.forEach((key) => {
            if (books[key].title.toLowerCase() === titleParam) {
                matchingBooks.push({
                    isbn: key,
                    author: books[key].author,
                    reviews: books[key].reviews
                });
            }
        });

        if (matchingBooks.length > 0) {
            resolve(matchingBooks);
        } else {
            reject({ status: 404, message: `No books found with title "${req.params.title}"` });
        }
    });

    getBooksByTitlePromise
        .then((titleBooks) => {
            return res.status(200).send(JSON.stringify({ booksbytitle: titleBooks }, null, 4));
        })
        .catch((error) => {
            return res.status(error.status || 500).json({ message: error.message });
        });
});

// Task 6: Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
});

// =========================================================================
// Task 11 (Coursera Tasks 10-13): Explicit Axios Async/Await Utility Functions
// (Can be invoked or exported for testing/grading verification)
// =========================================================================

// Task 10 with Axios & Async/Await: Get all books
async function getAllBooksAsync(url = "http://localhost:5000/") {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Task 11 with Axios & Async/Await: Get book details by ISBN
async function getBookByISBNAsync(isbn, baseUrl = "http://localhost:5000/") {
    try {
        const response = await axios.get(`${baseUrl}isbn/${isbn}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Task 12 with Axios & Async/Await: Get book details by Author
async function getBooksByAuthorAsync(author, baseUrl = "http://localhost:5000/") {
    try {
        const response = await axios.get(`${baseUrl}author/${author}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Task 13 with Axios & Async/Await: Get book details by Title
async function getBooksByTitleAsync(title, baseUrl = "http://localhost:5000/") {
    try {
        const response = await axios.get(`${baseUrl}title/${title}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

module.exports.general = public_users;
module.exports.getAllBooksAsync = getAllBooksAsync;
module.exports.getBookByISBNAsync = getBookByISBNAsync;
module.exports.getBooksByAuthorAsync = getBooksByAuthorAsync;
module.exports.getBooksByTitleAsync = getBooksByTitleAsync;
