var app = require("express");
var passport = require("passport");
var User = require("../models/user");

var router = app.Router();

// root route
router.get("/", (req, res) => {
    res.render("home");
});

// =================
// AUTH ROUTES
// =================
router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    var newUser = new User({ username: username });

    User.register(newUser, password, (err, user) => {
        if(err) {
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        else {
            passport.authenticate("local")(req, res, () => {
                req.flash("success", "Welcome to YelpCamp " + user.username);
                res.redirect("/campgrounds");
            });
        }
    });
});

router.get("/login", (req, res) => {
    res.render("login");
});

router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}), (req, res) => {

})

router.get("/logout", (req, res) => {
    req.flash("success", "You have been logged out.");
    req.logout();
    res.redirect("/");
});

module.exports = router;