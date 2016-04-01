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

    var _exports = {};

    /* PRIVATE */
    var helpme = function helpme(clientId, msg, callback) {
        var data = [];
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
    var metric = function metric(clientId, msg, callback) {
        // TODO extract metric id, subjects and range information from msg to generate metric options
        callback ("metric data");
    };
    var getMetricsAbout = function getMetricsAbout(clientId, msg, callback) {
        log.info("metric abut query ---> " + msg.text);
        var tags = msg.text.toLowerCase().split(' ');
        var auxTags = [];
        for (var d = 0; d < tags.length; d ++) {
            if (tags[d] !== "" && tags[d] !== "metrics" && tags[d] !== "give" && tags[d] !== "me" && tags[d] !== "about") {
                auxTags.push(tags[d]);
            }
        }
        tags = auxTags;
        var parsedElements = [];
        internalSDHtools.getSDHMetrics(function(allmet) {
            for (var i = 0; i < allmet.length; i++) {

                var metric = allmet[i]; if(!metric.title) log.info(JSON.stringify(metric));
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

    var view = function view(clientId, msg, callback) {
        // TODO extract metric id, subjects and range information from msg to generate view options
        callback ("view data");
    };
    var org = function org(clientId, msg, callback) {
        // Not implemented in sdh-api, only 1 organization
        internalSDHtools.getSDHOrganizations(callback);
    };
    var product = function product(clientId, msg, callback) {
        log.info("product info ---> " + msg.text);
        var prodList = getProductFromMsg(msg);
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
    var getProductFromMsg = function getProductFromMsg(msg) {
        var tags = msg.text.toLowerCase().split(' ');
        var origTagsAux = msg.text.split(' ');
        var origTags = [];
        var auxTags = [];
        var customTag = "";
        for (var d = 0; d < tags.length; d++) {
            if (tags[d] !== "" && tags[d] !== "product" && tags[d] !== "producto" && tags[d].indexOf(botId.toLowerCase()) == -1) {
                auxTags.push(tags[d]);
                origTags.push(origTagsAux[d]);
                if (customTag.length > 0) {customTag += " ";}
                customTag += tags[d];
            } else {
                if (customTag.length > 0) {
                    auxTags.push(customTag);
                }
                customTag = "";
            }
        }
        if (customTag.length > 0) {
            auxTags.push(customTag);
        }
        tags = auxTags;
        log.debug(tags);
        var data = [];
        for (var d = 0; d < tags.length; d++) {
            if (origTags[d] in sdhProductsByID) {
                data.push(origTags[d]);
            } else if (origTags[d] in sdhProductsByName){
                data.push(sdhProductsByName[origTags[d]].productid);
            }
        }
        return data;
    };

    var project = function project(clientId, msg, callback) {
        log.info("project info ---> " + msg.text);
        var projList = getProjectFromMsg(msg);
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
    var getProjectFromMsg = function getProjectFromMsg(msg) {
        var tags = msg.text.toLowerCase().split(' ');
        var origTagsAux = msg.text.split(' ');
        var origTags = [];
        var auxTags = [];
        var customTag = "";
        for (var d = 0; d < tags.length; d++) {
            if (tags[d] !== "" && tags[d] !== "project" && tags[d] !== "proyecto" && tags[d].indexOf(botId.toLowerCase()) == -1) {
                auxTags.push(tags[d]);
                origTags.push(origTagsAux[d]);
                if (customTag.length > 0) {customTag += " ";}
                customTag += tags[d];
            } else {
                if (customTag.length > 0) {
                    auxTags.push(customTag);
                }
                customTag = "";
            }
        }
        if (customTag.length > 0) {
            auxTags.push(customTag);
        }
        tags = auxTags;
        log.debug(tags);
        var data = [];
        for (var d = 0; d < tags.length; d++) {
            if (origTags[d] in sdhProjectsByID) {
                data.push(origTags[d]);
            } else if (origTags[d] in sdhProjectsByName){
                data.push(sdhProjectsByName[origTags[d]].projectid);
            }
        }
        return data;
    };

    var repo = function repo(clientId, msg, callback) {
        log.info("repo info ---> " + msg.text);
        var repoList = getRepoFromMsg(msg);
        log.debug(repoList);
        var rp = [];
        for (var i = 0; i < repoList.length; i++) {
            rp.push(sdhReposByID[repoList[i]]);
        }
        var data = {
            'title': "Repository Information",
            'description': "This is the core bot get rpository/ies information",
            'data': rp
        }
        callback (data);
    };

// Repos Aux methods
    var getRepoFromMsg = function getRepoFromMsg(msg) {
        var tags = msg.text.toLowerCase().split(' ');
        var origTagsAux = msg.text.split(' ');
        var origTags = [];
        var auxTags = [];
        var customTag = "";
        for (var d = 0; d < tags.length; d++) {
            if (tags[d] !== "" && tags[d] !== "repository" && tags[d] !== "repositorio" && tags[d] !== "repo" && tags[d].indexOf(botId.toLowerCase()) == -1) {
                auxTags.push(tags[d]);
                origTags.push(origTagsAux[d]);
                if (customTag.length > 0) {customTag += " ";}
                customTag += tags[d];
            } else {
                if (customTag.length > 0) {
                    auxTags.push(customTag);
                }
                customTag = "";
            }
        }
        if (customTag.length > 0) {
            auxTags.push(customTag);
        }
        tags = auxTags;
        log.debug(tags);
        var repo = [];
        for (var d = 0; d < tags.length; d++) {
            if (origTags[d] in sdhReposByID) {
                repo.push(origTags[d]);
            } else if (origTags[d] in sdhReposByName){
                repo.push(sdhReposByName[origTags[d]].repositoryid);
            }
        }
        return repo;
    };

// Members aux methods
    var getUsersFromMsg = function getUsersFromMsg(msg) {
        var tags = msg.text.toLowerCase().split(' ');
        var origTagsAux = msg.text.split(' ');
        var origTags = [];
        var auxTags = [];
        var customTag = "";
        for (var d = 0; d < tags.length; d++) {
            if (tags[d] !== "" && tags[d] !== "user" && tags[d] !== "miembro" && tags[d] !== "member" && tags[d] !== "usuario" && tags[d].indexOf(botId.toLowerCase()) == -1) {
                auxTags.push(tags[d]);
                origTags.push(origTagsAux[d]);
                if (customTag.length > 0) {customTag += " ";}
                customTag += tags[d];
            } else {
                if (customTag.length > 0) {
                    auxTags.push(customTag);
                }
                customTag = "";
            }
        }
        if (customTag.length > 0) {
            auxTags.push(customTag);
        }
        tags = auxTags;
        log.debug(tags);
        var userList = [];
        for (var d = 0; d < tags.length; d++) {
            if (origTags[d] in clientUserInfo) {
                userList.push(clientUserInfo[origTags[d]]);
            } else {
                for (var key in clientUserInfo) {
                    if (key.indexOf("<@") > -1 && key.indexOf(">") > -1 && key.indexOf(origTags[d]) > -1) {
                        userList.push(clientUserInfo[key]);
                    }
                }
            }
        }
        return userList;
    };

    var member = function member(clientId, msg, callback) {
        log.info("member info ---> " + msg.text);
        var userList = getUsersFromMsg(msg);
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
    var allMetrics = function allMetrics(clientId, msg, callback) {
        internalSDHtools.getSDHMetrics(callback);
    };
    var allViews = function allViews(clientId, msg, callback) {
        internalSDHtools.getSDHViews(callback);
    };
    var allOrgs = function allOrgs(clientId, msg, callback) {
        internalSDHtools.getSDHOrganizations(callback);
    };
    var allProducts = function allProducts(clientId, msg, callback) {
        internalSDHtools.getSDHProducts(callback);
    };
    var allProjects = function allProjects(clientId, msg, callback) {
        internalSDHtools.getSDHProjects(callback);
    };
    var allRepos = function allRepos(clientId, msg, callback) {
        internalSDHtools.getSDHRepositories(callback);
    };
    var allMembers = function allMembers(clientId, msg, callback) {
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

    /* PUBLIC */
    var corePatterns = {
        '/help/':{
            'callback': helpme,
            'description': "Return core bot help information"
        },
        '/give me all metrics/':{
            'callback': allMetrics,
            'description': "Return complete SDH metrics list"
        },
        '/give me metrics about [\\s\\S]+/':{
            'callback': allMetrics,
            'description': "Return complete SDH metrics list"
        },
        '/give me [\\s\\S]+ metrics/':{
            'callback': getMetricsAbout,
            'description': "Return complete SDH metrics list"
        },
        '/give me all views/':{
            'callback': allViews,
            'description': "Return complete SDH views list"
        },
        '/give me all organizations/':{
            'callback': allOrgs,
            'description': "Return complete SDH organizations list"
        },
        '/give me all products/':{
            'callback': allProducts,
            'description': "Return complete SDH projects list"
        },
        '/give me all projects/':{
            'callback': allProjects,
            'description': "Return complete SDH projects list"
        },
        '/give me all users|give me all members/':{
            'callback': allMembers,
            'description': "Return complete SDH products list"
        },
        '/give me all repositories/':{
            'callback': allRepos,
            'description': "Return complete SDH products list"
        },
        /*'/give me [\\s\\S]+ information/':{
         'callback': allRepos,
         'description': "Return complete SDH products list"
         },*/
        '/give me [\\s\\S]+ product':{
            'callback': product,
            'description': "Return a SDH product"
        },
        '/give me [\\s\\S]+ project/':{
            'callback': project,
            'description': "Return a SDH project"
        },
        '/give me [\\s\\S]+ user|give me [\\s\\S]+ member/':{
            'callback': member,
            'description': "Return a SDH member"
        },
        '/give me [\\s\\S]+ repository|give me [\\s\\S]+ repo/':{
            'callback': repo,
            'description': "Return a SDH repository"
        },
        '/give me [\\s\\S]+ metric/':{
            'callback': metric,
            'description': "Return SDH metric data"
        },
        '/give me [\\s\\S]+ view/':{
            'callback': view,
            'description': "Return SDH view data"
        },
        //'/[a-zA-Z]+/':{
        /*'/[\\s\\S]/':{
         'callback': sdhParser,
         'description': "Return elastic matching info"
         }*/
    };

    _exports.phInfo = corePatterns;

    return _exports;

}

