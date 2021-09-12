require("dotenv").config();
const MongoRouter = require("./router/mongo.js");

const express = require("express");
const app = express();

const cors = require("cors");
const corsOptions = {
  origin: [
    // process.env.ACCESS_CONTROL_ALLOW_ORIGIN
    "*",
  ],
  methods: "GET,POST,DELETE,PUT,PATCH,OPTIONS,HEAD,FETCH",
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// body-parser
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/mongo", MongoRouter);

app.get("/", (req, res) => {
  res.send("Welcome to form-auto-serve.");
});

// AddListener
var port = process.env.PORT || 3000;
app.listen(port);

console.log("*** Startup server, port is " + port + " ***");
