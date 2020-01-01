var app = require("express");
var router = app.Router({mergeParams: true});

var Campground = require("../models/campground");
var Comment = require("../models/comment");

var middleware = require("../middleware");

// form to add new comments
router.get("/new", middleware.isLoggedIn, (req, res) => {
    var id = req.params.id;
    Campground.findById(id, (err, campground) => {
        if(err) console.log(err);
        else {
            res.render("comments/new", { campground: campground });
        }
    });
});

// create a new comment
router.post("/", middleware.isLoggedIn, (req, res) => {
    var id = req.params.id;
    var comment = req.body.comment;
    var author = {
        id: req.user.id,
        username: req.user.username
    };
    comment.author = author;
    
    Campground.findById(id, (err, campground) => {
        if(err) console.log(err);
        else {
            Comment.create(comment, (err, comment) => {
                if(err) console.log(err);
                else {
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success", "Successfully added comment");
                    res.redirect("/campgrounds/" + id);
                }
            });
        }
    });
});

// form to edit comments
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
    var comment_id = req.params.comment_id;
    Comment.findById(comment_id, (err, comment) => {
        if(err) console.log(err);
        else {
            res.render("comments/edit", {comment: comment, campground_id: req.params.id});
        }
    });
});

// route to edit comments
router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    var comment_id = req.params.comment_id;
    // also update the date of the comment
    req.body.comment.createdOn = Date.now();
    Comment.findByIdAndUpdate(comment_id, req.body.comment, (err, comment) => {
        if(err) res.redirect("back");
        else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// route to delete comments
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    var comment_id = req.params.comment_id;
    Comment.findByIdAndDelete(comment_id, (err, comment) => {
        if(err) res.redirect("back");
        else {
            req.flash("success", "Successfully deleted.");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports = router;