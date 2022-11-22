require("dotenv").config();
const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  const date = new Date().toLocaleDateString();
  console.log(`${date} ${req.method} ${req.url}`);
  res.send("Request Recieved Successfully");
});

app.listen(PORT, console.log(`Server is running on Port: ${PORT}`));
