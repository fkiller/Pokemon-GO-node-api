'use strict';

// var MongoClient = require('mongodb').MongoClient
//     , assert = require('assert');
var Server = require("mongo-sync").Server;
var fs = require('fs');
var execSync = require('exec-sync');

// Connection URL
//var url = "mongodb://bigdad.eastus.cloudapp.azure.com:27017/navigo";

var config = {};
var cities = {};

if (fs.existsSync('./config.json')) {
    var file = fs.readFileSync('./config.json');
    config = JSON.parse(file);
} else {
    config.location0 = {
        type: 'coords',
        coords: {
            latitude: 38.02366156,
            longitude: -78.65867456,
            altitude: 0
        }
    };
    config.location = {
        type: 'coords',
        coords: {
            latitude: 40.785250,
            longitude: -73.98867456,
            altitude: 0
        }
    };
    config.location1 = {
        type: 'coords',
        coords: {
            latitude: 43.45304178,
            longitude: -71.76422378,
            altitude: 0
        }
    };
    config.deltalat = 0.0125764192139738;
    config.progress = 0;
    //config.deltalong = 0.00500;
}

if (fs.existsSync('./cities.us.json')) {
    var file = fs.readFileSync('./cities.us.json');
    cities = JSON.parse(file);
}

// MongoClient.connect(url, function (err, db) {
//     assert.equal(null, err);
//     console.log("Connected correctly to server");
//     init(db);
// });

function init() {
    // db.on('close', function () {
    //     console.log('DB connection closed');
    // });
    // db.on('reconnect', function () {
    //     console.log('DB reconnected');
    // });
    // db.pokestop = db.collection('pokestop');
    // console.log(db.pokestop);
    var Fiber = require('fibers');
    Fiber(function () {
        var url = "mongodb://localhost/navigo";
        var server = new Server('bigdad.eastus.cloudapp.azure.com');
        var dbpokestop = server.db('navigo').getCollection('pokestop');
        console.log('Starting from...' + config.progress + '/' + cities.length);
        for(var i = config.progress;i<cities.length;i++) {
            var city = cities[i];
//        cities.forEach(function (city) {
            var options = {
                mode: 'json',
                args: ['--latitude ' + city.lat, '--longitude ' + city.lng, '--SACSID ' + config.SACSID, '--csrftoken ' + config.csrftoken]
            };

            var cmd = 'python ../pokestop/pokestop.py ' + options.args.join(' ')
            console.log(cmd);
            var output = execSync(cmd);
            console.log(output);
            var results = JSON.parse(output);
            results.forEach(function (pokestop) {
                if (pokestop.guid) dbpokestop.update({ guid: pokestop.guid }, pokestop, { upsert: true });
            });
            fs.writeFileSync('./config.json', JSON.stringify(config));
        }
//        });
    }).run();
}

init();