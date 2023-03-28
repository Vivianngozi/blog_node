var mongoose = require('mongoose');
var dbURI = 'mongodb://localhost/blog';
mongoose.connect(dbURI);

mongoose.connection.on('connected', function() {
    console.log('Mongoose is connected to ' + dbURI);
});

mongoose.connection.on('error', function(err) {
    console.log('Mongoose error ' + err);

});

mongoose.connection.on('disconnected', function() {
    console.log('Mongoose disconnected');
});



require('./blog');
require('./users');