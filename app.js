const express = require("express");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
const OverspeedingListing = require("./models/overspeeding.js");
const User = require("./models/user.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const {isAuthenticated, isAdmin, saveRedirectUrl} = require("./middleware.js");
const bcrypt = require("bcrypt");
const passport = require('passport');
const LocalStrategy = require("passport-local");
const flash = require("connect-flash");

const MONGO_URL = "mongodb+srv://k213225:p2jQj40WAdzc4EZC@fastcars.kgzrh.mongodb.net";


main()
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public"))); 

const store = MongoStore.create({
    mongoUrl: MONGO_URL,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 60 * 60 * 24 * 1000,
        maxAge: 7 * 60 * 60 * 24 * 3,
        httpOnly: true
    },
};

//home route
// app.get("/", (req,res) =>{
//     res.send("hiiii");
// });




app.use(session(sessionOptions));
app.use(flash()); 

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// fakeuser
// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({ email: "admin1@nu.edu.pk",
//         username: "Admin1",
//         name: "Admin1",
//         number_plate: "ABC999",
//         total_unpaid_fines: 0,
//         role: "admin" ,
//     });
//     const registeredUser = await User.register(fakeUser, "admin1");
//     res.send(registeredUser);
// });

//login page
app.get("/login", (req, res) => {
    res.render("./users/login.ejs"); // Render the login.ejs file
});

// Login route
app.post(
    "/login",
    saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    async (req, res) => {
        req.flash("success", "Logged in successfully");

        // Redirect based on role
        const user = req.user; // Access the authenticated user object
        if (user.role === "admin") {
            req.flash("success", "Admin logged in successfully");
            res.redirect("/admin/home");
        } else {
            req.flash("success", "User logged in successfully");
            res.redirect("/user/home");
        }
    }
);

// User route
app.get("/user/listings", async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You need to be logged in to view your listings");
        return res.redirect("/login");
    }
    try {
        // Fetch user-specific listings
        const userListings = await OverspeedingListing.find({ email: req.user.email });
        res.render("./user/listings", { userListings }); // Correct path for rendering user listings
    } catch (err) {
        console.error("Error fetching user listings:", err);
        req.flash("error", "Failed to load your listings");
        res.redirect("/");
    }
});

// Admin signup page
app.get("/admin/signup", isAdmin, async (req, res) => {
    if(!req.isAuthenticated()){
        req.flash("error", "You need to be logged in to create a listing");
        return res.redirect("/login");
    }
    res.render("./users/signup.ejs"); // Displays the registration form
});


app.post("/admin/signup", isAdmin, async (req, res) => {
    let { name, username, email, password, number_plate, total_unpaid_fines, role } = req.body;

    try {
        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send("User with this email already exists");
            res.redirect("/admin/signup");
        }

        // Create a new user
        const newUser = new User({
            name,
            username,
            email,
            total_unpaid_fines,
            number_plate,
            role
        });
        const registeredUser = await User.register(newUser, password);
        req.flash("success", "User created successfully");
        res.redirect("/admin/listings");
       
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/admin/signup");
    }
});

//total register people
app.get("/admin/totalusers", async (req, res) => {
    try {
        // Ensure the user is authenticated and is an admin
        if (!req.isAuthenticated() || req.user.role !== "admin") {
            req.flash("error", "You need to be logged in as an admin to view this page.");
            return res.redirect("/login");
        }

        // Fetch all registered users from the database
        const allUsers = await User.find({});

        // Render the totaluser.ejs page and pass the users data
        res.render("./overspeedings/totaluser.ejs", { success: req.flash("success"), allUsers });
    } catch (error) {
        console.error("Error fetching users:", error);
        req.flash("error", "An error occurred while fetching the users.");
        res.redirect("/admin/home");
    }
});

//logout
app.get("/logout", (req, res) => {
    req.logout(err=> {
        if(err) {
            return next(err);
        }
    req.flash("success", "Logged out");
    res.redirect("/login");
    });
});

// Home route
app.get("/admin/home", (req, res) => {
    res.render("./overspeedings/home.ejs");
});

// User home route
app.get("/user/home", (req, res) => {
    res.render("./overspeedings/usersview/userhome.ejs");
});

//index
// app.get("/listings", async (req, res) => {
//     const allListings =  await OverspeedingListing.find({});
//     res.render("./overspeedings/index.ejs", {allListings});
// });

app.get("/admin/listings" , async (req, res) => {
    // if (req.session.user.role !== "admin") {
    //     return res.status(403).send("Access denied");
    // }
    if(!req.isAuthenticated()){
        req.flash("error", "You need to be logged in to create a listing");
        return res.redirect("/login");
    }

    const allListings = await OverspeedingListing.find({});
    res.render("./overspeedings/index.ejs", {allListings});
});

//user index
app.get("/user/listings", async (req, res) => {
    try {
        // Ensure the user is authenticated
        if (!req.isAuthenticated()) {
            req.flash("error", "You need to log in to view your listings.");
            return res.redirect("/login");
        }

        // Fetch listings where the email matches the logged-in user's email
        
        // Fetch listings for the logged-in user based on their email
        const userListings = await OverspeedingListing.find({ email: req.user.email });
        
        // Pass the filtered data to the EJS template
        
        res.render("./overspeedings/usersview/userindex.ejs", { userListings });
        

    } catch (error) {
        
        req.flash("error", "An error occurred while fetching your listings.");
        res.redirect("/user/home");
    }
});



//paid route
app.get("/admin/listings/paid", async (req, res) => {
    const paidListings = await OverspeedingListing.find({ is_fine_paid: true });
    res.render("./overspeedings/paid.ejs", { paidListings });
});

//user paid route
app.get("/user/listings/paid", async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            req.flash("error", "You must be logged in to view this page.");
            return res.redirect("/login");
        }

        // Fetch unpaid listings for the logged-in user
        const paidListings = await OverspeedingListing.find({
            email: req.user.email, // Filter by the logged-in user's email
            is_fine_paid: true, // Only unpaid fines
        });

        res.render("./overspeedings/usersview/userpaid.ejs", { paidListings });
    } catch (error) {
       
        req.flash("error", "An error occurred while fetching the listings.");
        res.redirect("/user/listings");
    }
});

//unpaid route
app.get("/admin/listings/unpaid", async (req, res) => {
    const unpaidListings = await OverspeedingListing.find({ is_fine_paid: false });
    res.render("./overspeedings/unpaid.ejs", { unpaidListings });
});



//user unpaid route
app.get("/user/listings/unpaid", async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            req.flash("error", "You must be logged in to view this page.");
            return res.redirect("/login");
        }

        // Fetch unpaid listings for the logged-in user
        const unpaidListings = await OverspeedingListing.find({
            email: req.user.email, // Filter by the logged-in user's email
            is_fine_paid: false, // Only unpaid fines
        });

        res.render("./overspeedings/usersview/userunpaid.ejs", { unpaidListings });
    } catch (error) {
       
        req.flash("error", "An error occurred while fetching the listings.");
        res.redirect("/user/listings");
    }
});


//new route
app.get("/admin/listings/new", (req, res) => {
    if(!req.isAuthenticated()){
        req.flash("error", "You need to be logged in to create a listing");
        return res.redirect("/login");
    }
    res.render("./overspeedings/new.ejs");
}); 


//show route
app.get("/admin/listings/:id", async (req,res) => {
    let {id} = req.params;
    const listing = await OverspeedingListing.findById(id);
    res.render("./overspeedings/show.ejs", {listing});
});

//user detail show
app.get("/admin/users/:id", async(req, res) => {
    let {id} = req.params;
    const listing = await User.findById(id);
    res.render("./overspeedings/usersview/userdetail.ejs", {listing});
});

//user show
app.get("/user/listings/:id", async (req, res) => {
    let {email} = req.params;      
    const userListings = await OverspeedingListing.findById(id);
    res.render("./user/usershow.ejs", {userListings});
});

//create route
app.post("/admin/listings", async (req, res) => {
    const newListing = new OverspeedingListing(req.body.OverspeedingListing);
    await newListing.save();
    req.flash("success", "Listing created successfully");
    res.redirect("/admin/listings");
});

//edit route
app.get("/admin/listings/:id/edit", async (req,res) => {
    let {id} = req.params;
    const listing = await OverspeedingListing.findById(id);
    res.render("./overspeedings/edit.ejs", {listing});
});

//user edit route
app.get("/admin/users/:id/edit", async (req,res) => {
    let {id} = req.params;
    const listing = await User.findById(id);
    res.render("./ovespeedings/usersview/useredit.ejs", {listing});
});

//update route
app.put("/admin/listings/:id", async (req,res) => {
    let {id} = req.params;
    const listing = await OverspeedingListing.findByIdAndUpdate(id, {...req.body.OverspeedingListing});
    res.redirect("/admin/listings");
});

//user update route
app.put("/admin/users/:id", async (req,res) => {
    let {id} = req.params;
    const listing = await User.findByIdAndUpdate(id, {...req.body.OverspeedingListing});
    res.redirect("/admin/listings");
});

//delete route
app.delete("/admin/listings/:id", async (req,res) => {
    let {id} = req.params;
    await OverspeedingListing.findByIdAndDelete(id);
    res.redirect("/admin/listings");
});

//user delete route
app.delete("/admin/users/:id", async (req,res) => {
    let {id} = req.params;
    await User.findByIdAndDelete(id);
    res.redirect("/admin/totalusers");
});






// Test route to create a sample listing
// app.get("/testListing", async (req, res) => {
    
//         let sampleListing = new OverspeedingListing({
//             name: "Anonymous",
//             email: "anonymous@nu.edu.pk", // Placeholder email for anonymous users
//             number_plate: "ABC123",
//             overspeeding_amount: 50, // Speed above 30 km/h
//             is_fine_paid: false,
//             photo: "https://unsplash.com/photos/green-car-parked-along-the-road-in-front-of-traffic-lights-near-buildings-jtZsFCvXS_g",
//         });

//         await sampleListing.save();
//         console.log("Sample listing saved");
//         res.status(200).send("Sample listing created successfully!");
   
// });

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

