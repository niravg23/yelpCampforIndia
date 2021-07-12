const mongoose = require('mongoose')
const Review = require('./review')
const User = require('./user')
const Schema = mongoose.Schema;
const opts = { toJSON: { virtuals: true } };

const imageSchema = new Schema({
    url: String,
    filename: String
})

imageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('upload', 'upload/w_200');
})

const campgroundSchema = new Schema({
    title: String,
    price: Number,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    images: [imageSchema],
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, opts)

campgroundSchema.virtual('properties.popup').get(function() {
    return `<strong><a href='/campgrounds/${this._id}' target="_blank">${this.title}</a>
    <p>${this.description.substring(0,20)}...</p></strong>`;
})

campgroundSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

const Campground = mongoose.model('Campground', campgroundSchema)
module.exports = Campground;