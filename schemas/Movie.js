const mongoose = require("mongoose");

var Movie = new mongoose.Schema({
        "Title": {
            type: String,
            unique: true
        },
		"Description": {
            type: String
        },
		"Rating": {
            type: String
        },
		"Genre" : {
            type: String
        },
		"Director": {
            type: String
        },
		"ReleaseDate": {
            type: String
        },
		"Castings": {
            type: String
        },
		"Reach":{
            type: String,
            enum: ['hit', 'average', 'poor']
        }
})

var movieModel = mongoose.model('Movie', Movie);

module.exports = {
    movieModel
}