'use strict';

var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');
var fs = require('fs');
var execSync = require('exec-sync');

// Connection URL
var url = "mongodb://bigdad.eastus.cloudapp.azure.com/navigo";
//var url = "mongodb://localhost:27017/navigo";

MongoClient.connect(url, function (err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server");
    init(db);
});

var config = {};

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
    //config.deltalong = 0.00500;
}

function init(db) {
    db.on('close', function () {
        console.log('DB connection closed');
    });
    db.on('reconnect', function () {
        console.log('DB reconnected');
    });
    for (; config.location.coords.latitude < config.location1.coords.latitude; config.location.coords.latitude = parseFloat((config.location.coords.latitude + config.deltalat).toFixed(6))) {
        config.deltalong = (config.deltalat * 360) / (Math.cos(config.location.coords.latitude * (Math.PI / 180)) * 40075);
        console.log('config.deltalong:' + config.deltalong);
        for (; config.location.coords.longitude < config.location1.coords.longitude && config.location.coords.longitude > config.location0.coords.longitude; config.location.coords.longitude = parseFloat(config.location.coords.longitude + config.deltalong).toFixed(6)) {
            var options = {
                mode: 'json',
                args: ['--latitude ' + config.location.coords.latitude, '--longitude ' + config.location.coords.longitude, '--SACSID '  + config.SACSID, '--csrftoken ' + config.csrftoken]
            };

            var cmd = 'python ../pokestop/pokestop.py ' + options.args.join(' ')
            console.log(cmd);
            var output = execSync(cmd);
            console.log(output);
            var results = JSON.parse(output);

            results.forEach(function (pokestop) {
                if (pokestop.guid) {
                    console.log('Upserting... ' + pokestop.guid);
                    db.collection('pokestop').update({ guid: pokestop.guid }, pokestop, { upsert: true });
                }
            });

            fs.writeFileSync('./config.json', JSON.stringify(config));
        }
        config.deltalat = -1 * config.deltalat;
    }
}