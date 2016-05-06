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
var request = require("request");

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

    var metric = function metric(callback, mid, options) {

        var getSDHMetricInfo = Promise.promisify(core.data.getSDHMetricInfo);
        var getSDHMetric = Promise.promisify(core.data.getSDHMetric);

        try {
            var params = {};

            if(options.aggr) {
                params['aggr'] = options.aggr;
            }

            if(options.max) {
                params['max'] = options.max;
            }

            if(options.from) {
                var from = Date.create(options.from);
                if(from.isValid()) {
                    params['from'] = from.format("{yyyy}-{MM}-{dd}");
                } else {
                    throw new core.errors.InvalidArgument("'"+options.from+"' is an invalid date");
                }
            }

            if(options.to) {
                var to = Date.create(options.to);
                if(to.isValid()) {
                    params['to'] = to.format("{yyyy}-{MM}-{dd}");
                } else {
                    throw new core.errors.InvalidArgument("'"+options.to+"' is an invalid date");
                }
            }

            getSDHMetricInfo(mid).then(function(metricInfo) {

                if(options.aggr && !(options.aggr in metricInfo.aggr)) {
                    throw new core.errors.InvalidArgument("Aggregator " + options.aggr + " can't be used with metric " + metricInfo.id);
                }

                if(options.param) {

                    if(metricInfo.params.length === 0 || metricInfo.params[0] == null) {
                        throw new core.errors.InvalidArgument("Metric not found. The given metric does not require parameters.")
                    }

                    if(options.param.substr(0, 6) === "sdhid:") { //The id of the user has been specified from the interface
                        if(metricInfo.params.indexOf("uid") === -1) {
                            throw new core.errors.InvalidArgument("Metric not found. The given metric does not require uid parameter.")
                        }
                        params['uid'] = options.param.substring(6);

                    } else { // Try to find out the parameter of the metric

                        var expectedParamType = metricInfo.params[0];
                        var searchMethod, searchType;
                        switch (expectedParamType) {
                            case 'uid': searchMethod = core.search.users; searchType = "user"; break;
                            case 'prid': searchMethod = core.search.products; searchType = "product"; break;
                            case 'pjid': searchMethod = core.search.projects; searchType = "project"; break;
                            case 'rid': searchMethod = core.search.repositories; searchType = "repository"; break;
                            default:
                                throw new core.errors.InvalidArgument("I don't know the type of paremeter for the metric");
                        }

                        // Find in the search engine the entity that fits best with the text correspondin to the parameter
                        return searchMethod(options.param).then(function(results) {
                            if(results && results.length > 0) {
                                var type = results[0]._type;
                                params[expectedParamType] = results[0]._source[type+"_id"];
                            } else {
                                throw new core.errors.InvalidArgument("Couldn't find any information about "+searchType+" '" + options.param + "'");
                            }
                        })

                    }

                }

            }).then(function() {

                if(options.format === 'image') { // Return an image

                    var chartRequestParams = {
                        "chart": "LinesChart",
                        "metrics": [{
                            "id": mid
                        }],
                        "configuration": {
                            "height": 300,
                            "area": true
                        },
                        "width": 700
                    }

                    for(var param in params) {
                        chartRequestParams.metrics[0][param] = params[param];
                    }

                    core.data.getMetricsChart(chartRequestParams, callback);

                } else { // Return a text representation
                    getSDHMetric(mid, params).asCallback(callback);
                }

            }).catch(function(e) {
                callback(e);
            })
        } catch(e) {
            callback(e);
        }

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

    var view = function view(callback, vid, options) {

        var getSDHViewInfo = Promise.promisify(core.data.getSDHViewInfo);
        var getSDHView = Promise.promisify(core.data.getSDHView);

        try {
            var params = {};

            if(options.max) {
                params['max'] = options.max;
            }

            if(options.from) {
                var from = Date.create(options.from);
                if(from.isValid()) {
                    params['from'] = from.format("{yyyy}-{MM}-{dd}");
                } else {
                    throw new core.errors.InvalidArgument("'"+options.from+"' is an invalid date");
                }
            }

            if(options.to) {
                var to = Date.create(options.to);
                if(to.isValid()) {
                    params['to'] = to.format("{yyyy}-{MM}-{dd}");
                } else {
                    throw new core.errors.InvalidArgument("'"+options.to+"' is an invalid date");
                }
            }

            getSDHViewInfo(vid).then(function(viewInfo) {

                if(options.param) {

                    if(viewInfo.params.length === 0 || viewInfo.params[0] == null) {
                        throw new core.errors.InvalidArgument("Metric not found. The given metric does not require parameters.")
                    }

                    if(options.param.substr(0, 6) === "sdhid:") { //The id of the user has been specified from the interface
                        if(viewInfo.params.indexOf("uid") === -1) {
                            throw new core.errors.InvalidArgument("Metric not found. The given metric does not require uid parameter.")
                        }
                        params['uid'] = options.param.substring(6);

                    } else { // Try to find out the parameter of the view

                        var expectedParamType = viewInfo.params[0];
                        var searchMethod;
                        switch (expectedParamType) {
                            case 'uid': searchMethod = core.search.users; break;
                            case 'prid': searchMethod = core.search.products; break;
                            case 'pjid': searchMethod = core.search.projects; break;
                            case 'rid': searchMethod = core.search.repositories; break;
                            default:
                                throw new core.errors.InvalidArgument("I don't know the type of paremeter for the view");
                        }

                        // Find in the search engine the entity that fits best with the text correspondin to the parameter
                        return searchMethod(options.param).then(function(results) {
                            if(results && results.length > 0) {
                                var type = results[0]._type;
                                params[expectedParamType] = results[0]._source[type+"_id"];
                            } else {
                                throw new core.errors.InvalidArgument("Couldn't find any information about "+searchType+" '" + options.param + "'");
                            }
                        })

                    }

                }

            }).then(function() {

                getSDHView(vid, params).asCallback(callback);

            }).catch(function(e) {
                callback(e);
            })
        } catch(e) {
            callback(e);
        }

    };

    var product = function product(callback, text) {

        var returnData = function(data) {
            if(!data) {
                callback (new core.errors.InvalidArgument("I could not find product \"" + text + "\""));
            } else {
                callback (null, data);
            }
        };

        core.search.products(text).then(function(results) {
            var products = results.map(function(entry) {
                return sdhProductsByID[entry._source.product_id];
            });

            callback (null, returnData(products[0]));
        });

    };


    var project = function project(callback, text) {

        var returnData = function(data) {
            if(!data) {
                callback (new core.errors.InvalidArgument("I could not find project \"" + text + "\""));
            } else {
                callback (null, data);
            }
        };

        core.search.projects(text).then(function(results) {
            var projects = results.map(function(entry) {
                return sdhProjectsByID[entry._source.project_id];
            });

            callback (null, returnData(projects[0]));
        });

    };

    var repo = function repo(callback, text) {

        var returnData = function(data) {
            if(!data) {
                callback (new core.errors.InvalidArgument("I could not find repository \"" + text + "\""));
            } else {
                callback (null, data);
            }
        };

        core.search.repositories(text).then(function(results) {
            var repositories = results.map(function(entry) {
                return sdhReposByID[entry._source.repo_id];
            });

            callback (null, returnData(repositories[0]));
        });

    };

    var member = function member(callback, text) {

        var returnData = function(data) {
            if(!data) {
                callback (new core.errors.InvalidArgument("I could not find member \"" + text + "\""));
            } else {
                callback (null, data);
            }
        };

        if(text.substr(0, 6) === "sdhid:") {
            var sdhId = text.substring(6);
            returnData(sdhUsersByID[sdhId]);

        } else {
            core.search.users(text).then(function(results) {
                var users = results.map(function(entry) {
                    return sdhUsersByID[entry._source.user_id];
                });
                returnData(users[0]);
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

