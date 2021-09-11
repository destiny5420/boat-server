const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})

const printHtmlFile = function(title, url, description, shareImageUrl, typeFormID) {
  return `
  <!DOCTYPE html>
  <html lang="zh" class="stop">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${title || '調查問卷'}</title>
      <meta name="description" content="${description || 'Make your survey a piece of cake!'}" />
      <meta property="og:title" content="${title || '調查問卷'}" />
      <meta property="og:description" content="${description || 'Make your survey a piece of cake!'}" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="${title || '調查問卷'}" />
      <meta property="og:image" content="${shareImageUrl || 'https://www.surveycake.com/s/share-image.png'}" />
      <meta property="og:url" content="${url || ''}" />
      <meta property="og:locale" content="zh_tw" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:url" content="${url || ''}" />
      <meta name="twitter:title" content="${title || '調查問卷'}" />
      <meta name="twitter:description" content="${description || 'Make your survey a piece of cake!'}" />
      <meta name="twitter:image" content="${shareImageUrl || 'https://www.surveycake.com/s/share-image.png'}" />
      <meta name="twitter:image:alt" content="${description || 'Make your survey a piece of cake!'}" />
      <link href="https://public-assets.typeform.com/public/favicon/favicon.ico" rel="shortcut icon">
      <style>
        body {
          width: 100%;
          height: 100%;
          margin: 0;
        }

        .container {
          width: 100%;
          height: 100vh;
        }

        .form {
          width: 100%;
          height: 100%;
          border-width: 0;
          border-radius: 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div data-tf-widget="${typeFormID}" id="iframeEl" class="form"></div>
      </div>
    </body>
    <script src="//embed.typeform.com/next/embed.js"></script>
    <script>
      function getReferrerSessions() {
        return JSON.parse(window.localStorage.getItem('referrerSessions') || null)
      }

      function getDomainFromUrl(url) {
        var result
        var match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n\?\=]+)/im)

        if (match) {
          result = match[1]
          match = result.match(/^[^\.]+\.(.+\..+)$/)

          if (match) {
            result = match[1]
          }
        }

        return result
      }

      function minutesPassed(timestamp) {
        var d1 = timestamp
        var d2 = new Date().getTime()
        return (d2 - d1) / (1000 * 60)
      }

      function setReferrerSessions(overTimeLimit) {
        var time = overTimeLimit || 30
        var referrerSessions = getReferrerSessions()

        if (referrerSessions && minutesPassed(referrerSessions.timestamp) <= time) {
          return
        }

        window.localStorage.setItem(
          'referrerSessions',
          JSON.stringify({
            referrer: getDomainFromUrl(document.referrer),
            timestamp: new Date().getTime(),
          }),
        )
      }

      function mergeUrlParams(link) {
        var referrerSessions = getReferrerSessions()
        var isHaveUtmParams = /utm/.test(window.location.search)

        if (isHaveUtmParams) {
          return ''.concat(link, '&').concat(window.location.search.substr(1))
        }

        if (!referrerSessions.referrer) {
          return link
        }

        return ''
          .concat(link, '&utm_source=')
          .concat(referrerSessions.referrer, '&utm_medium=searchResult&utm_campaign=search')
      }

      window.onpageshow = function () {
        setReferrerSessions(30)
        var iframe = document.getElementById('iframeEl').children[0].children[0]
        var link = iframe.src
        var combineLink = mergeUrlParams(link)
        iframe.src = combineLink
      }
    </script>
  </html>
`
}

// 1. 創建 bucket
const createBucket = function(data) {
  console.log('creating bucket ...');
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: data.bucketName,
      ACL: 'private',
      CreateBucketConfiguration: {
        LocationConstraint: "ap-northeast-1"
      }
    }

    s3.createBucket(params, function(err, data) {
      if (err) {
        reject(`create bucket failed / error: ${err}`)
      } else {
        resolve('create bucket success.')
      }
    })
  })
}

// 2. 設定為靜態網站
const setStaticWebsite = function (data) {
  console.log('setting bucket static website ...');
  return new Promise((resolve, reject) => {
    const staticHostParams = {
      Bucket: data.bucketName,
      WebsiteConfiguration: {
        ErrorDocument: {
          Key: 'error.html'
        },
        IndexDocument: {
          Suffix: 'index.html'
        }
      }
    }

    s3.putBucketWebsite(staticHostParams, function(err, data) {
      if (err) {
        reject(`setting bucket static website / error: ${err}`)
      } else {
        resolve('setting bucket static website success.')
      }
    })
  })
}

// 3. 設定許可
const setPolicyBucket = function (data) {
  console.log('setting bucket policy ...');
  return new Promise((resolve, reject) => {
    const policy = {
      Version: "2012-10-17",
      Id: "Policy1528256788130",
      Statement: [
        {
          Sid: "Stmt1528256780892",
          Effect: "Allow",
          Principal: {
            AWS: "*"
          },
          Action: [
            "s3:GetObject"
          ],
          Resource: [
            `arn:aws:s3:::${data.bucketName}/*`
          ]
        }
      ]
    }

    const bucketPolicyParams = {
      Bucket: data.bucketName,
      Policy: JSON.stringify(policy)
    }

    s3.putBucketPolicy(bucketPolicyParams, function(err, data) {
      if (err) {
        reject(`setup bucket policy failed / error: ${err}`)
      } else {
        resolve(`setup bucket policy success.`)
      }
    })
  });
}

// 4. 上傳物件
const uploadBucket = function (data) {
  console.log('upload file to bucket ...');
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: data.bucketName,
      Key: 'index.html',
      Body: printHtmlFile(data.title, data.url, data.description, data.shareImgUrl, data.typeformID),
      ContentType: 'text/html',
    }

    s3.putObject(params, function(err, data) {
      if (err) {
        reject(`upload file to bucket failed / error: ${err}`)
      } else {
        resolve(`upload file to bucket success.`)
      }
    })
  })
}

// 5. 獲取 s3 static website
const getWebsiteInfo = (data) => {
  console.log('get static website info ...');
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: data.bucketName
    }

    s3.getBucketWebsite(params, (err, result) => {
      if (err) {
        reject(`upload file to bucket failed / error: ${err}`)
      } else {
        resolve(`http:${data.bucketName}.s3-website.us-east-2.amazonaws.com`)
      }
    })
  })
}

module.exports = {
  getWebsiteInfo: async (data) => {
    return await getWebsiteInfo(data)
  },
  create: async (data) => {
    const createBucketResult = await createBucket(data)
    console.log(createBucketResult);

    const setStaticWebsiteResult = await setStaticWebsite(data)
    console.log(setStaticWebsiteResult);

    const setPolicyBucketResult = await setPolicyBucket(data)
    console.log(setPolicyBucketResult);

    const uploadBucketResult = await uploadBucket(data)
    console.log(uploadBucketResult);

    return 'create flow - done!'
  },
  upload: async (data) => {
    return await uploadBucket(data)
  },
}
