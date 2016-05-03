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

// Load sugar library that enhances the Javascript built-in prototypes
require("sugar");

// Do not silently capture errors
Promise.onPossiblyUnhandledRejection(function(error){
    throw error;
});

module.exports = function(botID, sdhApiUrl, sdhDashboardUrl, searchUrl, imagesServiceUrl, log) {

    var core = {};

    var init = function() {

        var validUrl = require('valid-url');

        if (!validUrl.isUri(sdhApiUrl)){
            log.error("Not valid SDH API url: " + sdhApiUrl);
            process.exit(0);
        }

        if (!validUrl.isUri(sdhDashboardUrl)){
            log.error("Not valid SDH Dashboard urlL: " + sdhDashboardUrl);
            process.exit(0);
        }

        if (!validUrl.isUri(searchUrl)){
            log.error("Not valid Search Url: " + searchUrl);
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

        core.errors = require('./brain/errors.js')(core);

        // Load methods to access SDH data
        core.data = require('./brain/sdhBasic.js')(sdhApiUrl, imagesServiceUrl, log);

        // Load core operations into the core object
        core.ops = require('./brain/operations.js')(core, log);

        // Export directive functions
        var directives = require('./brain/directives.js')(log);
        for (var meth in directives) {
            core[meth] = directives[meth];
        }

        return preloadEntityIds().then(function() {
            core.search = require("./brain/elasticSearch")(searchUrl, core, log);

            return core.search.fillWithData();
        }).then(function() {
            log.info("... SDH BOT CORE is ready ...");
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
                    sdhUsersByID[members[i].uid] = members[i];
                }
            }),
            //Repositories
            sdhData.getSDHRepositoriesAsync().then(function (rep) {
                for (var i = 0; i < rep.length; i++) {
                    sdhReposByID[rep[i].rid] = rep[i];
                    sdhReposByName[rep[i].name] = rep[i];
                }
            }),
            //Products
            sdhData.getSDHProductsAsync().then(function (prod) {
                for (var i = 0; i < prod.length; i++) {
                    sdhProductsByID[prod[i].prid] = prod[i];
                }
            }),
            //Projects
            sdhData.getSDHProjectsAsync().then(function (proj) {
                for (var i = 0; i < proj.length; i++) {
                    sdhProjectsByID[proj[i].pjid] = proj[i];
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

    return init();

};


