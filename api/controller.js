const mongoose = require("mongoose");
const moment = require("moment");
const async = require("async");
const jwt = require("jsonwebtoken");
const uri = "mongodb+srv://basecampuser:basecamp101@cluster0.skpjt.mongodb.net/globussoft-task";
const app = require("../app");
const movies = require("../movies.json");
const Movie = require("../schemas/Movie").movieModel;
const Review = require("../schemas/Review").reviewModel;
const User = require("../schemas/User").userModel;

mongoose.connect(uri, () => {
    console.log("Connected to DB");
    // populateMovies();
})

// Seeding movies to DB

function populateMovies() {
    var payload = [];
    async.eachSeries(movies, (movie, callback) => {
        var ratings = movie.Ratings;
        var imdbRating = (movie && movie.Ratings && movie.Ratings.length) ? (ratings.find(el => (el.Source == 'Internet Movie Database')))['Value'] : null;
        var ratingInHalf = parseInt(imdbRating.split('/')[0]) / 2, reach;
        if (ratingInHalf >= 0 && ratingInHalf < 2.3) {
            reach = 'poor';
        } else if (ratingInHalf >= 2.3 && ratingInHalf < 3.6) {
            reach = 'average';
        } else {
            reach = 'hit';
        }

        payload.push({
            Title: movie.Title,
            Description: movie.Plot,
            Rating: movie.Rated,
            Genre: movie.Genre,
            Director: movie.Director,
            ReleaseDate: moment(movie.Released, "DD MMM YYYY").format(),
            Castings: movie.Actors,
            Reach: reach,
        })

        callback();
    }, function () {
        Movie.insertMany(payload).then(movies => {
            console.log("Added movies");
        })
            .catch(err => {
                console.log("Error adding movies", err);
            })
    })
}


// GET APIs for Movies & Cast

function getMoviesByRecentDate(req, res) {
    Movie.find({}).sort({ 'ReleaseDate': -1 }).then(movieData => {
        res.json({
            data: movieData
        });
    })
        .catch(err => {
            res.json({
                errorMessage: err
            });
        })
}

function getMoviesByReach(req, res) {
    Movie.aggregate([
        {
            "$project": {
                "Title": 1,
                "Description": 1,
                "Rating": 1,
                "Genre": 1,
                "Director": 1,
                "ReleaseDate": 1,
                "Castings": 1,
                "Reach": 1,
                "order": {
                    "$cond": {
                        if: { "$eq": ["$Reach", "hit"] }, then: 1,
                        else: {
                            "$cond": {
                                "if": { "$eq": ["$Reach", "average"] }, then: 2,
                                else: 3
                            }
                        }
                    }
                }
            }
        },
        { "$sort": { "order": 1 } },
        {
            "$project": {
                "Title": 1,
                "Description": 1,
                "Rating": 1,
                "Genre": 1,
                "Director": 1,
                "ReleaseDate": 1,
                "Castings": 1,
                "Reach": 1
            }
        }
    ],
    ).then(movieData => {
        res.json({
            data: movieData
        });
    })
        .catch(err => {
            res.json({
                errorMessage: err
            });
        })
}

function getCastByReach(req, res) {
    Movie.aggregate([
        {
            "$project": {
                "Castings": 1,
                "Title": 1,
                "order": {
                    "$cond": {
                        if: { "$eq": ["$Reach", "hit"] }, then: 1,
                        else: {
                            "$cond": {
                                "if": { "$eq": ["$Reach", "average"] }, then: 2,
                                else: 3
                            }
                        }
                    }
                }
            }
        },
        { "$sort": { "order": 1 } },
        {
            "$project": {
                "Castings": 1,
                "Title": 1
            }
        }
    ],
    ).then(castData => {
        res.json({
            data: castData
        });
    })
        .catch(err => {
            res.json({
                errorMessage: err
            });
        })
}


// User based APIs for Register, Login & Logout

function registerUser(req, res) {
    var { Name, Email, Username, Password } = req.body;
    var payload = {
        Name,
        Email,
        Username
    }

    User.find({ Email: Email }).then(userData => {
        if (userData.length) {
            res.json({
                message: "User already exists with this email Id"
            });
        } else {
            try {
                var registeredUser = new User(payload);
                registeredUser.password = registeredUser.generateHash(Password);
                registeredUser.save();

                res.json({
                    message: "User registered successfully !"
                })
            }

            catch (err) {
                res.json({
                    errorMessage: err
                })
            }
        }
    }).
        catch(err => {
            res.json({
                errorMessage: err
            })
        })
}

function login(req, res) {
    var { Email, Username, Password } = req.body;
    if (Email) {
        var filter = {
            Email
        }
    } else {
        var filter = {
            Username
        }
    }

    console.log('filter', filter);
    User.findOne(filter).then(async userData => {
        console.log('userData', userData)
        if (userData) {
            if (!User.validPassword(Password)) {
                res.json({
                    errorMessage: "Invalid EmailId or Password"
                })
            } else {
                try {
                    var token = jwt.sign(userData, process.env.JWT_SECRET);
    
                    var updated = await User.update(filter, { $set: { token: jwt.sign(userData, (process.env.JWT_SECRET || 'secret135') ) } });
                }

                catch(err) {
                    res.json({
                        errorMessage: err
                    })
                }

                res.json({
                    message: "Login successful",
                    token: token
                })
            }
        } else {
            res.json({
                errorMessage: "User not found"
            })
        }
    }).
        catch(err => {
            res.json({
                errorMessage: err
            })
        })
}

function logout(req, res) {
    User.update({ Username: Username }, { $set: { token: null } }).then(userData => {
        res.json({
            message: "Logged out successfully!"
        });
    }).
        catch(err => {
            res.json({
                errorMessage: err
            })
        })

}

function postReview(req, res) {
    var { Name, Review } = req.body;
    var payload = {
        Name,
        Review
    }

    Review.create(payload).then(reviewData => {
        res.json({
            message: "Review posted successfully"
        })
    })
        .catch(err => {
            res.json({
                errorMessage: err
            })
        })
}

module.exports = {
    getMoviesByRecentDate,
    getMoviesByReach,
    getCastByReach,
    registerUser,
    login,
    logout,
    postReview
}
