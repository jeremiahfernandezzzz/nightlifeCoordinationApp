// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var mongodb = require("mongodb")
var MongoClient = mongodb.MongoClient;
var url = process.env.DB_URL;
var session = require('express-session');
var passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy;
//var user = {};
var mongoose = require('mongoose');
var path = require('path');
var bodyParser = require('body-parser');

mongoose.connect(url);

var findOrCreate = require('mongoose-findorcreate')
var Schema = mongoose.Schema;
var UserSchema = new Schema({ twitterId: Number});
UserSchema.plugin(findOrCreate);
//var User = mongoose.model('User', UserSchema);
var User = mongoose.model('user-nightlife', UserSchema);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we're connected!")
});
'use strict';
 
const yelp = require('yelp-fusion');
 
const client = yelp.client(process.env.apiKey);
 

// Authentication configuration
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: 'bla bla bla' 
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: "http://fast-case.glitch.me/auth/twitter/callback"
},
  function(token, tokenSecret, profile, cb) {
  console.log(profile._raw.location);
    User.findOrCreate({ twitterId: profile.id, location: JSON.parse(profile._raw) }, function (err, user) {
      console.log('A new user from "%s" was inserted', user.location);
      return cb(err, user);
    });
  }));
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { successRedirect: '/',
                                     failureRedirect: '/login'}));

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static(__dirname + '/public/views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(__dirname + '/public/views'));

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  //console.log(JSON.stringify(request.users));
  if(request.user){
    response.redirect('/search');
  } else {
    response.sendFile(__dirname + '/public/views/results.html');
  }
});

app.get("/logout", function(request, response){
  request.logout();
  response.redirect('/');
})

app.get("/search", function(request,response){
  var loc = "";
  var userId = "";
  console.log(request.user);
  if(request.user){
    userId = request.user.twitterId;
    loc = request.user.location;
  } else {
    loc = request.query.q
  }
  
  var bus = {};
  client.search({
    //term:'bars',
    location: loc
  }).then(result => {
    //response.send(JSON.stringify(result).replace(/\\/g, /\n/))
    Object.values(result.jsonBody.businesses).forEach(function(res){
      bus[res.name] = res.id
    })
    bus = JSON.stringify(bus);
    //response.send(result.jsonBody.businesses[0]);
    response.sendFile(path.join(__dirname + '/public/views/results.html'), {headers: {"bus": bus}});
    console.log(bus);
  }).catch(e => {
  });
})
