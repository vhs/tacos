"use strict";

const path = require('path')

var Promise = require('bluebird'),
	_ = require('underscore'),
	debug = require('debug')('atoms:lib:stores:terminals'),
	{ getLine } = require('../../utils'),
	{ config } = require('../../config'),
	EventEmitter = require('events').EventEmitter,
	emitter = new EventEmitter(),
	loki = require('lokijs'),
	CryptoJS = require("crypto-js");

var TerminalStore = function (dataDir, options) {
	options = options || { persistence: true }

	this.terminalDB = new loki(path.resolve(dataDir, 'terminalStore.json'))
	this.terminalDB.loadDatabase({}, () => {
		debug(getLine(), "Loading database...");
		debug(getLine(), "Loading terminals collection...");
		this.terminals = this.terminalDB.getCollection('terminals');
		if (this.terminals === null) {
			debug(getLine(), "Collection not found!");
			debug(getLine(), "Adding collection!");
			this.terminals = this.terminalDB.addCollection('terminals', { indices: ['id'], autoupdate: true });
		}
	});

	if (options.persistence)
		setInterval(() => {
			debug(getLine(), "Autosaving");
			this.terminalDB.saveDatabase();
		}, options.save_interval);
}

TerminalStore.prototype.getAllTerminals = function () {
	return this.terminals.find({ 'id': { '$ne': '' } });
};

TerminalStore.prototype.getAvailableTerminals = function (user) {
	var terminals_list = {};

	this.getAllTerminals().forEach(function (terminal) {
		if (this.checkTerminalAccess(terminal.id, user))
			terminals_list[terminal.id] = terminal;
	});

	return terminals_list;
};

TerminalStore.prototype.registerTerminal = function (terminal_id) {
	debug(getLine(), 'registerTerminal', 'Trying...', terminal_id)

	let terminalResult = this.terminals.findOne({ 'id': terminal_id });

	if (terminalResult === null) {
		terminalResult = {
			"id": terminal_id,
			"description": terminal_id,
			"target": "",
			"enabled": 0,
			"secure": 0,
			"secret": ""
		};

		terminalResult = this.terminals.insert(terminalResult);
	}

	terminalResult.last_seen = Date.now();

	this.terminals.update(terminalResult);

	return terminalResult;
};

TerminalStore.prototype.enableTerminal = function (terminal_id) {
	let terminalResult = this.terminals.findOne({ 'id': terminal_id });

	if (terminalResult === null)
		return { "error": "No such terminal" };

	terminalResult.enabled = 1;

	var result = {};
	result.id = terminalResult.id;
	result.enabled = terminalResult.enabled;

	return this.getTerminalDetails(terminal_id);
};

TerminalStore.prototype.disableTerminal = function (terminal_id) {
	let terminalResult = this.terminals.findOne({ 'id': terminal_id });

	if (terminalResult === null)
		return { "error": "No such terminal" };

	terminalResult.enabled = 0;

	return this.getTerminalDetails(terminal_id);
};

TerminalStore.prototype.updateTerminalDescription = function (terminal_id, description) {
	let terminalResult = this.terminals.findOne({ 'id': terminal_id });

	terminalResult.description = description;

	return this.getTerminalDetails(terminal_id);
};

TerminalStore.prototype.updateTerminalEnabled = function (terminal_id, toggle) {
	let terminalResult = this.terminals.findOne({ 'id': terminal_id });

	debug(getLine(), 'TerminalStore.prototype.updateTerminalEnabled', typeof toggle);

	if (toggle === 1 || toggle === 'on') {
		terminalResult.enabled = 1;
	} else {
		terminalResult.enabled = 0;
	}

	return this.getTerminalDetails(terminal_id);
};

TerminalStore.prototype.updateTerminalSecret = function (terminal_id, secret) {
	let terminalResult = this.terminals.findOne({ 'id': terminal_id });

	terminalResult.secret = secret;

	return this.getTerminalDetails(terminal_id);
};

TerminalStore.prototype.updateTerminalTarget = function (terminal_id, target) {
	let terminalResult = this.terminals.findOne({ 'id': terminal_id });

	terminalResult.target = target;

	return this.getTerminalDetails(terminal_id);
};

TerminalStore.prototype.updateTerminalHasSecret = function (terminal_id, hasSecret) {
	let terminalResult = this.terminals.findOne({ 'id': terminal_id });

	terminalResult.hasSecret = hasSecret;

	return this.getTerminalDetails(terminal_id);
};

TerminalStore.prototype.getTerminalList = function () {
	return this.getAllTerminals();
};

TerminalStore.prototype.checkTerminalEnabled = function (terminal_id) {
	let terminalResult = this.terminals.findOne({ 'id': terminal_id });

	debug(getLine(), 'checkTerminalEnabled', 'terminalResult', terminalResult);

	if (terminalResult && (terminalResult.enabled === true) || (terminalResult.enabled === 1))
		return true;

	return false;
};

TerminalStore.prototype.checkTerminalHasTarget = function (terminal_id) {
	let terminalResult = this.terminals.findOne({ 'id': terminal_id });

	if (terminalResult && terminalResult.target !== "")
		return true;

	return false;
};

TerminalStore.prototype.getTerminalTarget = function (terminal_id) {
	let terminalResult = this.terminals.findOne({ 'id': terminal_id });

	return terminalResult.target;
};

TerminalStore.prototype.getTerminalState = function (terminal_id) {
	let terminalResult = this.registerTerminal(terminal_id);

	let result = {};
	result.result = "OK";
	result.hasTarget = terminalResult.target.length ? true : false;
	result.secure = terminalResult.secure;

	return result;
};

TerminalStore.prototype.getTerminalDetails = function (terminal_id) {
	let terminalResult = this.terminals.findOne({ 'id': terminal_id });

	if (terminalResult === null)
		return { "error": "No such terminal" };

	let result = {};
	result.success = true;
	result.id = terminalResult.id;
	result.last_seen = terminalResult.last_seen;
	result.description = terminalResult.description;
	result.enabled = terminalResult.enabled;
	result.secure = terminalResult.secure;
	result.target = terminalResult.target;
	result.secret = terminalResult.secret;

	return result;
};

TerminalStore.prototype.deleteTerminal = function (terminal_id) {
	let terminalResult = this.terminals.chain().find({ 'id': { '$eq': terminal_id } }).remove().data();

	if (terminalResult.length === 0)
		return true;

	return false;
};

TerminalStore.prototype.checkTerminalExists = function (terminal_id) {
	let terminalResult = this.terminals.findOne({ 'id': terminal_id });

	if (terminalResult !== null)
		return true;

	return false;
};

TerminalStore.prototype.checkTerminalSecured = function (terminal_id) {
	debug(getLine(), "checkTerminalSecured");
	let terminalResult = this.terminals.findOne({ 'id': terminal_id });

	if (terminalResult !== null && (terminalResult.secure == 1 || terminalResult.secret !== ''))
		return true;

	return false;
};

TerminalStore.prototype.setTerminalSecure = function (terminal_id) {
	let terminalResult = this.terminals.findOne({ 'id': terminal_id });

	terminalResult.secure = 1;
};

TerminalStore.prototype.checkTerminalAccess = function (terminal_id, user) {
	if (user.administrator)
		return true;

	let terminalResult = this.terminals.findOne({ 'id': terminal_id });

	if (user.privileges.indexOf(terminalResult.role) >= 0)
		return true;

	return false;
};

TerminalStore.prototype.verifyHMAC = function (terminal_id, packet) {
	let terminalResult = this.terminals.findOne({ 'id': terminal_id });

	if (!terminalResult)
		return false;

	let data = packet.data;
	let hash = packet.hash;

	let key = data.nonce + data.ts + terminalResult.secret;

	debug(getLine(), 'verifyHMAC', packet);
	debug(getLine(), 'verifyHMAC', JSON.stringify(packet));
	debug(getLine(), 'verifyHMAC', JSON.stringify(packet.data));

	let checked_hash = CryptoJS.HmacSHA256(JSON.stringify(data), key).toString();

	debug(getLine(), "verifyHMAC", "ts", packet.data.ts, "vs", Math.round(Date.now() / 1000), "=", (Math.round(Date.now() / 1000) - parseInt(packet.data.ts)));

	if (checked_hash !== hash) {
		debug(getLine(), "verifyHMAC: incorrect hash");
		debug(getLine(), 'verifyHMAC', "Got:", hash);
		debug(getLine(), 'verifyHMAC', "Expected:", checked_hash);
		terminalResult.secure = 0;
		return false;
	} else if ((packet.data.ts < (Math.round(Date.now() / 1000) - 30)) || (packet.data.ts > (Math.round(Date.now() / 1000) + 30))) {
		// We calculate to epoch from node native millisecond time
		debug(getLine(), "verifyHMAC: time out of scope - replay attack?");
		return false;
	}

	terminalResult.secure = 1;

	return true;
};

var terminalStore = null

const getInstance = function (dataDir) {
	if (terminalStore === null)
		terminalStore = new TerminalStore(dataDir)

	return terminalStore
}

module.exports = getInstance
