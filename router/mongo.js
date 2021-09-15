const express = require("express");
const router = express.Router();
const mongoDBFlow = require("../assets/js/mongoDB_flow");

router.get("/find", function (request, response) {
  console.log(`========== find starting ==========`);

  mongoDBFlow
    .find()
    .then((result) => {
      console.log(`find... / result: `, result);
      console.log(`--------- find ending ---------`);
      response.status(200).send(result);
    })
    .catch((err) => {
      console.error(`find... / err: `, err);
      console.log(`--------- find ending ---------`);
      response.status(200).send(err);
    });
});

router.post("/register", function (request, response) {
  const name = request.body.name;

  mongoDBFlow
    .register({ name })
    .then((result) => {
      response.status(200).send(result);
    })
    .catch((err) => {
      response.status(200).send(err);
    });
});

router.post("/update", function (request, response) {
  console.log(`update...`);
  const name = request.body.name;
  const score = request.body.score;

  mongoDBFlow
    .update({ name, score })
    .then((result) => {
      console.log(`update... / result: `, result);
      response.status(200).send(result);
    })
    .catch((err) => {
      console.log(`update... / err: `, err);
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
