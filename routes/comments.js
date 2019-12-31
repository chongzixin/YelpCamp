var app = require("express");
var router = app.Router({mergeParams: true});

var Campground = require("../models/campground");
var Comment = require("../models/comment");

// form to add new comments
router.get("/new", isLoggedIn, (req, res) => {
    var id = req.params.id;
    Campground.findById(id, (err, campground) => {
        if(err) console.log(err);
        else {
            res.render("comments/new", { campground: campground });
        }
    });
});

// create a new comments
router.post("/", isLoggedIn, (req, res) => {
    var id = req.params.id;
    var comment = req.body.comment;
    var author = {
        id: req.user.id,
        username: req.user.username
    };
    comment.author = author;

    console.log("comment is " + JSON.stringify(comment));
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

// middleware
function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

module.exports = router;