// models/partners/Counter.js

import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
    // Name must be 'partnerId' to match the query in the controller
    name: { 
        type: String, 
        required: true, 
        unique: true 
    },
    // The sequence number
    seq: { 
        type: Number, 
        default: 0 
    }
});

// Mongoose will store this in a collection, usually named 'counters'
export default mongoose.model('Counter', counterSchema);