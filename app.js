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

const MONGO_URL = "mongodb+srv://k213225:p2jQj40WAdzc4EZC@fastcars.kgzrh.mongodb.net/fypproject";


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
// app.get("/user/listings", async (req, res) => {
//     if (!req.isAuthenticated()) {
//         req.flash("error", "You need to be logged in to view your listings");
//         return res.redirect("/login");
//     }
//     try {
//         // Fetch user-specific listings
//         const userListings = await OverspeedingListing.find({ email: req.user.email });
//         res.render("./user/listings", { userListings }); // Correct path for rendering user listings
//     } catch (err) {
//         console.error("Error fetching user listings:", err);
//         req.flash("error", "Failed to load your listings");
//         res.redirect("/");
//     }
// });

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

    number_plate = number_plate.split(',').map(plate => plate.trim());

    try {

        if (number_plate.length === 0 || number_plate.some(plate => plate === "")) {
            req.flash("error", "Please enter at least one valid number plate.");
            return res.redirect("/admin/signup");
        }
        
        // Check if the email already exists
        let existingUser = await User.findOne({ email });
        if (existingUser) {
           
            req.flash("error","User with this email already exists, please try again");
           return res.redirect("/admin/signup");
        }

        existingUser = await User.findOne({ username });
        if (existingUser) {
             req.flash("error","User with this username already exists, please try again");
           return res.redirect("/admin/signup");
        }

        existingUser = await User.findOne({ number_plate: { $in: number_plate } });
        if (existingUser) {
             req.flash("error","User with this number plate already exists, please try again");
           return res.redirect("/admin/signup");
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

app.get("/admin/listings", async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You need to be logged in to create a listing");
        return res.redirect("/login");
    }

    const searchQuery = req.query.search || ''; // Get the search query from the URL
    let allListings = [];

    if (searchQuery) {
        // Use MongoDB $regex operator to search for a substring in the fields
        allListings = await OverspeedingListing.find({
            $or: [
                { name: { $regex: searchQuery, $options: 'i' } }, // case-insensitive search for name
                { email: { $regex: searchQuery, $options: 'i' } }, // case-insensitive search for email
                { number_plate: { $regex: searchQuery, $options: 'i' } } // search within array of number plates
            ]
        });
    } else {
        // If no search query, show all listings
        allListings = await OverspeedingListing.find({});
    }

    res.render("./overspeedings/index.ejs", { allListings, searchQuery });
});


//user index route
app.get("/user/listings", async (req, res) => {
    try {
        // Ensure the user is authenticated
        if (!req.isAuthenticated()) {
            req.flash("error", "You need to log in to view your listings.");
            return res.redirect("/login");
        }
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
app.get("/admin/listings/new", async(req, res) => {
    if(!req.isAuthenticated()){
        req.flash("error", "You need to be logged in to create a listing");
        return res.redirect("/login");
    }
    const emails = await User.find({}, "email").lean();
    let emailArray = emails.map(user => user.email);
    emailArray.push('anonymous@nu.edu.pk')
    res.render("./overspeedings/new.ejs",{emailArray});
}); 


//show route
app.get("/admin/listings/:id", async (req,res) => {
    let {id} = req.params;
    const listing = await OverspeedingListing.findById(id);
    res.render("./overspeedings/show.ejs", {listing});
});

//only user detail show
app.get("/admin/users/:id", async(req, res) => {
    let {id} = req.params;
    const listing = await User.findById(id);
    res.render("./overspeedings/usersview/userdetail.ejs", {listing});
});


//user show car
app.get("/user/listings/:id", async (req, res) => {
    let {id} = req.params;      
    const listing = await OverspeedingListing.findById(id);
    res.render("./overspeedings/usersview/usershow.ejs", {listing});
});

//user info, he can check from its account
app.get("/user/info", async(req, res) => {
    const user = await User.findById(req.user._id);
    res.render("./overspeedings/usersview/userinfo.ejs", {user});
});

//create route
app.post("/admin/listings", async (req, res) => {
    const getuser = await User.findOne(
        { email:  req.body.OverspeedingListing.email }, // Query to find the document with the specified email
      );
    req.body.OverspeedingListing.name = getuser.name
    getuser.total_unpaid_fines++;
    await getuser.save()
    const newListing = new OverspeedingListing(req.body.OverspeedingListing);
    await newListing.save();
    req.flash("success", "Listing created successfully");
    res.redirect("/admin/listings");
});

//edit route
app.get("/admin/listings/:id/edit", async (req,res) => {
    let {id} = req.params;
    const listing = await OverspeedingListing.findById(id);
    const emails = await User.find({}, "email").lean();
    let emailArray = emails.map(user => user.email);
    emailArray.push('anonymous@nu.edu.pk')
   
    res.render("./overspeedings/edit.ejs", {listing,emailArray});
});

//user edit route
app.get("/admin/users/:id/edit", async (req,res) => {
    let {id} = req.params;
    const listing = await User.findById(id);
    res.render("./overspeedings/usersview/useredit.ejs", {listing});
});

//update route
app.put("/admin/listings/:id", async (req,res) => {
    let {id} = req.params;
    
    let Overspeeding = req.body.OverspeedingListing
    const oldlisting = await OverspeedingListing.findById(id)
    if(oldlisting.email != 'anonymous@nu.edu.pk' && Overspeeding.is_fine_paid == 'false'){
        email = oldlisting.email
    const getuser = await User.findOne(
        { email: email }, // Query to find the document with the specified email
      );
    Overspeeding.name = getuser.name
        getuser.total_unpaid_fines--;
        await getuser.save()
    }

    if(Overspeeding.email == 'anonymous@nu.edu.pk'){
        Overspeeding.name = 'Anonymous'
        
        const listing = await OverspeedingListing.findByIdAndUpdate(id,Overspeeding)
       
        res.redirect("/admin/listings");
    }
    else{
        email = Overspeeding.email
        const getuser = await User.findOne(
            { email: email }, // Query to find the document with the specified email
          );
        Overspeeding.name = getuser.name
     

    
    const listing2 = await OverspeedingListing.findByIdAndUpdate(id,Overspeeding)
    if(Overspeeding.is_fine_paid == 'false'){
    
    getuser.total_unpaid_fines++;
    await getuser.save()
    }
    res.redirect("/admin/listings");
}

});

//Update user by id from Admin interface
app.put("/admin/users/:id", async (req,res) => {
    let {id} = req.params;
    req.body.User.number_plate = req.body.User.number_plate.split(',').map(plate => plate.trim());
    const listing = await User.findByIdAndUpdate(id, {...req.body.User});
    res.redirect("/admin/totalusers");
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

app.post("/user/pay-fine", async (req,res) => {
    let ids = []
  
    if(req.body.amount == 1){
        ids.push(req.body.id)
       }
       else{
        for(let i=0;i<req.body.amount;i++){
            ids.push(req.body.id[i])
        }
       }

    
    res.render("./overspeedings/usersview/userpaymentinterface.ejs",{ids});
});

app.post("/user/process-card", async (req,res) => {
    let idsString = req.body.ids
    let ids = idsString.split(',').map(id => id.trim()).filter(id => id !== "");
    let Overspeeding = await OverspeedingListing.findByIdAndUpdate(
        ids[0],
        { "is_fine_paid": true}
    )
    const email = Overspeeding.email
    const Userobj = await User.findOne({"email": email})
    Userobj.total_unpaid_fines --
    await Userobj.save();
    
    if(ids.length > 1){
    for(let i = 1;i<ids.length;i++){
         Overspeeding = await OverspeedingListing.findByIdAndUpdate(
            ids[i],
            { "is_fine_paid": true}
        )
        Userobj.total_unpaid_fines --
    await Userobj.save();
    }
}
   res.redirect("/user/listings/unpaid");
   // res.redirect("/user/markfinepaid");
});

app.get("/user/markfinepaid",async(req,res) => {
console.log(req.body)
    res.redirect("/user/listings/unpaid");
});

app.put("/admin/pay-fine/:id",async(req,res) => {
const id = req.params.id
let Overspeeding = await OverspeedingListing.findByIdAndUpdate(
    id,
    { "is_fine_paid": true}
)
if(Overspeeding.name != 'Anonymous'){
    const email = Overspeeding.email
    const Userobj = await User.findOne({"email": email})
    Userobj.total_unpaid_fines --
    await Userobj.save();
}
const flashmessage = "Fine for User " + Overspeeding.name + " was marked paid"
req.flash("success",flashmessage)
res.redirect("/admin/listings/unpaid")
})

app.put("/admin/unpay-fine/:id",async(req,res) => {
    const id = req.params.id
    let Overspeeding = await OverspeedingListing.findByIdAndUpdate(
        id,
        { "is_fine_paid": false}
    )
    if(Overspeeding.name != 'Anonymous'){
        const email = Overspeeding.email
        const Userobj = await User.findOne({"email": email})
        Userobj.total_unpaid_fines ++
        await Userobj.save();
    }
    const flashmessage = "Fine for User " + Overspeeding.name + " was marked unpaid"
    req.flash("success",flashmessage)
    res.redirect("/admin/listings/paid")
    })
    
    







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

