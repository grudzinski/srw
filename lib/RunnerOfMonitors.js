var _ = require('lodash');
var async = require('async');
var debug = require('debug');
var os = require('os');

var Monitor = require('./Monitor.js');

function RunnerOfMonitors(params) {
	this._debug = debug('RunnerOfMonitors');
	this._Monitor = Monitor;
	this._process = process;
	this._os = os;
	this._params = params;
	this._monitors = null;
}

var p = RunnerOfMonitors.prototype;

p.start =function(callback) {
	this._debug('start');
	var killDaemonsAndExit = _.bind(this._killDaemonsAndExit, this);
	this._process.on('SIGTERM', killDaemonsAndExit);
	var params = this._params;
	var firstPort = params.firstPort;
	var monitors = [];
	var tasks = [];
	var Monitor = this._Monitor;
	var cpus = this._os.cpus();
	for (var i = 0, l = cpus.length; i < l; i++) {
		var monitorParams = _.cloneDeep(params);
		monitorParams.port = firstPort + i;
		var monitor = new Monitor(monitorParams);
		monitors.push(monitor);
		var task = _.bind(monitor.start, monitor);
		tasks.push(task);
	}
	this._monitors = monitors;
	async.parallel(tasks, callback);
};

p._killDaemonsAndExit = function() {
	this._debug('_killDaemonsAndExit');
	var monitors = this._monitors;
	for (var i = 0, l = monitors.length; i < l; i++) {
		var monitor = monitors[i];
		monitor.killWorkers();
	}
	this._process.exit(0);
};

delete p;

module.exports = RunnerOfMonitors;