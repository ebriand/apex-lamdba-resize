'use strict';

var AWS = require('aws-sdk');
var S3 = new AWS.S3();

function getS3Key(srcKey) {
  var s3Key = srcKey.replace(/\+/g, ' ');
  return decodeURIComponent(s3Key);
}

exports.handle = function(event, context, callback) {
  if (event.Records[0].eventName !== 'ObjectRemoved:Delete') {
    throw 'Eventname is not ObjectRemoved:Delete but ' + event.Records[0].eventName;
  }
  var srcKey    = getS3Key(event.Records[0].s3.object.key);
  var dstBucket = process.env.BUCKET;

  S3.deleteObject({ Bucket: process.env.BUCKET, Key: srcKey }).promise()
  .then(function(response) {
    console.log('Successfully removed ' + process.env.BUCKET + '/' + srcKey);
    callback(null, 'Successfully removed ' + process.env.BUCKET + '/' + srcKey);
  });
};
