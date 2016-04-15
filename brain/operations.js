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

module.exports = function(core, log) {

    //TODO: adapt all methods to receive parameters instead of a msg and then try to obtain the parameters from it

    /* PRIVATE */
    var helpme = function helpme(callback) { //TODO: move this method to the interface
        var data = [], corePatterns = {};
        for (var pat in corePatterns) {
            data.push(
                {
                    title: pat,
                    text: corePatterns[pat].description,
                    'thumb': "https://pixabay.com/static/uploads/photo/2013/07/12/18/09/help-153094_960_720.png",
                    'link': "http://botEndpointOrSomethingSimilar/api/resource/elelele"
                }
            );
        }
        callback ({
            'title': "Help Information",
            'description': "This is the core bot basic methods help information",
            'data': data
        });
    };
    var metric = function metric(callback, text) {
        // TODO extract metric id, subjects and range information from msg to generate metric options
        callback (null, "metric data");
    };
    var getMetricsAbout = function getMetricsAbout(callback, text) {

        var getSDHMetricInfo = Promise.promisify(core.data.getSDHMetricInfo);

        core.search.metrics(text).then(function(results) {
            var metrics = results.map(function(entry) {
                var id = entry._source.metric_id;
                return getSDHMetricInfo(id); //TODO: reflect?
            });
            Promise.all(metrics).asCallback(callback);
        });
    };

    var view = function view(callback, text) {
        // TODO extract metric id, subjects and range information from msg to generate view options
        callback (null, "view data");
    };

    var product = function product(callback, text) {

        core.search.products(text).then(function(results) {
            var products = results.map(function(entry) {
                return sdhProductsByID[entry._source.product_id];
            });

            var data = {
                'title': "Product Information",
                'description': "This is the core bot get product/s information",
                'data': products
            }
            callback (null, data);
        });

    };


    var project = function project(callback, text) {

        core.search.projects(text).then(function(results) {
            var projects = results.map(function(entry) {
                return sdhProjectsByID[entry._source.project_id];
            });

            var data = {
                'title': "Project Information",
                'description': "This is the core bot get project/s information",
                'data': projects
            }
            callback (null, data);
        });

    };

    var repo = function repo(callback, text) {

        core.search.repositories(text).then(function(results) {
            var repositories = results.map(function(entry) {
                return sdhReposByID[entry._source.repo_id];
            });

            var data = {
                'title': "Repository Information",
                'description': "This is the core bot get repository/ies information",
                'data': repositories
            }
            callback (null, data);
        });

    };

    var member = function member(callback, text) {

        var returnData = function(users) {
            var data = {
                'title': "User Information",
                'description': "This is the core bot get member/s information",
                'data': users
            }
            callback (null, data);
        }

        if(text.substr(0, 6) === "sdhid:") {
            var sdhId = text.substring(6);
            returnData(sdhUsersByID[sdhId]);

        } else {
            core.search.users(text).then(function(results) {
                var users = results.map(function(entry) {
                    return sdhUsersByID[entry._source.user_id];
                });
                returnData(users);
            });
        }

    };

    var allMetrics = function allMetrics(callback) {
        core.data.getSDHMetrics(callback);
    };
    var allViews = function allViews(callback) {
        core.data.getSDHViews(callback);
    };
    var allOrgs = function allOrgs(callback) {
        core.data.getSDHOrganizations(callback);
    };
    var allProducts = function allProducts(callback) {
        core.data.getSDHProducts(callback);
    };
    var allProjects = function allProjects(callback) {
        core.data.getSDHProjects(callback);
    };
    var allRepos = function allRepos(callback) {
        core.data.getSDHRepositories(callback);
    };
    var allMembers = function allMembers(callback) {
        core.data.getSDHMembers(callback);
    };

    return {
        helpme: helpme,
        allMetrics: allMetrics,
        getMetricsAbout: getMetricsAbout,
        allViews: allViews,
        allOrgs: allOrgs,
        allProducts: allProducts,
        allProjects: allProjects,
        allMembers: allMembers,
        allRepos: allRepos,
        product: product,
        project: project,
        member: member,
        repo: repo,
        metric: metric,
        view: view
    };

}

