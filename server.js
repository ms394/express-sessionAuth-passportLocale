require("dotenv").config();
const express = require("express");
const session = require("express-session");

const app = express();

const PORT = process.env.PORT || 3000;

// Initializing session
app.use(
  session({
    secret: process.env.EXPRESS_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30days
  })
);

app.get("/", (req, res) => {
  const date = new Date().toLocaleDateString();
  console.log(`${date} ${req.method} ${req.url}`);
  res.send("Request Recieved Successfully");
});

app.listen(PORT, console.log(`Server is running on Port: ${PORT}`));
