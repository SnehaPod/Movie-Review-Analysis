const app = require("express")();
var getMoviesByRecentDate = require("./api/controller").getMoviesByRecentDate,
    getMoviesByReach = require("./api/controller").getMoviesByReach,
    getCastByReach = require("./api/controller").getCastByReach,
    verifyToken = require("./api/verifyToken").verifyToken,
    registerUser = require("./api/controller").registerUser,
    login = require("./api/controller").login,
    logout = require("./api/controller").logout,
    postReview = require("./api/controller").postReview;

var port = process.env.PORT || 8091;
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.listen(port, () => {
    console.log("App listening on port ", port);
})

// Movie routes
app.get('/api/movies/recent', getMoviesByRecentDate);
app.get('/api/movies/reach', getMoviesByReach);
app.get('/api/cast/reach', getCastByReach);

// User routes
app.post('/api/user/register', registerUser);
app.post('/api/user/login', login);
app.get('/api/user/logout', logout);

// Review routes
app.post('/api/user/post-review', postReview);

// Middleware routes
app.use('/api/user/logout', verifyToken);
app.use('/api/user/post-review', verifyToken);


module.exports = app;