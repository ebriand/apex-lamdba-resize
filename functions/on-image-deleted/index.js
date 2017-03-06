'use strict';

var AWS = require('aws-sdk');
var S3 = new AWS.S3();

exports.handle = function(event, context, callback) {
  if (event.Records[0].eventName !== 'ObjectRemoved:Delete') {
    throw 'Eventname is not ObjectRemoved:Delete but ' + event.Records[0].eventName;
  }
  var srcKey    = event.Records[0].s3.object.key;
  var dstBucket = process.env.BUCKET;

  S3.deleteObject({ Bucket: process.env.BUCKET, Key: srcKey }).promise()
  .then(function(response) {
    console.log('Successfully removed ' + process.env.BUCKET + '/' + srcKey);
    callback(null, 'Successfully removed ' + process.env.BUCKET + '/' + srcKey);
  });
};
