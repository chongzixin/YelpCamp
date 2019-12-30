var express = require("express"),
    ExpressSession = require("express-session"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    Campground = require("./models/campground"),
    Comment = require("./models/comment"),
    User = require("./models/user"),
    seedDB = require("./seeds.js");

var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// PASSPORT CONFIG
app.use(express.static(__dirname + "/public"));
app.use(ExpressSession({
    secret: "Thur likes to read",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// this is a middleware that will send req.user to every route (res)
app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

seedDB();

// MONGODB
mongoose.connect("mongodb://localhost:27017/yelpcamp", {useNewUrlParser: true, useUnifiedTopology: true});

// ROUTES
app.get("/", (req, res) => {
    res.render("home");
});

app.get("/campgrounds", (req, res) => {
    // List all campgrounds from DB
    Campground.find({}, (err, campgrounds) => {
        if(err) console.log(err);
        else {
            res.render("campgrounds/index", { campgrounds: campgrounds });
        }
    });
});

app.post("/campgrounds", (req, res) => {
    var newCampground = {name: req.body.name, image: req.body.imgURL, description: req.body.description};
    // insert campground to DB
    Campground.create(newCampground, (err, campground) => {
        if(err) {
            console.log(err);
        } else {
            // redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    });
});

app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new");
});

// CRITICAL TO PUT /NEW BEFORE /:id OTHERWISE /NEW WILL NEVER BE PROCESSED
app.get("/campgrounds/:id", (req, res) => {
    var id = req.params.id;
    // retrieve the ID from the db
    Campground.findById(id).populate("comments").exec((err, campground) => {
        if (err) console.log(err)
        else {
            res.render("campgrounds/show", { campground: campground });
        }
    });
});

// =================
// COMMENTS ROUTES
// =================

// form to add new comments
app.get("/campgrounds/:id/comments/new", isLoggedIn, (req, res) => {
    var id = req.params.id;
    Campground.findById(id, (err, campground) => {
        if(err) console.log(err);
        else {
            res.render("comments/new", { campground: campground });
        }
    });
});

app.post("/campgrounds/:id/comments", isLoggedIn, (req, res) => {
    var id = req.params.id;
    var comment = req.body.comment;
    
    Campground.findById(id, (err, campground) => {
        if(err) console.log(err);
        else {
            Comment.create(comment, (err, comment) => {
                if(err) console.log(err);
                else {
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect("/campgrounds/" + id);
                }
            });
        }
    });
});

// =================
// AUTH ROUTES
// =================
app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
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

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}), (req, res) => {

})

app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

app.listen(3000, () => {
    console.log("server started running...");
});