// jshint esversion:8

// this is a model for blog as well as blog schema where the blogs' related data will be saved.
const mongoose = require("mongoose");
const blogSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    title:{
        type:String,
        required:true
    },
    blog:{
        type:String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now
    }
});

const Blog = mongoose.model("Blog",blogSchema);

module.exports = Blog;