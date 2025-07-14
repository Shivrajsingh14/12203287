import mongoose from 'mongoose';

const clickSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now
    },
    referrer: {
        type: String,
        default: ''
    },
    userAgent: {
        type: String,
        default: ''
    },
    ip: {
        type: String,
        required: true
    },
    location: {
        country: { type: String, default: 'Unknown' },
        region: { type: String, default: 'Unknown' },
        city: { type: String, default: 'Unknown' }
    }
});

const urlSchema = new mongoose.Schema(
    {
    originalUrl: { 
        type: String, 
        required: true 
    },
    shortcode: { 
        type: String, 
        required: true, 
        unique: true 
    },
    shortUrl: { 
        type: String, 
        required: true, 
        unique: true 
    },
    validity: {
        type: Number,
        default: 30 // Default validity in minutes
    },
    expiryDate: {
        type: Date,
        required: true
    },
    clicks: { 
        type: Number, 
        default: 0 
    },
    clickDetails: [clickSchema],
    // Remove user requirement for pre-authorized access
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    // Password protection fields (keeping for existing functionality)
    isPasswordProtected: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        required: false
    },
    passwordAttempts: {
        type: Number,
        default: 0
    },
    // Active/disabled status for the link
    isActive: {
        type: Boolean,
        default: true
    },
    isExpired: {
        type: Boolean,
        default: false
    }
}, 
{
    timestamps: true
}
);

export default mongoose.model('Url', urlSchema); 