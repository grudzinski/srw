#!/usr/local/bin/node

var log4js = require('log4js');
var rc = require('rc');

var RunnerOfMonitors = require('../lib/RunnerOfMonitors.js');

var logger = log4js.getLogger('srw');
var params = rc('srw');
var runner = new RunnerOfMonitors(params);

runner.start(function(err) {
	if (err) {
		logger.error('Error while starting srw', err);
		return;
	}
	logger.info('Started sucessful');
});