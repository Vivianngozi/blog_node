var password = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var user = mongoose.model('User');

password.use(new LocalStrategy({
    usernameField: 'email'
},
function(username,password, done) {
    user.findOne({ email: username }, function (err, user) {
        if (err) {return done(err);}
        if(!user) {
            return done(null,false, {
                message: 'Incorrect usrname. '
            });
        }
        if (!user.validPassword(password)) {
            return done(null, false, {
                message: 'Incorrect password.'
            });
        }
        return done(null, user);
    });
}
));