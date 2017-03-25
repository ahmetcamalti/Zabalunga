var express = require('express');
var rand = require("random-key");
var random_name = require('node-random-name');
var router = express.Router();
var helpers = require('../helpers');

var User = require('../models/user');
var Travel = require('../models/travel');

const crypto = require('crypto');

function generateNewUser(username, travels){
  if (travels)
    return User({username: username, private_key: rand.generate(), travels:travels});
  else
    return User({username: username, private_key: rand.generate()});
}

/* GET users listing. */
router.get('/all', function(req, res, next) {
  // get all the users
  User.find({}, function(err, result) {
    if (err){
      response = helpers.respond(0,err);
    }else{
      response = helpers.respond(1,"all users",result);
    }

    // save the result into the response object.
    res.json(response);
  });
});

/* add new user */
router.get('/addUser/:username', function(req, res, next) {
  // check is there a param?
  var response;
  if (!req.params.username) {
    response = helpers.respond(0, "There isn't any user parameter!");
    console.log(response);
    res.json(response);
  }else{
    // create a new user
    var newUser = generateNewUser(req.params.username);

    // save the user
    newUser.save(function(err, user) {
      if (err){
        response = helpers.respond(0,err);
        console.log(response);
      }else{
        response = helpers.respond(1,"User added to database with success!", user);
      }
      res.json(response);
    });
  }
});

/* remove all users */
router.get('/clear', function(req, res, next) {
  // get all the users
  User.remove({}, function(err, result) {
    // remove all budgeds data
    if (err) {
      response = helpers.respond(0,message);
      console.log(response);
    } else {
      response = helpers.respond(1,"clear users success", []);
    }
    res.json(response);
  });
});

// get my travels
router.get('/myTravels/:u_name/:p_key', function(req, res, next){

  var username = req.params.u_name;
  var private_key = req.params.p_key;

  User.findOne({username: username, private_key:private_key}).populate('travels').exec()
  .then(function(user){
    response = helpers.respond(1, "get my travels", user.travels);
  })
  .then(undefined, function(err){
    //Handle error
    response = helpers.respond(0, 'error in myTravels/:u_name:/:p_key');
    console.log(response);
  });
  res.json(response);
});

// generates dummy users
router.get('/dummy', function(req, res, next){

  for (var i = 0; i < 10; i++){
    
    Travel.findRandom({},{},{limit:3},function(err, results){
      if (err) {
        response = helpers.respond(0,'travel find random error');
        console.log(response);
      }else{
        var uname = random_name();
        var u = generateNewUser(uname, results);
        u.save(function(err, user){
          if (err) {
            response = helpers.respond(0,'error in dummy user generation');
            console.log(response);
          }
          if (i == 9){
            console.log("added 10 users");
            response = helpers.respond(1,"added 10 users", []);
          }
          for ( var j = 0; j < results.length; j++){
            var r = results[j];
            r.users.push(u._id);
            r.going_cnt = r.going_cnt + 1;
            r.save(function(err, re){
              if (err){
                response = helpers.respond(0,'travel find random error');
              }
            });
          }
        });
      }

    });
  }
  res.json(response);
});

module.exports = router;
