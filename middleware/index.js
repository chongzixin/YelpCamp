var Campground = require("../models/campground"),
    Comment = require("../models/comment");

var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
    if(req.isAuthenticated()) {
        var id = req.params.id;
        // retrieve the ID from the db
        Campground.findById(id, (err, campground) => {
            if (err) res.redirect("back");
            else {
                if(campground.createdBy.id.equals(req.user.id)) {
                    next();
                }
                else {
                    res.redirect("back");
                }
            }
        });
    } else {
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
    if(req.isAuthenticated()) {
        var comment_id = req.params.comment_id;
        Comment.findById(comment_id, (err, comment) => {
            if(err) {
                res.redirect("back");
            } else {
                if(comment.author.id.equals(req.user.id)) next();
                else res.redirect("back");
            }
        });
    } else {
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

module.exports = middlewareObj;

// ALTERNATIVE WAY 1
// module.exports = {
//     checkCampgroundOwnership = function(...),
//     checkCommentOwnership = function(...)
// };

// ALTERNATIVE WAY 2
// var middlewareObj = {
//     checkCampgroundOwnership = function(...),
//     checkCommentOwnership = function(...)
// };
// module.exports = middlewareObj;