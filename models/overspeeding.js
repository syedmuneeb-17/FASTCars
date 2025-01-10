const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const overspeedingSchema = new Schema({
    name: { 
        type: String,
        required: true 
    }, 
    number_plate: { 
        type: String, 
        required: true 
    }, 
    email : {
        type: String,
        required: true,
        match: [/^[a-zA-Z0-9._%+-]+@nu\.edu\.pk$/, 'Please enter a valid email in the format anyname@nu.edu.pk'],
    },
    overspeeding_amount: { 
        type: Number, 
        required: true 
    }, 
    is_fine_paid: { 
        type: Boolean, 
        default: false 
    },
    created_at: { 
        type: Date,
        default: Date.now 
    }, 
    photo: {
        type: Object, // Accepts an object
        required: true,
    },
});

const Overspeeding = mongoose.model('Overspeeding', overspeedingSchema);

module.exports = Overspeeding;