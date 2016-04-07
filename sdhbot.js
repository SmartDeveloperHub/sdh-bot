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

var Promise = require("promise");

module.exports = function(botID, sdhApiUrl, sdhDashboardUrl, log) {

    var core = {};

    var init = function() {

        var validUrl = require('valid-url');

        if (!validUrl.isUri(sdhApiUrl)){
            log.error("Not valid SDH_API_URL: " + sdhApiUrl);
            process.exit(0);
        }

        if (!validUrl.isUri(sdhDashboardUrl)){
            log.error("Not valid SDH_DASHBOARD_URL: " + sdhDashboardUrl);
            process.exit(0);
        }

        GLOBAL.SDH_API_URL = sdhApiUrl;
        GLOBAL.SDH_DASHBOARD_URL = sdhDashboardUrl;
        GLOBAL.clientUserInfo = null; //TODO: remove
        GLOBAL.elastic = null; //TODO: move all elastic methods to other file

        var loadStartDate = new Date();

        core.id = botID;
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

        GLOBAL.internalSDHtools = require('./brain/sdhBasic.js')(log); //TODO: move to core.sdh

        // Load core operations into the core object
        core.ops = require('./brain/operations.js')(log);

        // Export SDH Functions
        for (var meth in internalSDHtools) {
            core[meth] = internalSDHtools[meth];
        }

        // Export directive functions
        var directives = require('./brain/directives.js')(log);
        for (meth in directives) {
            core[meth] = directives[meth];
        }

        return Promise.denodeify(preloadEntityIds)();

    };

    // Shut down function
    var gracefullyShuttinDown = function gracefullyShuttinDown() {
        log.warn('Shut down signal Received ');
        log.warn(" ! Shutting Down SDH-API manually.");
        setTimeout(function () {
            process.exit(0);
        }, 500);
    };

    var preloadEntityIds = function preloadEntityIds(cb) {
        log.info("entra");
        var rcounter = 0;
        var endLoad = function endLoad() {

            rcounter++;
            if (rcounter == 5) {
                cb(null, core);
            } else if(rcounter > 5) {
                log.debug('Concurr error sdhbot.preloadEntityIds');
            }
        };
        //Members
        internalSDHtools.getSDHMembers(function (err, members) {
            for (var i = 0; i < members.length; i++) {
                sdhUsersByID[members[i].userid] = members[i];
            }
            endLoad()
        });
        //Repositories
        internalSDHtools.getSDHRepositories(function (err, rep) {
            for (var i = 0; i < rep.length; i++) {
                sdhReposByID[rep[i].repositoryid] = rep[i];
                sdhReposByName[rep[i].name] = rep[i];
            }
            endLoad()
        });
        //Products
        internalSDHtools.getSDHProducts(function (err, prod) {
            for (var i = 0; i < prod.length; i++) {
                sdhProductsByID[prod[i].productid] = prod[i];
            }
            endLoad()
        });
        //Projects
        internalSDHtools.getSDHProjects(function (err, proj) {
            for (var i = 0; i < proj.length; i++) {
                sdhProjectsByID[proj[i].projectid] = proj[i];
            }
            endLoad()
        });
        //Organizations
        internalSDHtools.getSDHOrganizations(function (err, org) {
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
            internalSDHtools.getSDHMembers(function (err, members) {
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
            internalSDHtools.getSDHRepositories(function (err, rep) {
                for (var i = 0; i < rep.length; i++) {
                    sdhReposByID[rep[i].repositoryid] = rep[i];
                    sdhReposByName[rep[i].name] = rep[i];
                }
            }),
            //Products
            internalSDHtools.getSDHProducts(function (err, prod) {
                for (var i = 0; i < prod.length; i++) {
                    sdhProductsByID[prod[i].productid] = prod[i];
                }
            }),
            //Projects
            internalSDHtools.getSDHProjects(function (err, proj) {
                for (var i = 0; i < proj.length; i++) {
                    sdhProjectsByID[proj[i].projectid] = proj[i];
                }
            }),
            //Organizations
            internalSDHtools.getSDHOrganizations(function (err, org) {
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

    return init();

};


