const express = require("express");
const router = express.Router();
const mongoDBFlow = require("../assets/js/mongoDB_flow");

router.get("/find", function (request, response) {
  mongoDBFlow
    .find()
    .then((result) => {
      response.status(200).send(result);
    })
    .catch((err) => {
      response.status(200).send(err);
    });
});

router.post("/register", function (request, response) {
  const name = request.body.name;
  const email = request.body.email;

  mongoDBFlow
    .register({ name, email })
    .then((result) => {
      response.status(200).send(result);
    })
    .catch((err) => {
      response.status(200).send(err);
    });
});

router.post("/update", function (request, response) {
  const email = request.body.email;
  const score = request.body.score;

  mongoDBFlow
    .update({ email, score })
    .then((result) => {
      response.status(200).send(result);
    })
    .catch((err) => {
      response.status(200).send(err);
    });
});

router.post("/gameover", function (request, response) {
  const name = request.body.name;
  const score = request.body.score;

  mongoDBFlow
    .gameOver({ name, score })
    .then((result) => {
      response.status(200).send(result);
    })
    .catch((err) => {
      response.status(200).send(err);
    });
});

module.exports = router;
