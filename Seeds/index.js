const mongoose = require('mongoose')
const Campground = require('../models/campground')
const { descriptors, places } = require('./seedHelpers')
const cities = require('./cities')


mongoose.connect('mongodb://localhost:27017/yelpcamp', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(() => {
        console.log("Mongo connection is open")
    })
    .catch(err => {
        console.log("Oops Error!")
        console.log(err)
    })


const sample = array => array[Math.floor(Math.random() * array.length)]

const ycDB = async() => {
    await Campground.deleteMany({})
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            author: "60e839176d9bb936307c3159",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            price: 30,
            geometry: {
                coordinates: [cities[random1000].longitude, cities[random1000].latitude],
                type: 'Point'
            },
            images: [{
                    url: 'https://res.cloudinary.com/ducihup/image/upload/v1625981840/yelpcamp/u1yzfb0ulatujx4kwuvr.jpg',
                    filename: 'yelpcamp/u1yzfb0ulatujx4kwuvr'
                },
                {
                    url: 'https://res.cloudinary.com/ducihup/image/upload/v1625936216/yelpcamp/oivcl6exv34owjrfwfi3.jpg',
                    filename: 'yelpcamp/oivcl6exv34owjrfwfi3'
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Mollitia laboriosam tenetur vel praesentium eos sint libero quod saepe consequatur, animi iste ipsa iure ratione molestiae culpa, incidunt voluptatem impedit ut!'
        })
        await camp.save()
    }
}

ycDB().then(d => {})
    .catch(err => {
        console.log(err)
    })