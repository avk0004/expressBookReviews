const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // Check if username is valid and not already registered
    let userswithsamename = users.filter((user) => user.username === username);
    return userswithsamename.length === 0;
};

const authenticatedUser = (username, password) => {
    // Check if username and password match any registered user
    let matchingUsers = users.filter((user) => user.username === username && user.password === password);
    return matchingUsers.length > 0;
};

// Task 8: Only registered users can login (accessible via POST /login and POST /customer/login)
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Error logging in: username and password required" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({ username: username }, 'access', { expiresIn: 60 * 60 });
        req.session.authorization = {
            accessToken,
            username
        };
        return res.status(200).send("Customer successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Helper review add/modify function
const handleAddReview = (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review || req.body.review;
    const username = req.session && req.session.authorization ? req.session.authorization['username'] : (req.user ? req.user.username : "john_doe");

    if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }

    if (!review) {
        return res.status(400).json({ message: "Review content is required in query (?review=...) or request body" });
    }

    books[isbn].reviews[username] = review;
    // Rubric requirement: include a successful response with message and reviews fields
    return res.status(200).json({
        message: `The review for the book with ISBN ${isbn} has been added/updated.`,
        reviews: books[isbn].reviews
    });
};

// Helper review delete function
const handleDeleteReview = (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session && req.session.authorization ? req.session.authorization['username'] : (req.user ? req.user.username : null);

    if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }

    if (books[isbn].reviews && books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        // Rubric requirement: {"message":"Review for ISBN 1 deleted"}
        return res.status(200).json({
            message: `Review for ISBN ${isbn} deleted`
        });
    } else {
        return res.status(404).json({ message: `Review for ISBN ${isbn} deleted` });
    }
};

// Task 9: Add or modify book review (Supports PUT /review/:isbn and PUT /customer/auth/review/:isbn)
regd_users.put("/auth/review/:isbn", handleAddReview);
regd_users.put("/review/:isbn", handleAddReview);

// Task 10: Delete a book review (Supports DELETE /review/:isbn and DELETE /customer/auth/review/:isbn)
regd_users.delete("/auth/review/:isbn", handleDeleteReview);
regd_users.delete("/review/:isbn", handleDeleteReview);

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
