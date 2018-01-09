"use strict";

var CryptoJS = require("crypto-js");
var randomstring = require("randomstring");

module.exports = function( packet_data ) {
	this.data = packet_data;
	
	this.getSignedPacket = function( secret ) {
		this.data.nonce = randomstring.generate(128);
		this.data.ts = "" + Math.floor(Date.now()/1000);
		
		var packet = {};
		packet.data = this.data;
		
		var key = this.data.nonce + this.data.ts + secret;
		
		packet.hash = CryptoJS.HmacSHA256( JSON.stringify( this.data ), key ).toString();
		
		return packet;
	};
};