'use strict';

var util = require('util');
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
        })
    });

}

exports.handle = function(event, context, callback) {
  var srcBucket = event.Records[0].s3.bucket.name;
  var srcKey    = event.Records[0].s3.object.key;
  var dstBucket = process.env.BUCKET;
  var dstKey    = "resized-" + srcKey;

  S3.getObject({ Bucket: srcBucket, Key: srcKey }).promise()
  .then(function(response) {
    resize(srcBucket, srcKey, dstBucket, dstKey, response.Body, callback);
  });
}
