const express = require("express");
const router = express.Router();
const s3Flow = require("../assets/js/s3_flow");

router.get("/get-website", function (request, response) {
  console.log(process.env.BUCKET_NAME);
  const data = {
    bucketName: process.env.BUCKET_NAME,
  };

  s3Flow
    .getWebsiteInfo(data)
    .then((result) => {
      response.status(200).send({
        success: true,
        message: "get-website - 測試成功",
        s3Url: result,
      });
    })
    .catch((err) => {
      response.status(200).send({
        success: false,
        message: err,
      });
    });
});

router.post("/create", function (request, response) {
  const data = {
    bucketName: request.body.bucketName,
    title: request.body.title,
    url: request.body.url,
    description: request.body.description,
    shareImgUrl: request.body.shareImgUrl,
    typeformID: request.body.typeformID,
  };

  s3Flow
    .create(data)
    .then((result) => {
      response.status(200).send({
        success: true,
        host: `http:${data.bucketName}.s3-website.us-east-2.amazonaws.com`,
        message: result,
      });
    })
    .catch((err) => {
      response.status(200).send({
        success: false,
        message: err,
      });
    });
});

router.post("/upload", function (request, response) {
  const data = {
    bucketName: request.body.bucketName,
    title: request.body.title,
    url: request.body.url,
    description: request.body.description,
    shareImgUrl: request.body.shareImgUrl,
    typeformID: request.body.typeformID,
  };

  s3Flow
    .upload(data)
    .then((result) => {
      response.status(200).send({
        success: true,
        host: `http:${data.bucketName}.s3-website.us-east-2.amazonaws.com`,
        message: result,
      });
    })
    .catch((err) => {
      response.status(200).send({
        success: false,
        message: err,
      });
    });
});

module.exports = router;
