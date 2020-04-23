//jshint esversion:8
// this is a model for course schema
const mongoose = require("mongoose");
const courseSchema = new mongoose.Schema({
   
    name:{
        type:String,
        required: true
    },
    price:{
        type:Number,
        require:true
    },
    code:{
        type:Number,
        required: true
    }
});

const Course = new mongoose.model("Course",courseSchema);

module.exports= Course;