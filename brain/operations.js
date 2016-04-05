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

module.exports = function(log) {

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
        callback ("metric data");
    };
    var getMetricsAbout = function getMetricsAbout(callback, text) {
        log.info("metric about query ---> " + text);
        var tags = text.toLowerCase().split(' ');
        var parsedElements = [];
        internalSDHtools.getSDHMetrics(function(allmet) {
            for (var i = 0; i < allmet.length; i++) {

                var metric = allmet[i];
                if(!metric.title) {
                    log.warn("No title in metric: " + JSON.stringify(metric));
                    metric.title = "";
                }
                var refAtt = metric.title.toLowerCase(); // Views have not titles
                if (tags.length == 0) {
                    // All
                    parsedElements.push(refAtt);
                } else {
                    // Tag filter
                    var match = false;
                    for (var j = 0; j < tags.length; j++) {
                        if (refAtt.indexOf(tags[j]) == -1) {
                            match = false;
                            break;
                        } else {
                            match = true;
                        }
                    }
                    if (match) {
                        parsedElements.push(metric);
                    }
                }

            };
            callback(parsedElements);
        });
    };

    var view = function view(callback, text) {
        // TODO extract metric id, subjects and range information from msg to generate view options
        callback ("view data");
    };

    var product = function product(callback, text) {
        log.info("product info ---> " + text);
        var prodList = getProductFromText(text);
        log.debug(prodList);
        var pj = [];
        for (var i = 0; i < prodList.length; i++) {
            pj.push(sdhProductsByID[prodList[i]]);
        }
        var data = {
            'title': "Product Information",
            'description': "This is the core bot get product/s information",
            'data': pj
        }
        callback (data);
    };

// Product Aux methods
    var getProductFromText = function getProductFromText(text) {
        var tags = text.toLowerCase().split(' ');

        log.debug(tags);
        var data = [];
        for (var d = 0; d < tags.length; d++) {
            if (tags[d] in sdhProductsByID) {
                data.push(tags[d]);
            } else if (tags[d] in sdhProductsByName){
                data.push(sdhProductsByName[tags[d]].productid);
            }
        }
        return data;
    };

    var project = function project(callback, text) {
        log.info("project info ---> " + text);
        var projList = getProjectFromText(text);
        log.debug(projList);
        var pj = [];
        for (var i = 0; i < projList.length; i++) {
            pj.push(sdhProjectsByID[projList[i]]);
        }
        var data = {
            'title': "Project Information",
            'description': "This is the core bot get project/s information",
            'data': pj
        }
        callback (data);
    };

// Project Aux methods
    var getProjectFromText = function getProjectFromText(text) {
        var tags = text.toLowerCase().split(' ');

        log.debug(tags);
        var data = [];
        for (var d = 0; d < tags.length; d++) {
            if (tags[d] in sdhProjectsByID) {
                data.push(tags[d]);
            } else if (tags[d] in sdhProjectsByName){
                data.push(sdhProjectsByName[tags[d]].projectid);
            }
        }
        return data;
    };

    var repo = function repo(callback, text) {
        log.info("repo info ---> " + text);
        var repoList = getRepoFromText(text);
        log.debug(repoList);
        var rp = [];
        for (var i = 0; i < repoList.length; i++) {
            rp.push(sdhReposByID[repoList[i]]);
        }
        var data = {
            'title': "Repository Information",
            'description': "This is the core bot get repository/ies information",
            'data': rp
        }
        callback (data);
    };

// Repos Aux methods
    var getRepoFromText = function getRepoFromText(text) {
        var tags = text.toLowerCase().split(' ');
        log.debug(tags);
        var repo = [];
        for (var d = 0; d < tags.length; d++) {
            if (tags[d] in sdhReposByID) {
                repo.push(tags[d]);
            } else if (tags[d] in sdhReposByName){
                repo.push(sdhReposByName[tags[d]].repositoryid);
            }
        }
        return repo;
    };

// Members aux methods
    var getUsersFromText = function getUsersFromText(text) {
        var tags = text.toLowerCase().split(' ');

        log.debug(tags);
        var userList = [];
        for (var d = 0; d < tags.length; d++) {
            if (tags[d] in clientUserInfo) {
                userList.push(clientUserInfo[tags[d]]);
            } else {
                for (var key in clientUserInfo) {
                    if (key.indexOf("<@") > -1 && key.indexOf(">") > -1 && key.indexOf(tags[d]) > -1) {
                        userList.push(clientUserInfo[key]);
                    }
                }
            }
        }
        return userList;
    };

    var member = function member(callback, text) {
        log.info("member info ---> " + text);
        var userList = getUsersFromText(text);
        log.debug(userList);
        var us = [];
        for (var i = 0; i < userList.length; i++) {
            us.push(sdhUsersByID[userList[i]]);
        }
        var data = {
            'title': "User Information",
            'description': "This is the core bot get member/s information",
            'data': us
        }
        callback (data);
    };
    var allMetrics = function allMetrics(callback) {
        internalSDHtools.getSDHMetrics(callback);
    };
    var allViews = function allViews(callback) {
        internalSDHtools.getSDHViews(callback);
    };
    var allOrgs = function allOrgs(callback) {
        internalSDHtools.getSDHOrganizations(callback);
    };
    var allProducts = function allProducts(callback) {
        internalSDHtools.getSDHProducts(callback);
    };
    var allProjects = function allProjects(callback) {
        internalSDHtools.getSDHProjects(callback);
    };
    var allRepos = function allRepos(callback) {
        internalSDHtools.getSDHRepositories(callback);
    };
    var allMembers = function allMembers(callback) {
        internalSDHtools.getSDHMembers(callback);
    };
    var sdhParser = function sdhParser(clientId, msg, callback) {

        var origTagsAux = msg.text.split(' ');
        var origTags = [];
        for (var d = 0; d < origTagsAux.length; d++) {
            //TODO
            if (origTagsAux[d] !== "" && origTagsAux[d] !== "elastic" && origTagsAux[d].indexOf(botId.toLowerCase()) == -1) {
                origTags.push(origTagsAux[d]);
            }
        }
        /*elastic.getSuggestions(origTags).then(function (result) {
         log.info("--Result for: " + origTags);
         for (var i = 0; i < result.docsuggest[0].options.length; i++) {
         log.info("elasticSearch: '" + result.docsuggest[0].options[i].text + "' --score:" + result.docsuggest[0].options[i].score);
         }
         });*/
        elastic.search(msg.text, indexName).then(function (result) {
            log.info("-Simple E.S search for: " + msg.text);
            for (var i = 0; i < result.hits.hits.length; i++) {
                log.debug("hit " + i + ": '" + result.hits.hits[i]._source.title + "' ;score: " + result.hits.hits[i]._score);
            }
        });
    };

    var parseTags = function parseTags(msg) {
        var origTagsAux = msg.split(' ');
        var origTags = [];
        for (var d = 0; d < origTagsAux.length; d++) {
            //TODO
            if (origTagsAux[d] !== "") {
                origTags.push(origTagsAux[d]);
            }
        }
        return origTags;
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

