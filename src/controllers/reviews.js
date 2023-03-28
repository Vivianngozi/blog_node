var mongoose = require('mongoose');
const blog = require('../models/blog');

var Loc = mongoose.model('Blog');

module.exports.reviewCreate = function(req, res, next) {
    getAuthor(req, res, function(req, res){
        if(req.params.blogid){
            Loc.findById(req.params.blogid).select('reviews').exec((err, blog)=> {
                if(err) {
                    sendstatus(res, 400, err);
                } else {
                    blog.reviews.unshift({
                        author: req.body.author,
                        rating: req.body.rating,
                        reviewText: req.body.reviewText
                    });
                    blog.save((err, blog)=> {
                        var theReview;
                        if(err){
                            sendstatus(res, 404, err);
                        } else {
                            updateRating(blog._id);
                            theReview = blog.reviews[blog.reviews.length - 1];
                            sendstatus(res, 201, theReview);
                        }
                    })
                }
            })
        }
    });
    
}

// get reviews
module.exports.reviewReadOne = function(req, res, next) {
    if(req.params && req.params.blogid && req.params.reviewid) {
        Loc.findById(req.params.blogid).select('name reviews').exec((err, blog)=>{
            var response, review;
            if(!blog){
                sendstatus(res, 404, {
                    "message": "not found"
                });
                return;
            }else if (err) {
                sendstatus(res, 400, err);
            }
            if (blog.reviews && blog.reviews.length > 0){
                review = blog.reviews.id(req.params.reviewid);

                if(!review){
                    sendstatus(res, 401, {
                        "message": "review not found"
                    });
                    return;
                } else {
                    response = {
                        blog: {
                            title: blog.title,
                            id: req.params.blogid
                        },

                        review: review
                    }

                    sendstatus(res, 201, response);
                }
            } else{
                sendstatus(res, 401, {
                    "message": "not found at all"
                });
            }
        })
    } else {
        sendstatus(res, 400, {
            "message": "bad request"
        });
    }
}


module.exports.reviewUpdate = (req, res, next)=>{
    if(!req.params.blogid || !req.params.reviewid){
        sendstatus(res, 404, {
            "message": "not found"
        });
        return;
    }
    Loc.findById(req.params.blogid).select('reviews').exec((err, blog)=>{
        var theReview;
        if(!blog){
            sendstatus(res, 404, {
                "message": "can not find blogid"
            });
            return;
        } else if(err){
            sendstatus(res, 400, err);
            return;
        }
        if (blog.reviews && blog.reviews.length > 0) {
            theReview = blog.reviews.id(req.params.reviewid);
            if (!theReview) {
                sendstatus(res, 404, {
                    "message": "reviewid not found"
                });
            } else {
                theReview.author = req.body.author;
                theReview.rating = req.body.rating;
                theReview.reviewText = req.body.reviewText;
                blog.save(function(err, blog) {
                    if (err) {
                        sendstatus(res, 404, err);
                    } else {
                        updateRating(blog._id);
                        sendstatus(res, 200, theReview);
                    }
                });
            }
        } else{
            sendstatus(res, 404, {
                "message": "not found!"
            });
        }
    })
}


//  delete
module.exports.reviewsDelete= (req, res, next)=>{
    if(!req.params.blogid || !req.params.reviewid){
        sendstatus(res, 404, {
            "message" : "not found"
        });
        return;
    } 
    Loc.findById(req.params.blogid).select('reviews').exec((err, blog)=>{
        if(!blog){
            sendstatus(res, 404, {
                "message": "not found"
            });
            return;
        } else if(err){
            sendstatus(res, 401, err);

        }
        if(blog.reviews && blog.reviews.length >0){
            if(!blog.reviews.id(req.params.reviewid)){
                sendstatus(res, 404, {
                    "message": "not found"
                });
                return;
            } else{
                blog.reviews.id(req.params.reviewid).remove();
                blog.save((err)=>{
                    if(err){
                        sendstatus(res, 401, err);
                    } else{
                        updateRating(blog._id);
                        sendstatus(res, 204, null);
                    }
                })
            }
        } else {
            sendstatus(res, 404, {
                "message": "not found"
            });
        }
    })
}

var doAddReview = function(req, res, blog) { 
    if (!blog) {
        sendstatus(res, 404, {

            "message": "id not found"
        });

    } else {
        blog.reviews.unshift({ 
            author: req.body.author, 
            rating: req.body.rating, 
            reviewText: req.body.reviewText 
        }); 
        blog.save(function(err, blog) { 
            var theReview;
            if (err) {
                sendstatus(res, 400, err);
            } else {
                updateRating(blog._id); 
                theReview = blog.reviews[blog.reviews.length - 1]; 
                sendstatus(res, 201, theReview); 
             }
            });
        }
    };


var User = mongoose.model('User');
var getAuthor = function(req, res, cb) {
    if(req.payload && req.payload.email) {
        User.findOne({email : req.payload.email}).exec((err, user)=>{
            if(!user) {
                sendstatus(res, 404, {
                    "message": "no user found"
                });
                return;
            } else if(err) {
                console.log(err);
                sendstatus(res, 404, err);
                return;
            }
            cb(req, res, user.name);
        });
    } else{
        sendstatus(res, 404, {
            "message": "no user"
        });
        return;
    }
};

   
var updateRating = function(blogid) {
    Loc.findById(blogid).select('rating reviews').exec(function(err, blog) {
        if(!err){
            doAverageRating(blog);
        }
    });
};

var doAverageRating = function(blog) {
    var i, reviewCount, ratingAverage, ratingTotal;
    if(blog.reviews && blog.reviews.length > 0) {
        reviewCount = blog.reviews.length;
        ratingTotal = 0;
        for(i=0; i < reviewCount; i++){
            ratingTotal = ratingTotal + blog.reviews[i].rating;
        }
        ratingAverage = parseInt(ratingTotal / reviewCount, 10);
        blog.rating = ratingAverage;
        blog.save((err)=> {
            if (err) {
                console.log(err);
            } else {
                console.log('average rating updated to', ratingAverage);
            }
        })
    }
}





function sendstatus(res, status, content){
    return res.status(status).json(content);
}