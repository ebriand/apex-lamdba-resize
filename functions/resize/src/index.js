const util = require('util');
var AWS = require('aws-sdk');
var S3 = new AWS.S3();
var Jimp = require('jimp');

var BUCKET = "zenika-serverless-thumbnail";

export default function(event, context, callback) {
  var srcBucket = event.Records[0].s3.bucket.name;
  var srcKey    = event.Records[0].s3.object.key;
  var dstBucket = BUCKET;
  var dstKey    = "resized-" + srcKey;

  // Infer the image type.
  var typeMatch = srcKey.match(/\.([^.]*)$/);
  var imageType = typeMatch[1];

  S3.getObject({ Bucket: srcBucket, Key: srcKey }).promise()
  .then((response) => Jimp.read(response.Body))
  .then((image) => {
    image.resize(100, Jimp.AUTO).getBuffer(Jimp.MIME_PNG, (err, thumbnail) => {
      S3.putObject({
        Body: thumbnail,
        Bucket: dstBucket,
        ContentType: 'image/png',
        Key: dstKey
      }).promise()
      .then(() => {
          console.log('Successfully resized ' + srcBucket + '/' + srcKey + ' and uploaded to ' + dstBucket + '/' + dstKey);
          callback(null, "done.");
      })
      .catch(function(err) {
        callback('Unable to resize ' + srcBucket + '/' + srcKey + ' and upload to ' + dstBucket + '/' + dstKey + ' due to an error: ' + err);
      })
    });
  });
}
