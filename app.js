var express = require("express"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose");

var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// MONGODB
mongoose.connect("mongodb://localhost:27017/yelpcamp", {useNewUrlParser: true, useUnifiedTopology: true});
var campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String
});
var Campground = mongoose.model("Campground", campgroundSchema);

// ROUTES
app.get("/", (req, res) => {
    res.render("home");
});

app.get("/campgrounds", (req, res) => {
    // List all campgrounds from DB
    Campground.find({}, (err, campgrounds) => {
        if(err) console.log(err);
        else {
            res.render("index", { campgrounds: campgrounds });
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
            console.log("Successfully created campground: " + campground);
            // redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    });
});

app.get("/campgrounds/new", (req, res) => {
    res.render("new.ejs");
});

// CRITICAL TO PUT /NEW BEFORE /:id OTHERWISE /NEW WILL NEVER BE PROCESSED
app.get("/campgrounds/:id", (req, res) => {
    var id = req.params.id;
    // retrieve the ID from the db
    Campground.findById(id, (err, campground) => {
        if(err) console.log(err)
        else res.render("show", {campground: campground});
    });
});

app.listen(3000, () => {
    console.log("server started running...");
});