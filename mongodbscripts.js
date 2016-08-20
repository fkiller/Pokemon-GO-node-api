var createLoc = function() {
 db.pokestop.find({loc:{$exists:false}}).forEach(function(doc){
 doc.loc = {type:"Point",coordinates:[doc.longitude, doc.latitude]};
 db.pokestop.save(doc);
 });
 };
