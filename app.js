'use strict';

var express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
	LevelStore = require('express-session-level')(session),
	sessionDB = require('level')('./shared/sessiondb'),
    debug = require('debug')('atoms:app'),
    getLine = require('./utils').getLine,
    routes = require('./routes');

var app = express();
var server = require('http').Server(app);

var init = false;

// view engine setup
app.set( 'views', path.join(__dirname, 'views') );
app.set( 'view engine', 'pug' );

app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( cookieParser() );
app.use( session({
	store: new LevelStore(sessionDB),
    resave: false,
    saveUninitialized: false,
    secret: 'up and at them!',
    proxy: true,
	cookie: { maxAge: 3600000 }
}) );

module.exports.addHandler = function(path, handler){
    app.use(path, handler);
};

module.exports.app = function(){
    if (!init) {
        routes.addMiddleware(app);
        app.use('/', routes.router);
        routes.addErrorHandlers(app);

        app.use(express.static(path.join(__dirname, 'public')));

        // catch 404 and forward to error handler
        app.use(function (req, res, next) {
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        });

        // production error handler
        app.use(function (err, req, res, next) {
            debug(getLine(), err);
            res.status(err.status || 500);
            res.render('error', {
                message: err.message || err,
                error: {}
            });
        });
        init = true;
    }

    return app;
};

module.exports.server = server;