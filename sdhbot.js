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

var Promise = require("bluebird");

// Do not silently capture errors
Promise.onPossiblyUnhandledRejection(function(error){
    throw error;
});

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

        // Load methods to access SDH data
        core.data = require('./brain/sdhBasic.js')(sdhApiUrl, log);

        // Load core operations into the core object
        core.ops = require('./brain/operations.js')(core, log);

        // Export directive functions
        var directives = require('./brain/directives.js')(log);
        for (var meth in directives) {
            core[meth] = directives[meth];
        }

        return preloadEntityIds().then(function() {
            return core;
        });

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

        // COnvert methods to promises
        var sdhData = Promise.promisifyAll(core.data);

        var loadPromises = [
            //Members
            sdhData.getSDHMembersAsync().then(function (members) {
                for (var i = 0; i < members.length; i++) {
                    sdhUsersByID[members[i].userid] = members[i];
                }
            }),
            //Repositories
            sdhData.getSDHRepositoriesAsync().then(function (rep) {
                for (var i = 0; i < rep.length; i++) {
                    sdhReposByID[rep[i].repositoryid] = rep[i];
                    sdhReposByName[rep[i].name] = rep[i];
                }
            }),
            //Products
            sdhData.getSDHProductsAsync().then(function (prod) {
                for (var i = 0; i < prod.length; i++) {
                    sdhProductsByID[prod[i].productid] = prod[i];
                }
            }),
            //Projects
            sdhData.getSDHProjectsAsync().then(function (proj) {
                for (var i = 0; i < proj.length; i++) {
                    sdhProjectsByID[proj[i].projectid] = proj[i];
                }
            }),
            //Organizations
            sdhData.getSDHOrganizationsAsync().then(function (org) {
                for (var i = 0; i < org.length; i++) {
                    // By the moment there are no organizationid in the unique Organization info in SDH
                    //sdhOrganizationsByID[org[i].organizationid] = org[i];
                    sdhOrganizationsByID[org[i].title] = org[i];
                }
            })
        ];

        return Promise.all(loadPromises);

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
            core.data.getSDHMembers(function (err, members) {
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
            core.data.getSDHRepositories(function (err, rep) {
                for (var i = 0; i < rep.length; i++) {
                    sdhReposByID[rep[i].repositoryid] = rep[i];
                    sdhReposByName[rep[i].name] = rep[i];
                }
            }),
            //Products
            core.data.getSDHProducts(function (err, prod) {
                for (var i = 0; i < prod.length; i++) {
                    sdhProductsByID[prod[i].productid] = prod[i];
                }
            }),
            //Projects
            core.data.getSDHProjects(function (err, proj) {
                for (var i = 0; i < proj.length; i++) {
                    sdhProjectsByID[proj[i].projectid] = proj[i];
                }
            }),
            //Organizations
            core.data.getSDHOrganizations(function (err, org) {
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


