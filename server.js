require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const pool = require("./config/dbConfig");
const pgSession = require("connect-pg-simple")(session);
const { getUserByEmail } = require("./queries");
const bcrypt = require("bcrypt");
const Queries = require("./queries");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = 3000;

// Initializing PG Session Store
const sessionStore = new pgSession({
  pool: pool,
  tableName: "session", // sessions is the table name in the db
});

// Initializing session
app.use(
  session({
    store: sessionStore,
    secret: process.env.EXPRESS_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30days
  })
);

require("./config/passport");
app.use(passport.initialize());
app.use(passport.session());

app.get("/", async (req, res) => {
  try {
    // passing hardcoded email to fetch the user. The registration will  be done later.
    const user = await getUserByEmail("test@test.com");
    if (user) {
      return res.send(JSON.stringify(user));
    } else {
      return res.send("No User found");
    }
  } catch (err) {
    return res.send(err);
  }
});

// Auth Routes
app.get("/login", (req, res, next) => {
  const form =
    '<h1>Login Page</h1><form method="POST" action="/login">\
    Enter Email:<br><input type="email" name="email">\
    <br>Enter Password:<br><input type="password" name="password">\
    <br><br><input type="submit" value="Submit"></form>';

  res.send(form);
});

app.get("/register", (req, res, next) => {
  const form =
    '<h1>Register Page</h1><form method="post" action="/register">\
                  Enter Username:<br><input type="text" name="user_name"><br><br>\
                  Enter Email:<br><input type="email" name="email"><br><br>\
                  Enter Phone No:<br><input type="number" name="phone"><br>\
                  <br>Select Role<br><select name="role" id="role"><option value="admin">Admin</option><option value="user">User</option></select>\
                  <br><br>Enter Password:<br><input type="password" name="password">\
                  <br><br><input type="submit" value="Submit"></form>';

  res.send(form);
});

// app.post(
//   "/login",
//   passport.authenticate("local", {
//     failureRedirect: "/login-failure",
//     successRedirect: "login-success",
//   })
// );

app.post("/login", function (req, res, next) {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      console.log("err is" + err);
      return res.status(401).json({ message: "No user found" });
    }
    if (!user) {
      console.log(info);
      return res.status(401).json({
        success: false,
        message: "authentication failed",
      });
    }
    req.logIn(user, (err) => {
      if (err) throw err;
      res.send("Successfully Authenticated");
      console.log(req.user);
    });
  })(req, res, next);
});

app.get("/login-success", (req, res, next) => {
  res.send("<p>You successfully logged in.</p>");
});

app.get("/login-failure", (req, res, next) => {
  res.send("Authentication Failed");
});

app.post("/register", async (req, res, next) => {
  const { user_name, email, phone, role, password } = req.body;
  // Validate user input using before sending to db

  // After Validation hash the password and send the datat to create user method.
  try {
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.SALT)
    );
    const user = await Queries.createUser(
      user_name,
      email,
      phone,
      role,
      hashedPassword
    );
    console.log(user.user_id);
    return res.send(
      `User has been registered.Please proceed to <a href="/login">Login</a>`
    );
  } catch (err) {
    console.log("Error" + str(err));
    return res.send(err);
  }
});

app.listen(PORT, console.log(`Server is running on Port: ${PORT}`));
