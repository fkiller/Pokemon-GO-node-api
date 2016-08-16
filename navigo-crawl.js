'use strict';

var PokemonGO = require('./poke.io.js');
var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');
var fs = require('fs');

// using var so you can login with multiple users
var a = new PokemonGO.Pokeio();

// Connection URL
var url = "mongodb://40.76.17.221:27017/navigo";
//var url = "mongodb://localhost:27017/navigo";

MongoClient.connect(url, function (err, db) {
    assert.equal(null, err);
    db.on('close', function () {
        console.log('DB connection closed');
    });
    db.on('reconnect', function () {
        console.log('DB reconnected');
    });
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
            latitude: 43.21366156,
            longitude: -78.65867456,
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
    config.deltalat = 0.00500;
    config.deltalong = 0.00500;
    config.username = process.env.PGO_USERNAME || 'mappull001';
    config.password = process.env.PGO_PASSWORD || '123412';
    config.provider = process.env.PGO_PROVIDER || 'ptc';
}

function init(db) {
    a.init(config.username, config.password, config.location, config.provider, function (err) {
        if (err) throw err;

        console.log('1[i] Current location: ' + a.playerInfo.locationName);
        console.log('1[i] lat/long/alt: : ' + a.playerInfo.latitude + ' ' + a.playerInfo.longitude + ' ' + a.playerInfo.altitude);

        a.GetProfile(function (err, profile) {
            if (err) throw err;

            console.log('1[i] Username: ' + profile.username);
            console.log('1[i] Poke Storage: ' + profile.poke_storage);
            console.log('1[i] Item Storage: ' + profile.item_storage);

            var poke = 0;
            if (profile.currency[0].amount) {
                poke = profile.currency[0].amount;
            }

            console.log('1[i] Pokecoin: ' + poke);
            console.log('1[i] Stardust: ' + profile.currency[1].amount);

            var start = setInterval(function () {
                a.Heartbeat(function (err, hb) {
                    if (err) {
                        console.log(err);
                        if (err === 'No result') {
                            clearInterval(start);
                            init(db);
                            return;
                        }
                    } else {
                        if (hb.cells) {
                            for (var i = hb.cells.length - 1; i >= 0; i--) {
                                for (var j = hb.cells[i].Fort.length - 1; j >= 0; j--) {   // You should check if it is near enough to use!!
                                    var fort = hb.cells[i].Fort[j];
                                    if (fort.FortId) {
                                        db.collection('forts').update({ FortId: fort.FortId }, fort, { upsert: true });
                                    }
                                }
                            }

                            config.location.coords.latitude += config.deltalat;
                            if (config.location.coords.latitude > config.location1.coords.latitude || config.location.coords.latitude < config.location0.coords.latitude) {
                                config.deltalat = -1 * config.deltalat;
                                config.location.coords.longitude += config.deltalong;
                            }

                            fs.writeFile('./config.json', JSON.stringify(config), function (err) {
                                if (err) {
                                    console.log('There has been an error saving your configuration data.');
                                    console.log(err.message);
                                    return;
                                }
                                console.log('Configuration saved successfully.')
                            });

                            if (config.location.coords.longitude > config.location1.coords.longitude) {
                                console.log('------------------end of work-------------------');
                                //console.log(JSON.stringify(pokestops));
                                process.exit();
                            }

                            a.SetLocation(config.location, function (err, data) {
                                if (err) console.log(err); else {
                                    console.log('moved');
                                    console.log(config.location);
                                }

                            });
                        }
                    }
                });
            }, 5000);

        });
    });
}