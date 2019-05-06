var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var authenticate = require('./authenticate');
var passport = require('passport');

const url = 'mongodb://localhost:27017/mydb';
const connect = mongoose.connect(url, { useNewUrlParser: true, useCreateIndex: true });

connect.then((db) => {
    console.log("Connected to mongodb server");
}, (err) => { console.log(err); });

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var heroesRouter = require('./routes/heroes');
var villainsRouter = require('./routes/villains');

var app = express();

app.use(logger('dev'));
app.use(express.json()); // same as bodyParser.json()
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("my-secret-key"));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
    session({
        name: "session-id",
        secret: "secret-key",
        saveUninitialized: false,
        resave: false,
        store: new FileStore()
    })
);

app.use(passport.initialize());
app.use(passport.session());

function auth(req, res, next) {
    console.log(req.user);
    if (!req.user) {
        let err = new Error("You are not authenticated!");
        err.status = 403;
        return next(err);
    } else {
        next();
    }
}

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use(auth);
app.use('/heroes', heroesRouter);
app.use('/villains', villainsRouter);
module.exports = app;
