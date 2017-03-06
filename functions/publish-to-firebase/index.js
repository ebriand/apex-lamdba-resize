'use strict';

var admin = require("firebase-admin");

var serviceAccount = require("./firebase-serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE
});


exports.handle = function(event, context, callback) {
  var srcKey    = event.Records[0].s3.object.key;

};
