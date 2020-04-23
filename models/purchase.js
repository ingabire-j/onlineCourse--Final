//jshint esversion:8
// this is a model for purchase schema
const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    code:{
        type:Number,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    date:{
        type:Date,
        default:Date.now
    },
    email:{
        type:String,
        required: true
    }
});

const PurchaseItem = mongoose.model("PurchaseItem",purchaseSchema);

module.exports = PurchaseItem;