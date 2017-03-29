"use strict";

var express = require( 'express' ),
    router = express.Router(),
    passport = require( 'passport' ),
    debug = require( 'debug' )( 'atoms:routes:auth' ),
    getLine = require('../utils').getLine,
    slack = require( '../slack' ),
    SlackStrategy = require( 'passport-slack' ).Strategy,
    GoogleStrategy = require( 'passport-google-oauth' ).OAuth2Strategy,
    GitHubStrategy = require( 'passport-github' ).Strategy;

var config = require( '../config' );

var backend = require( '../' + config.backend );

function checkOauthService( user, done ) {
    debug( getLine(), user );

    if( user.admin ) {
        user.admin = true;
        return done( null, user );
    }

    backend.checkUser( user ).then( function( valid ) {
    	debug( getLine(), valid );
    	user.authenticated = valid;
    	done( null, user );
    }).catch(done);
}

passport.use( new SlackStrategy(
	{
		clientID: config.authentication.slack.clientID,
        clientSecret: config.authentication.slack.clientSecret,
        callbackURL: config.callbackHost + "/auth/slack/callback"
    },
    function( accessToken, refreshToken, profile, done ) {
        var user = {
            id: profile.id,
            provider: profile.provider,
            name: profile.displayName
        };
        checkOauthService( user, done );
    }
));

router.get( "/slack/callback", passport.authenticate(
	'slack',
	{
        failureRedirect: '/error',
        successRedirect: '/'
    }
));

router.get( "/slack", passport.authenticate(
	'slack',
	{
		scope: [
            'identify',
            'groups:read'
        ],
        team: config.authentication.slack.team
    }
));

passport.use( new GoogleStrategy(
	{
        clientID: config.authentication.google.clientID,
        clientSecret: config.authentication.google.clientSecret,
        callbackURL: config.callbackHost + "/auth/google/callback"
    },
    function( accessToken, refreshToken, profile, done ) {
        var user = {
            id: profile.id,
            provider: profile.provider,
            name: profile.displayName
        };
        checkOauthService( user, done );
    }
));

router.get( '/google', passport.authenticate(
    'google',
    {
        scope: 'email',
        accessType: 'online',
        approvalPrompt: 'auto'
    }
));

passport.use( new GitHubStrategy(
	{
        clientID: config.authentication.github.clientID,
        clientSecret: config.authentication.github.clientSecret,
        callbackURL: config.callbackHost + "/auth/github/callback"
    },
    function( accessToken, refreshToken, profile, done ) {
        var user = {
            id: profile.id,
            provider: profile.provider,
            name: profile.displayName
        };
        checkOauthService( user, done );
    }
));

router.get( "/google/callback", passport.authenticate(
    'google',
    {
        failureRedirect: '/error',
        successRedirect: '/'
    }
));

router.get( '/github', passport.authenticate( 'github' ) );

router.get( "/github/callback", passport.authenticate(
    'github',
    {
        failureRedirect: '/error',
        successRedirect: '/'
    }
));

passport.serializeUser( function( user, done ) {
    var serialized = JSON.stringify( user );
    done( null, serialized );
});

passport.deserializeUser( function( serialized, done ) {
    done( null, JSON.parse( serialized ) );
});

module.exports.addMiddleware = function( app ) {
    app.use( passport.initialize() );
    app.use( passport.session() );
};

router.get( '/logout', function( req, res ) {
    req.logout();
    res.redirect( '/' );
});

module.exports.requireAdmin = function( req, res, next ) {
    if( req.user && req.user.administrator ) {
        return next();
    }
    res.status( 403 ).send( 'Forbidden (Admin required)- Please <a href="/">login</a>' );
};

module.exports.requireAuthenticated = function( req, res, next ) {
    if( req.user && req.user.authenticated ) {
        return next();
    }
    res.status( 403 ).send( 'Forbidden - Please <a href="/">login</a>' );
};

module.exports.router = router;
module.exports.passport = passport;
