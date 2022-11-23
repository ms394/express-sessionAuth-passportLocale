require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const pool = require("./config/dbConfig");
const pgSession = require("connect-pg-simple")(session);
const { getUserByEmail } = require("./queries");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;

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
    const user = await getUserByEmail("mohsinsajan394@gmail.com");
    if (user) {
      return res.send(JSON.stringify(user));
    } else {
      return res.send("No User found");
    }
  } catch (err) {
    return res.send(err);
  }
});

app.get("/login", (req, res, next) => {
  const form =
    '<h1>Login Page</h1><form method="POST" action="/login">\
    Enter Email:<br><input type="email" name="email">\
    <br>Enter Password:<br><input type="password" name="password">\
    <br><br><input type="submit" value="Submit"></form>';

  res.send(form);
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login-failure",
    successRedirect: "login-success",
  })
);

app.get("/login-success", (req, res, next) => {
  res.send(
    '<p>You successfully logged in. --> <a href="/protected-route">Go to protected route</a></p>'
  );
});

app.get("/login-failure", (req, res, next) => {
  res.send("Authentication Failed");
});

app.listen(PORT, console.log(`Server is running on Port: ${PORT}`));
