var express = require('express');
var router = express.Router();
var {expressjwt: jwt} = require('express-jwt');
var auth = jwt({
  secret: process.env.JWT_SECRET,
  requestProperty: 'payload',
  algorithms: ['HS256']
});

var ctrlBlog = require('../controllers/blogs');
var ctrlReviews = require('../controllers/reviews');
var ctrlAuth = require('../controllers/authentication');



// blog post
router.post('/blogs', auth, ctrlBlog.blogCreate);
router.get('/blogs/:blogid', ctrlBlog.blogReadOne);
router.put('/blogs/:blogid', auth, ctrlBlog.blogUpdate);
router.delete('/blogs/:blogid', auth, ctrlBlog.blogDelete);


// reviews on post
router.post('/blogs/:blogid/reviews', auth, ctrlReviews.reviewCreate);
router.get('/blogs/:blogid/reviews/:reviewid', ctrlReviews.reviewReadOne);
router.patch('/blogs/:blogid/reviews/:reviewid', auth, ctrlReviews.reviewUpdate);
router.delete('/blogs/:blogid/reviews/:reviewid', auth, ctrlReviews.reviewsDelete);

// register and login
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

module.exports = router