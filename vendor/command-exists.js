/**
 * command-exists v1.2.8
 * Node module to check if a command-line command exists
 * https://github.com/mathisonian/command-exists
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Matthew Conlen
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
 * NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* eslint-disable */

"use strict";

var exec = require("child_process").exec;
var execSync = require("child_process").execSync;
var fs = require("fs");
var path = require("path");
var access = fs.access;
var accessSync = fs.accessSync;
var constants = fs.constants || fs;

var isUsingWindows = process.platform == "win32";

var fileNotExists = function (commandName, callback) {
	access(commandName, constants.F_OK, function (err) {
		callback(!err);
	});
};

var fileNotExistsSync = function (commandName) {
	try {
		accessSync(commandName, constants.F_OK);
		return false;
	} catch (e) {
		return true;
	}
};

var localExecutable = function (commandName, callback) {
	access(commandName, constants.F_OK | constants.X_OK, function (err) {
		callback(null, !err);
	});
};

var localExecutableSync = function (commandName) {
	try {
		accessSync(commandName, constants.F_OK | constants.X_OK);
		return true;
	} catch (e) {
		return false;
	}
};

var commandExistsUnix = function (commandName, cleanedCommandName, callback) {
	fileNotExists(commandName, function (isFile) {
		if (!isFile) {
			var child = exec(
				"command -v " +
					cleanedCommandName +
					" 2>/dev/null" +
					" && { echo >&1 " +
					cleanedCommandName +
					"; exit 0; }",
				function (error, stdout, stderr) {
					callback(null, !!stdout);
				},
			);
			return;
		}

		localExecutable(commandName, callback);
	});
};

var commandExistsWindows = function (commandName, cleanedCommandName, callback) {
	if (/[\x00-\x1f<>:"\|\?\*]/.test(commandName)) {
		callback(null, false);
		return;
	}
	var child = exec("where " + cleanedCommandName, function (error) {
		if (error !== null) {
			callback(null, false);
		} else {
			callback(null, true);
		}
	});
};

var commandExistsUnixSync = function (commandName, cleanedCommandName) {
	if (fileNotExistsSync(commandName)) {
		try {
			var stdout = execSync(
				"command -v " +
					cleanedCommandName +
					" 2>/dev/null" +
					" && { echo >&1 " +
					cleanedCommandName +
					"; exit 0; }",
			);
			return !!stdout;
		} catch (error) {
			return false;
		}
	}
	return localExecutableSync(commandName);
};

var commandExistsWindowsSync = function (commandName, cleanedCommandName, callback) {
	if (/[\x00-\x1f<>:"\|\?\*]/.test(commandName)) {
		return false;
	}
	try {
		var stdout = execSync("where " + cleanedCommandName, { stdio: [] });
		return !!stdout;
	} catch (error) {
		return false;
	}
};

var cleanInput = function (s) {
	if (/[^A-Za-z0-9_\/:=-]/.test(s)) {
		s = "'" + s.replace(/'/g, "'\\''") + "'";
		s = s
			.replace(/^(?:'')+/g, "") // unduplicate single-quote at the beginning
			.replace(/\\'''/g, "\\'"); // remove non-escaped single-quote if there are enclosed between 2 escaped
	}
	return s;
};

if (isUsingWindows) {
	cleanInput = function (s) {
		var isPathName = /[\\]/.test(s);
		if (isPathName) {
			var dirname = '"' + path.dirname(s) + '"';
			var basename = '"' + path.basename(s) + '"';
			return dirname + ":" + basename;
		}
		return '"' + s + '"';
	};
}

module.exports = function commandExists(commandName, callback) {
	var cleanedCommandName = cleanInput(commandName);
	if (!callback && typeof Promise !== "undefined") {
		return new Promise(function (resolve, reject) {
			commandExists(commandName, function (error, output) {
				if (output) {
					resolve(commandName);
				} else {
					reject(error);
				}
			});
		});
	}
	if (isUsingWindows) {
		commandExistsWindows(commandName, cleanedCommandName, callback);
	} else {
		commandExistsUnix(commandName, cleanedCommandName, callback);
	}
};

module.exports.sync = function (commandName) {
	var cleanedCommandName = cleanInput(commandName);
	if (isUsingWindows) {
		return commandExistsWindowsSync(commandName, cleanedCommandName);
	} else {
		return commandExistsUnixSync(commandName, cleanedCommandName);
	}
};
