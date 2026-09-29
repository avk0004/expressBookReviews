const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Session configuration
app.use(session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

// Authentication middleware for customer auth and review operations
app.use(["/customer/auth/*", "/review/*", "/auth/*"], function auth(req, res, next) {
    if (req.session && req.session.authorization) {
        let token = req.session.authorization['accessToken'];
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user;
                next();
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});

const PORT = 5000;

// Mount customer routes at /customer and root / so /login and /review work directly
app.use("/customer", customer_routes);
app.use("/", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running on port " + PORT));
