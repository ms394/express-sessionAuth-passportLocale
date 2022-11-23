require("dotenv").config();
const express = require("express");
const session = require("express-session");
const pool = require("./config/dbConfig");
const pgSession = require("connect-pg-simple")(session);
const { getUserByEmail } = require("./queries");
const app = express();

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

app.listen(PORT, console.log(`Server is running on Port: ${PORT}`));
