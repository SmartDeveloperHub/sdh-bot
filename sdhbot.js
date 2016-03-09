/*

    #-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=#
      This file is part of the Smart Developer Hub Project:
        http://www.smartdeveloperhub.org/
      Center for Open Middleware
            http://www.centeropenmiddleware.com/
    #-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=#
      Copyright (C) 2015 Center for Open Middleware.
    #-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=#
      Licensed under the Apache License, Version 2.0 (the "License");
      you may not use this file except in compliance with the License.
      You may obtain a copy of the License at
                http://www.apache.org/licenses/LICENSE-2.0
      Unless required by applicable law or agreed to in writing, software
      distributed under the License is distributed on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
      See the License for the specific language governing permissions and
     limitations under the License.
    #-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=#
*/
'use strict';

    var loadStartDate = new Date();
    try {
        // global buyan
        var bunyan = require('bunyan');
        var PrettyStream = require('bunyan-prettystream');
    } catch (err) {
        console.error("Bot Error. bunyan logs problem: " + err);
    }
    try {
        // Set Config params
        require('./config');
    } catch (err) {
        console.error("Fatal BOT Error with config: " + err);
        setTimeout(function() {
            process.exit(0);
        }, 1000);
    }
    /* File Log */
    var prettyStdOut = new PrettyStream();
    prettyStdOut.pipe(process.stdout);
    GLOBAL.log = null;
    GLOBAL.mkdirp = require("mkdirp");
    var ready = false;
    var getDirName = require("path").dirname;
    mkdirp(getDirName(FILE_LOG_PATH), function (err) {
        if (err) {
            console.error("! Log file disabled");
            console.error("Error creating log file " +  FILE_LOG_PATH);
            console.error(err);
        } else {
            log = bunyan.createLogger({
                    name: 'SDH-BOT',
                    streams: [{
                        level: CONSOLE_LOG_LEVEL,
                        stream: prettyStdOut
                    },
                    {
                        level: FILE_LOG_LEVEL,
                        type: 'rotating-file',
                        path: FILE_LOG_PATH,
                        period: FILE_LOG_PERIOD + 'h',
                        count: FILE_LOG_NFILES
                    }]
            });
            ready = true;
        }
    });

    // Shut down function
    var gracefullyShuttinDown = function gracefullyShuttinDown() {
        log.warn('Shut down signal Received ');
        log.warn(" ! Shutting Down SDH-API manually.");
        setTimeout(function () {
            process.exit(0);
        }, 500);
    };

    // Set security handlers
    process.on('SIGINT', gracefullyShuttinDown);
    process.on('SIGTERM', gracefullyShuttinDown);

    var funGo = function funGo(callback) {
        log.info("... Loading SDH BOT CORE ...");
        try {
            GLOBAL.moment = require("moment");
            GLOBAL.request = require('request');
        } catch (err) {
            log.error(" ! Error loading dependencies: " + err);
            log.info('Exiting...');
            setTimeout(function () {
                process.exit(0);
            }, 500);
        }
        log.info('...starting...');
        //var oldBots = require('./brain/botinterfaces.js');
        log.info('...OK...');
        callback();
    };

    var startBOT = function startBOT (callback) {
        if (!ready) {
            setTimeout(function () {
                funGo(callback);
            }, 500);
        } else {
            funGo(callback);
        }
    };

    GLOBAL.internalSDHtools = require('./brain/sdhBasic.js');
    GLOBAL.sdhPatternHandlers = require('./brain/sdhPatternHandlers.js');
    exports.knownPatterns = sdhPatternHandlers.phInfo;
    // Export SDH Functions
    for (var meth in internalSDHtools) {
        exports[meth] = internalSDHtools[meth];
    }

    // Export init
    exports.init = startBOT;

    // Config
    var validUrl = require('valid-url');
    exports.setSdhApiUrl = function setSdhApiUrl(uri) {
        SDH_API_URL = uri;
        if (!validUrl.isUri(SDH_API_URL)){
            log.error("Not valid SDH_API_URL: " + SDH_API_URL);
            process.exit(0);
        }
    };
    exports.setSdhDashboardUrl = function setSdhDashboardUrl(uri) {
        SDH_DASHBOARD_URL = uri;
        if (!validUrl.isUri(SDH_DASHBOARD_URL)){
            log.error("Not valid SDH_DASHBOARD_URL: " + SDH_API_URL);
            process.exit(0);
        }
    };