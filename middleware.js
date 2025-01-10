const OverspeedingListing = require("./models/overspeeding.js");
const User = require("./models/user.js");

module.exports.isAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/login'); // or some other action
    }
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === "admin") {
        return next();
    }
    req.flash("error", "Access denied. Admins only.");
    return res.redirect("/"); // Redirect to home or a specific page
};
