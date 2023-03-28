var mongoose = require('mongoose');

var reviewSchema = new mongoose.Schema({
    author: {type: String, required: true},
    rating: {type:Number, min:0, max:5},
    reviewText: {type: String, required: true}
})

var blogSchema = new mongoose.Schema({
    title: {type: String, required:true},
    subtitle: {type: String, default: null},
    content: {type: String, required:true},
    rating: {type: Number, default: 0, min: 0, max:5},
    reviews: [reviewSchema]

});


module.exports = mongoose.model('Blog', blogSchema)