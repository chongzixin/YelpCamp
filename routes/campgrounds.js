var express = require("express");
var router = express.Router();

var Campground = require("../models/campground");

router.get("/", (req, res) => {
    // List all campgrounds from DB
    Campground.find({}, (err, campgrounds) => {
        if(err) console.log(err);
        else {
            res.render("campgrounds/index", { campgrounds: campgrounds });
        }
    });
});

// insert campground into db, check that user is already logged in
router.post("/", isLoggedIn, (req, res) => {
    var createdBy = {
        id: req.user.id,
        username: req.user.username
    };
    var newCampground = {name: req.body.name, image: req.body.imgURL, description: req.body.description, createdBy: createdBy};
    // insert campground to DB
    Campground.create(newCampground, (err, campground) => {
        if(err) {
            console.log(err);
        } else {
            console.log("successfully added campground: " + campground);
            // redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    });
});

// show form to create new campground, check that user is already logged in
router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

// CRITICAL TO PUT /NEW BEFORE /:id OTHERWISE /NEW WILL NEVER BE PROCESSED
router.get("/:id", (req, res) => {
    var id = req.params.id;
    // retrieve the ID from the db
    Campground.findById(id).populate("comments").exec((err, campground) => {
        if (err) console.log(err)
        else {
            res.render("campgrounds/show", { campground: campground });
        }
    });
});

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) 
        return next();

    res.redirect("/login");
}

module.exports = router;