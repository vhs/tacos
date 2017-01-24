# Automated Tool Operation Management System

Used to manage and control access to device as used in a hack-/makerspace.

This software uses a SQLite database for its tool configuration, but fully function based on a configurable authentication back-end.

## Installation [Ubuntu Installation below]

- Install node.js
- Install modules

For development:
	
    npm install

For production:

    npm install --production

## Config

Start by adding a new config.json file, see config.json.sample for an example.

## OAuth Access

When setting up OAuth providers, the callback set in the provider should be http://<host>/oauth/(github|google|slack)/callback.

For google callbacks you cannot use internal IP addresses however you can use a host name with a valid domain name regardless if
the IP resolves to an internal or external address.

## Testing

If dev dependencies are installed you can run all test cases with

    npm test

## Running

To set the port set the environment variable PORT to whatever port you want to listen to, by default it's 3000

    npm start

To enable debug logging then set the environment variable DEBUG to atoms:* to log all laser related events.

## Acknowledgements

Based on original work by garthomite on https://github.com/vhs/vhs-laser-access/
