// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.
const yelp = require('yelp-fusion');
 
const client = yelp.client(process.env.apiKey);

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/:qwe", function (request, response) { 
  client.search({
    term:request.params.qwe,
    location: 'bicol, philippines'
  }).then(response => {
    console.log(response.jsonBody.businesses[0].name);
  }).catch(e => {
    console.log(e);
  });
});


app.get("/:qwe", function (request, response) {
  response.send(request.params.qwe)
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
