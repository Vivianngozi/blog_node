var mongoose = require('mongoose');
var Loc = mongoose.model('Blog');

// create
module.exports.blogCreate = function(req, res, next) {
    getAuthor(req, res, function(req,res){
            Loc.create({
                title: req.body.title,
                subtitle: req.body.subtitle,
                content: req.body.content
            },
            function(err, blog){
                if(err) {
                    sendstatus(res, 401, err);
                    return;
                } else{
                    sendstatus(res, 201, blog);              
            }
        }); 
    });          
}



// get one
module.exports.blogReadOne =(req, res, next)=>{
    if(req.params && req.params.blogid) {
        Loc.findById(req.params.blogid).exec((err, blog)=>{
            if(!blog){
                sendstatus(res, 401, {
                    "message": "no blog found"
                });
            } else if(err){
                sendstatus(res, 400, err);
            }
            sendstatus(res, 200, blog);
        });
    }else {
        sendstatus(res, 401, {
            "message": "No id found"
        });
    }
}

// update

module.exports.blogUpdate = (req, res, next)=>{
    if(!req.params.blogid){
        sendstatus(res, 401, {
            "message": "No blog id found!"
        });
        return;
    }
    Loc.findById(req.params.blogid).select('-reviews -rating').exec((err, blog)=>{
        if(!blog){
            sendstatus(res, 401, {
                "message": "blog not found"
            });
        } else if (err) {
            sendstatus(res, 401, err);
        }
        blog.title = req.body.title;
        blog.subtitle = req.body.subtitle;
        blog.content = req.body.content;

        blog.save((err, blog)=>{
            if(err) {
                sendstatus(res, 401, err);
                return;
            } else {
                sendstatus(res, 201, blog);
            }
        })
    });

}

// delete

module.exports.blogDelete = function(req, res, next){
    if(req.params.blogid){
        Loc.findByIdAndRemove(req.params.blogid).exec((err, blog)=>{
            if(err){
                sendstatus(res, 404, err);
            }else{
                sendstatus(res, 204, null);
            }
        });
    } else {
        sendstatus(res, 404, {
            "message": "no blog post found"
        });
    }
}


function sendstatus(res, status, content) {
    return res.status(status).json(content);
}

var User = mongoose.model('User');
var getAuthor = function(req, res, callback){
    if (req.payload && req.payload.email){
        User.findOne({email: req.payload.email}).exec(function(err, user){
            if(!user){
                sendstatus(res, 404, {"message": "User not found"});
                return;
            } else if (err){
                console.log(err);
                sendstatus(res, 404, err);
                return;
            }
            callback(req, res, user.name);
        });
    } else {
        sendstatus(res, 404, {
            "message": "no user"
        });
        return;
    }
}