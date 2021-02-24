const jwt = require("jsonwebtoken");
const User = require("../schemas/User").userModel;

function verifyToken(req, res, next) {
    if (req.headers.authorization) {
        var token = (req.headers.authorization).split(' ')[1];

        var Username = jwt.verify(token, (process.env.JWT_SECRET || 'secret135')).Username;

        User.findOne({ Username: Username }, { $set: { token: null } }).then(userData => {
            if (userData) {
                next();
            } else {
                res.status(401).json({
                    errorMessage: "Unauthorized"
                })
            }
        }).
            catch(err => {
                res.json({
                    errorMessage: err
                })
            })
    } else {
        res.status(401).json({
            errorMessage: "Unauthorized"
        })
    }
}

module.exports = {
    verifyToken
}