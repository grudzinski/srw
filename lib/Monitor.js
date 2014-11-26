var _ = require('lodash');
var childProcess = require('child_process');
var debug = require('debug');
var log4js = require('log4js');

function Monitor(params) {
	this._debug = debug('Monitor');
	this._logger = log4js.getLogger('Monitor');
	this._childProcess = childProcess;
	this._setTimeout = setTimeout;
	this._params = params;
	this._worker = null;
	this._countOfRestarts = 0;
	this._onWorkerExitBound = _.bind(this._onWorkerExit, this);
	this._runWorkerBound = _.bind(this._runWorker, this);
}

var p = Monitor.prototype;

p.start = function(callback) {
	this._debug('start');
	this._logger.info('Start worker for %s', this._params.port);
	this._runWorker();
	callback(null);
}

p.killWorker = function() {
	this._debug('killWorker');
	var worker = this._worker;
	if (worker !== null) {
		worker.kill(this._params.signalToKill);
	}
};

p._runWorker = function() {
	this._debug('start');
	var params = this._params;
	var args = _.clone(params.args);
	args.push(params.port);
	this._debug('Args', args);
	var worker = this._childProcess.spawn(params.command, args, { stdio: 'inherit' });
	worker.on('exit', this._onWorkerExitBound);
	this._worker = worker;
};

p._onWorkerExit = function(code, signal) {
	this._debug('_onWorkerExit');
	var logger = this._logger;
	var port = this._params.port;
	logger.warn('Worker exited for %s', port);
	if ((this._countOfRestarts++) != this._params.maxRestarts) {
		logger.info('Restart worker for %s', port);
		this._setTimeout(this._runWorkerBound, 1000);
	} else {
		logger.info('Stop restart worker for %s', port);
	}
};

delete p;

module.exports = Monitor;
