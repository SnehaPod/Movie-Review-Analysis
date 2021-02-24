const mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs');

var User = new mongoose.Schema({
    "Name": {
        type: String,
        required: true
    },
    "Email": {
        type: String
    },
    "Username": {
        type: String,
        unique: true
    },
    "Password": {
        type: String
    },
    "Token": {
        type: String
    }
})

User.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

User.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

var userModel = mongoose.model('ReviewUser', User);

module.exports = {
    userModel
}