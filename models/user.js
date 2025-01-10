const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema =  new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
        
    },
    // password: {
    //     type: String,
    //     required: true
    // },
    number_plate: [{
        type: String,
        required: true,
        unique: true
    }],
    total_unpaid_fines: { 
        type: Number, 
        default: 0 
    },
    role: {
        type: String,
        enum: ["admin", "user","anonymous"], // 'admin' for admins, 'user' for regular users
        default: "anonymous",
    },
});  
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);
module.exports = User;