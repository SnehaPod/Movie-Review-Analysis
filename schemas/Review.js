const mongoose = require("mongoose");

var Review = new mongoose.Schema({
        "Name": {
            type: String
        },
		"Review": {
            type: String
        }
})

var reviewModel = mongoose.model('Review', Review);

module.exports = {
    reviewModel
}