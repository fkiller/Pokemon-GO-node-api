var createLoc = function() {
 db.pokestop.find({loc:{$exists:false}}).forEach(function(doc){
 doc.loc = {type:"Point",coordinates:[doc.longitude, doc.latitude]};
 db.pokestop.save(doc);
 });
 };

db.pokestop.find({loc:{$nearSphere: {$geomerty:{type:"Point",coordinates:[-73.9667,40.78]},$maxDistance:5000}}}).count();
var dbscan = {
    Eps:1000,
    MinPts:5,
    dbscanmap : function() {
    emit(db.pokestop.find({loc:{$nearSphere: {$geometry:this.loc}}}).sort({loc:1}).limit(1).toArray()[0];}
};

};
var 

db.pokestop.find({loc:{$nearSphere: {$geometry:{type:"Point",coordinates:[-73.9667,40.78]},$maxDistance:1000}}}).sort({loc:1}).limit(1);