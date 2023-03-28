var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');


module.exports.register = function(req, res) {
    if(!req.body.name || !req.body.email || !req.body.password) { 
        sendstatus(res, 400, { 
            "message": "All fields required" 
    
        }); 
    
        return; 
    
    } 
    
    var user = new User(); 
    user.email = req.body.email;
    user.name = req.body.name; 
     
    user.setPassword(req.body.password);
    user.save(function(err) { 
    
        var token;
    
        if (err) {
        
            sendstatus(res, 404, err);
    
        } else {
    
            token = user.generateJwt(); 
    
            sendstatus(res, 200, { 
    
                "token" : token 
    
            }); 
    
        }
    
    });
   
};


// login
module.exports.login = (req,res, next)=>{
    if(!req.body.email || !req.body.password){
        sendstatus(res, 400, {
            "message": "All fields required"
        });
        return;
    }

    passport.authenticate('local', (err, user, info)=>{
        var token;

        if(err) {
            sendstatus(res, 400, err);
            return;
        }

        if(user) {
            token = user.generateJwt();
            sendstatus(res, 200, {
                "token": token
            });
        } else {
            sendstatus(res, 401, info);
        }
    }) (req, res);
}


var sendstatus=(res, status, content)=>{
    res.status(status)
    res.json(content)
 }