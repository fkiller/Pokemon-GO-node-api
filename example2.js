'use strict';

var PokemonGO = require('./poke.io.js');

// using var so you can login with multiple users
var a = new PokemonGO.Pokeio();
var b = new PokemonGO.Pokeio();

var redis = require("redis"),
    client = redis.createClient();

client.on("error", function (err) {
    console.log("Error " + err);
});
//Set environment variables or replace placeholder text
// var location = {
//     type: 'name',
//     name: process.env.PGO_LOCATION || 'Times Square'
// };

var location = {
    type: 'coords',
    coords: {
        latitude:38.02366156,
        longitude:-78.65867456,
        altitude:0
    }
};
//var location0 = location;
var location0 = {
    type: 'coords',
    coords: {
        latitude:43.21366156,
        longitude:-78.65867456,
        altitude:0
    }
};
client.get('lastLat',function(err, reply){
    if (!err) {
        location0.coords.latitude = parseFloat(reply.toString());
    }
});
client.get('lastLong',function(err, reply){
    if (!err) {
        location0.coords.longitude = parseFloat(reply.toString());
    }
});
var location1 = {
    type: 'coords',
    coords: {
        latitude:43.45304178,
        longitude:-71.76422378,
        altitude:0
    }
};
// var location1 = {
//     type: 'coords',
//     coords: {
//         latitude:40.712361,
//         longitude:-73.979283,
//         altitude:0
//     }
// };

var deltalat = 0.00500, deltalong = 0.00500;
client.get('lastdLat',function(err, reply){
    if (!err && reply) {
        deltalat = parseFloat(reply.toString());
    }
});
var pokestops = {};

var username1 = process.env.PGO_USERNAME || 'won.hard.001@gmail.com';
var password1 = process.env.PGO_PASSWORD || '123412';
var provider1 = process.env.PGO_PROVIDER || 'google';

var username = process.env.PGO_USERNAME || 'mappull001';
var password = process.env.PGO_PASSWORD || '123412';
var provider = process.env.PGO_PROVIDER || 'ptc';

function init() {
a.init(username, password, location0, provider, function(err) {
    if (err) throw err;

    console.log('1[i] Current location: ' + a.playerInfo.locationName);
    console.log('1[i] lat/long/alt: : ' + a.playerInfo.latitude + ' ' + a.playerInfo.longitude + ' ' + a.playerInfo.altitude);

    a.GetProfile(function(err, profile) {
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

        var start = setInterval(function(){
            a.Heartbeat(function(err,hb) {
                if(err) {
                    console.log(err);
                    if (err==='No result') {
                        clearInterval(start);
                        init();
                        return;
                    }
                } else {

                if (hb.cells) {

                for (var i = hb.cells.length - 1; i >= 0; i--) {
//                    console.log(hb.cells[i]);
                // Get object from pokestop (use async lib to iterate should be better)
                for (var j = hb.cells[i].Fort.length - 1; j >= 0; j--)
                {   // You should check if it is near enough to use!!
                    var fort = hb.cells[i].Fort[j];
                    if (fort.FortId) {
                        //pokestops[fort.FortId] = fort;
                        client.set(fort.FortId, JSON.stringify(fort), redis.print);
                    }
                    //console.log(fort);
                    // if(fort.FortType == 1 && fort.Enabled)
                    // {   // 1 = PokeStop
                    //     // 0 = GYM
                    //     a.GetFort(fort.FortId, fort.Latitude, fort.Longitude, function(err, fortresponse){
                    //         console.log(err);
                    //         console.log(fortresponse);
                    //         if(fortresponse.result == 1)
                    //         {   // 1 = success
                    //             // 2 = out of range ..
                    //             console.log(fort.FortId + " used!!");
                    //         }
                    //     });
                    // }
                }
                    // if(hb.cells[i].NearbyPokemon[0]) {
                    //     //console.log(a.pokemonlist[0])
                    //     var pokemon = a.pokemonlist[parseInt(hb.cells[i].NearbyPokemon[0].PokedexNumber)-1];
                    //     console.log('1[+] There is a ' + pokemon.name + ' near.');
                    // }
                }

                client.set("lastLat",location0.coords.latitude);
                client.set("lastLong",location0.coords.longitude);

                location0.coords.latitude += deltalat;
                
                if (location0.coords.latitude > location1.coords.latitude || location0.coords.latitude < location.coords.latitude) {
                    deltalat = -1*deltalat;
                    client.set("lastdLat",deltalat);
                    location0.coords.longitude += deltalong;
                }
                if (location0.coords.longitude > location1.coords.longitude) {
                    console.log('------------------end of work-------------------');
                    console.log(JSON.stringify(pokestops));
                    process.exit();
                }

                a.SetLocation(location0, function(err, data) {
                    if (err) console.log(err); else {
                        console.log('moved');
                        console.log(location0);
                    }

                });
                }
                }
            });
        }, 5000);

    });
});
}

init();
// b.init(username1, password1, location1, provider1, function(err) {
//     if (err) throw err;

//     console.log('[i] Current location: ' + b.playerInfo.locationName);
//     console.log('[i] lat/long/alt: : ' + b.playerInfo.latitude + ' ' + b.playerInfo.longitude + ' ' + b.playerInfo.altitude);

//     b.GetProfile(function(err, profile) {
//         if (err) throw err;

//         console.log('[i] Username: ' + profile.username);
//         console.log('[i] Poke Storage: ' + profile.poke_storage);
//         console.log('[i] Item Storage: ' + profile.item_storage);

//         var poke = 0;
//         if (profile.currency[0].amount) {
//             poke = profile.currency[0].amount;
//         }

//         console.log('[i] Pokecoin: ' + poke);
//         console.log('[i] Stardust: ' + profile.currency[1].amount);

//         setInterval(function(){
//             b.Heartbeat(function(err,hb) {
//                 if(err) {
//                     console.log(err);
//                 }

//                 for (var i = hb.cells.length - 1; i >= 0; i--) {
//                     if(hb.cells[i].NearbyPokemon[0]) {
//                         //console.log(a.pokemonlist[0])
//                         var pokemon = b.pokemonlist[parseInt(hb.cells[i].NearbyPokemon[0].PokedexNumber)-1];
//                         console.log('[+] There is a ' + pokemon.name + ' at ' + hb.cells[i].NearbyPokemon[0].DistanceMeters.toString() + ' meters');
//                     }
//                 }

//                 // Show MapPokemons (catchable) & catch
//                 for (i = hb.cells.length - 1; i >= 0; i--) {
//                     for (var j = hb.cells[i].MapPokemon.length - 1; j >= 0; j--)
//                     {   // use async lib with each or eachSeries should be better :)
//                         var currentPokemon = hb.cells[i].MapPokemon[j];

//                         (function(currentPokemon) {
//                             var pokedexInfo = b.pokemonlist[parseInt(currentPokemon.PokedexTypeId)-1];
//                             console.log('[+] There is a ' + pokedexInfo.name + ' near!! I can try to catch it!');

//                             b.EncounterPokemon(currentPokemon, function(suc, dat) {
//                                 console.log('Encountering pokemon ' + pokedexInfo.name + '...');
//                                 b.CatchPokemon(currentPokemon, 1, 1.950, 1, 1, function(xsuc, xdat) {
//                                     var status = ['Unexpected error', 'Successful catch', 'Catch Escape', 'Catch Flee', 'Missed Catch'];
//                                     console.log(status[xdat.Status]);
//                                 });
//                             });
//                         })(currentPokemon);

//                     }
//                     }
//             });
//         }, 5000);

//     });
// });
