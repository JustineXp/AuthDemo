const bodyParser = require("body-parser"),
  express = require("express"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  localStrategy = require("passport-local").Strategy,
  passportLocalMongoose = require("passport-local-mongoose"),
  User = require("./models/user");

//App connection to the DBs
mongoose.connect("mongodb://localhost:27017/UsersDB", {
  useNewUrlParser: true,
});

var app = express();

app.use(
  require("express-session")({
    secret: "Justine Sauro Mayaka is an amazing programmer",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//HOME ROUTE

app.get("/", (req, res) => {
  res.render("home");
});

//LOGIN ROUTES
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login",
  }),
  (req, res) => {}
);

app.get("/login", (req, res) => {
  res.render("login");
});

//SECRET PAGE ROUTE
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
}

app.get("/secret", isLoggedIn, (req, res) => {
  res.render("secret");
});

//REGISTER ROUTE

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  let password = req.body.password;

  User.register(
    new User({ username: req.body.username }),
    password,
    (error, user) => {
      if (error) {
        console.log(error);
        return res.render("register");
      }
      console.log(user);
      passport.authenticate("local")(req, res, () => {
        res.redirect("/secret");
      });
    }
  );
});

//LOGOUT ROUTE

app.get("/logout", (req, res) => {
  req.logOut();
  res.redirect("/");
});

app.listen(3000, (req, res) => {
  console.log("Server running on Port 3000");
});
