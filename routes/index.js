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
            console.log(err);
            return res.redirect("/register");
        }
        else {
            passport.authenticate("local")(req, res, () => {
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
    req.logout();
    res.redirect("/");
});

// middleware
function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

module.exports = router;