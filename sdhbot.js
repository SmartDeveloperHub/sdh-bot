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

    var init = function init(botID, callback) {
        exports.id = botID;
        GLOBAL.botId = botID;
        GLOBAL.sdhProjectsByID = {};
        GLOBAL.sdhProjectsByName = {};
        GLOBAL.sdhReposByID = {};
        GLOBAL.sdhReposByName = {};
        GLOBAL.sdhReposByName = {};
        GLOBAL.sdhProductsByID = {};
        GLOBAL.sdhProductsByName = {};
        GLOBAL.sdhUsersByID = {};
        GLOBAL.sdhOrganizationsByID = {};
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
                // take SDHMembers
                preloadEntityIds(callback);
            }
        });
    };

    var preloadEntityIds = function preloadEntityIds(cb) {
        var rcounter = 0;
        var endLoad = function endLoad() {
            rcounter++;
            if (rcounter == 5) {
                cb();
            } else if(rcounter > 5) {
                log.debug('Concurr error sdhbot.preloadEntityIds');
            }
        };
        //Members
        internalSDHtools.getSDHMembers(function (members) {
            for (var i = 0; i < members.length; i++) {
                sdhUsersByID[members[i].userid] = members[i];
            }
            endLoad()
        });
        //Repositories
        internalSDHtools.getSDHRepositories(function (rep) {
            for (var i = 0; i < rep.length; i++) {
                sdhReposByID[rep[i].repositoryid] = rep[i];
                sdhReposByName[rep[i].name] = rep[i];
            }
            endLoad()
        });
        //Products
        internalSDHtools.getSDHProducts(function (prod) {
            for (var i = 0; i < prod.length; i++) {
                sdhProductsByID[prod[i].productid] = prod[i];
            }
            endLoad()
        });
        //Projects
        internalSDHtools.getSDHProjects(function (proj) {
            for (var i = 0; i < proj.length; i++) {
                sdhProjectsByID[proj[i].projectid] = proj[i];
            }
            endLoad()
        });
        //Organizations
        internalSDHtools.getSDHOrganizations(function (org) {
            for (var i = 0; i < org.length; i++) {
                // By the moment there are no organizationid in the unique Organization info in SDH
                //sdhOrganizationsByID[org[i].organizationid] = org[i];
                sdhOrganizationsByID[org[i].title] = org[i];
            }
            endLoad()
        });
    };

    var startESindex = function startESindex() {
        //TODO
        var sdhUsersByID_ = {};
        var cleanIndex = [
            elastic.indexExists("users").then(function (exists) {
                if (exists) {
                    return elastic.deleteIndex("users");
                }
            }).then(function () {
                return elastic.initIndex("users").then(function() {
                        return elastic.initMapping("users");
                    })
            }),
            elastic.indexExists("products").then(function (exists) {
                if (exists) {
                    return elastic.deleteIndex("products");
                }
            }).then(function () {
                return elastic.initIndex("products").then(function() {
                    return elastic.initMapping("products");
                })
            }),
            elastic.indexExists("projects").then(function (exists) {
                if (exists) {
                    return elastic.deleteIndex("projects");
                }
            }).then(function () {
                return elastic.initIndex("projects").then(function() {
                    return elastic.initMapping("projects");
                })
            }),
            elastic.indexExists("repositories").then(function (exists) {
                if (exists) {
                    return elastic.deleteIndex("repositories");
                }
            }).then(function () {
                return elastic.initIndex("repositories").then(function () {
                    return elastic.initMapping("repositories");
                })
            })
        ];
        var getEntities = [
            //Members
            internalSDHtools.getSDHMembers(function (members) {
                members.map(function (dat) {
                    sdhUsersByID_[dat.userid] = dat;
                    return elastic.addDocument(dat, indexName);
                });
                for (var i = 0; i < members.length; i++) {
                    sdhUsersByID[members[i].userid] = members[i];
                }
                log.info(sdhUsersByID)
                return members.all(members);
            }),
            //Repositories
            internalSDHtools.getSDHRepositories(function (rep) {
                for (var i = 0; i < rep.length; i++) {
                    sdhReposByID[rep[i].repositoryid] = rep[i];
                    sdhReposByName[rep[i].name] = rep[i];
                }
            }),
            //Products
            internalSDHtools.getSDHProducts(function (prod) {
                for (var i = 0; i < prod.length; i++) {
                    sdhProductsByID[prod[i].productid] = prod[i];
                }
            }),
            //Projects
            internalSDHtools.getSDHProjects(function (proj) {
                for (var i = 0; i < proj.length; i++) {
                    sdhProjectsByID[proj[i].projectid] = proj[i];
                }
            }),
            //Organizations
            internalSDHtools.getSDHOrganizations(function (org) {
                for (var i = 0; i < org.length; i++) {
                    // By the moment there are no organizationid in the unique Organization info in SDH
                    //sdhOrganizationsByID[org[i].organizationid] = org[i];
                    sdhOrganizationsByID[org[i].title] = org[i];
                }
            })
        ];

        Promise.all(cleanIndex).all(getEntities).then(function () {
                log.info("elasticTools enable");
            }
        ).catch(function(err) {
            log.info("error loading data into Elastic Search");
            log.error(err);
        });
    };


    GLOBAL.internalSDHtools = require('./brain/sdhBasic.js');
    GLOBAL.sdhPatternHandlers = require('./brain/sdhPatternHandlers.js');
    exports.knownPatterns = sdhPatternHandlers.phInfo;
    // Export SDH Functions
    for (var meth in internalSDHtools) {
        exports[meth] = internalSDHtools[meth];
    }

    // Export init
    exports.init = init;

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
    GLOBAL.clientUserInfo = {};
    exports.setMembersIdRel = function setMembersIdRel(matchingObj) {
        clientUserInfo = matchingObj;
    };