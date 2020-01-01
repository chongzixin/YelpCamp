var express = require("express"),
    multer = require("multer");

var router = express.Router();
var upload = multer({dest:'public/uploads/'});
const IMG_FOLDER = "/uploads/";

var Campground = require("../models/campground");
var middleware = require("../middleware");

router.get("/", async (req, res) => {
    // List all campgrounds from DB
    try {
        let campgrounds = await Campground.find({});
        res.render("campgrounds/index", {campgrounds});
    } catch(err) {
        console.log(err);
    }
});

// insert campground into db, check that user is already logged in
router.post("/", middleware.isLoggedIn, upload.single('campground[image]'), async (req, res) => {
    var createdBy = {
        id: req.user.id,
        username: req.user.username
    };
    var newCampground = req.body.campground;
    newCampground.createdBy = createdBy;
    // if the user uploaded an image, use that image instead
    if(req.file)
        newCampground.image = IMG_FOLDER + req.file.filename;

    // insert campground to DB
    try {
        let campground = await Campground.create(newCampground);
        res.redirect("/campgrounds");
    } catch(err) {
        console.log(err);
    }
});

// show form to create new campground, check that user is already logged in
router.get("/new", middleware.isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

// CRITICAL TO PUT /NEW BEFORE /:id OTHERWISE /NEW WILL NEVER BE PROCESSED
router.get("/:id", async (req, res) => {
    var id = req.params.id;

    // retrieve the ID from the db
    try {
        let campground = await Campground.findById(id).populate("comments").exec();
        res.render("campgrounds/show", {campground});
    } catch(err) {
        console.log(err);
    }
});

// show form to edit campground
router.get("/:id/edit", middleware.checkCampgroundOwnership, async (req, res) => {
    var id = req.params.id;
    // retrieve the ID from the db
    try {
        let campground = await Campground.findById(id);
        res.render("campgrounds/edit", {campground});
    } catch(err) {
        req.flash("error", "Cannot find the chosen campground");
    }
});

// edit the campground
router.put("/:id", middleware.checkCampgroundOwnership, async (req, res) => {
    var id = req.params.id;
    var newCampground = req.body.campground;
    // retrieve the ID from the db
    try {
        let campground = await Campground.findByIdAndUpdate(id, newCampground);
        res.redirect("/campgrounds/" + id);
    } catch(err) {
        req.flash("error", "Cannot update the campground: " + err);
    }
});

// delete the campground
router.delete("/:id", middleware.checkCampgroundOwnership, async (req, res) => {
    var id = req.params.id;

    try {
        await Campground.findByIdAndDelete(id);
        res.redirect("/campgrounds");
    } catch(err) {
        req.flash("error", "Cannot delete the campground: " + err);
    }
});

module.exports = router;