'use strict';

var fs = require('fs');
var im = require('imagemagick');
var AWS = require('aws-sdk');
var S3 = new AWS.S3();

function resize(srcBucket, srcKey, dstBucket, dstKey, image, callback) {
    im.resize({width: 256, srcData: image, dstPath: '/tmp/' + dstKey}, function() {
        var thumbnail = fs.readFileSync('/tmp/' + dstKey);
        S3.putObject({
          Body: thumbnail,
          Bucket: dstBucket,
          ContentType: 'image/png',
          Key: dstKey,
          ACL: 'public-read'
        }).promise()
        .then(function() {
            console.log('Successfully resized ' + srcBucket + '/' + srcKey + ' and uploaded to ' + dstBucket + '/' + dstKey);
            callback(null, 'Successfully resized ' + srcBucket + '/' + srcKey + ' and uploaded to ' + dstBucket + '/' + dstKey);
        });
    });
}

function getS3Key(srcKey) {
  var s3Key = srcKey.replace(/\+/g, ' ');
  return decodeURIComponent(s3Key);
}

exports.handle = function(event, context, callback) {
  if (event.Records[0].eventName !== 'ObjectCreated:Put') {
    throw 'Eventname is not ObjectCreated:Put but ' + event.Records[0].eventName;
  }
  var srcBucket = event.Records[0].s3.bucket.name;
  var srcKey    = getS3Key(event.Records[0].s3.object.key);
  var dstBucket = process.env.BUCKET;

  S3.getObject({ Bucket: srcBucket, Key: srcKey }).promise()
  .then(function(response) {
    resize(srcBucket, srcKey, dstBucket, srcKey, response.Body, callback);
  })
  .catch(function(error) {
    callback(error);
  });
};
