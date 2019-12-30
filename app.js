var express = require("express"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    Campground = require("./models/campground"),
    Comment = require("./models/comment")
    seedDB = require("./seeds.js");

var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
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
app.get("/campgrounds/:id/comments/new", (req, res) => {
    var id = req.params.id;
    Campground.findById(id, (err, campground) => {
        if(err) console.log(err);
        else {
            res.render("comments/new", { campground: campground });
        }
    });
});

app.post("/campgrounds/:id/comments", (req, res) => {
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

app.listen(3000, () => {
    console.log("server started running...");
});