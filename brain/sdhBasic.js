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

var request = require('request');

module.exports = function(sdhApiUrl, log) {

    var _exports = {};

    /* PRIVATE */
    var getValidAPIUri = function getValidAPIUri(path) {
        var a = sdhApiUrl;
        if (sdhApiUrl[sdhApiUrl.length-1] !== '/'){
            a += '/';
        }
        return a + path;
    };

    /* PUBLIC */
    _exports.getSDHMembers = function getSDHMembers(callback) {
        var uri = getValidAPIUri('users');
        log.debug(uri);
        request(uri, function(err, resp, body) {
            var parsedBody = JSON.parse(body);
            if (err) {
                log.error(err);
                callback(err);
            } else {
                callback(err, parsedBody);
            }
        });
    };

    _exports.getSDHMetrics = function getSDHMetrics(callback) {
        var uri = getValidAPIUri('metrics');
        log.debug(uri);
        request(uri, function(err, resp, body) {
            var parsedBody = JSON.parse(body);
            if (err) {
                log.error(err);
                callback(err);
            } else {
                callback(err, parsedBody);
            }
        });
    };

    _exports.getSDHMetric = function getSDHMetric(mid, options, callback) {
        var qp;
        // TODO query params
        var uri = getValidAPIUri('metrics/' + mid);
        log.debug(uri);
        request(uri, function(err, resp, body) {
            if (err || resp.statusCode !== 200) {
                log.error(err);
                callback(err);
            } else {
                var parsedBody = JSON.parse(body);
                callback(err, parsedBody);
            }
        });
    };

    _exports.getSDHViews = function getSDHViews(callback) {
        var uri = getValidAPIUri('tbdata/');
        log.debug(uri);
        request(uri, function(err, resp, body) {
            if (err || resp.statusCode !== 200) {
                log.error(err);
                callback(err);
            } else {
                var parsedBody = JSON.parse(body);
                callback(err, parsedBody);
            }
        });
    };

    _exports.getSDHView = function getSDHView(vid, options, callback) {
        var qp;
        // TODO query params.. only for test by the moment testing /tbdata/view-director-products?uid=1004
        var uri = getValidAPIUri('tbdata/' + vid + '?uid=' + options.uid);
        log.debug(uri);
        request(uri, function(err, resp, body) {
            if (err || resp.statusCode !== 200) {
                log.error(err);
                callback(err);
            } else {
                var parsedBody = JSON.parse(body);
                callback(err, parsedBody);
            }
        });
    };

    _exports.getSDHProducts = function getSDHProducts (callback) {
        var uri = getValidAPIUri('products');
        log.debug(uri);
        request(uri, function(err, resp, body) {
            if (err || resp.statusCode !== 200) {
                log.error(err);
                callback(err);
            } else {
                var parsedBody = JSON.parse(body);
                callback(err, parsedBody);
            }
        });
    };

    _exports.getSDHProduct = function getSDHProduct (prid, options, callback) {
        var uri = getValidAPIUri('products/' + prid);
        log.debug(uri);
        request(uri, function(err, resp, body) {
            if (err || resp.statusCode !== 200) {
                log.error(err);
                callback(err);
            } else {
                var parsedBody = JSON.parse(body);
                callback(err, parsedBody);
            }
        });
    };

    _exports.getSDHProjects = function getSDHProjects (callback) {
        var uri = getValidAPIUri('projects');
        log.debug(uri);
        request(uri, function(err, resp, body) {
            if (err || resp.statusCode !== 200) {
                log.error(err);
                callback(err);
            } else {
                var parsedBody = JSON.parse(body);
                callback(err, parsedBody);
            }
        });
    };

    _exports.getSDHProject = function getSDHProject (pjid, options, callback) {
        var uri = getValidAPIUri('projects/' + pjid);
        log.debug(uri);
        request(uri, function(err, resp, body) {
            if (err || resp.statusCode !== 200) {
                log.error(err);
                callback(err);
            } else {
                var parsedBody = JSON.parse(body);
                callback(err, parsedBody);
            }
        });
    };

    _exports.getSDHRepositories = function getSDHRepositories (callback) {
        var uri = getValidAPIUri('repositories');
        log.debug(uri);
        request(uri, function(err, resp, body) {
            if (err || resp.statusCode !== 200) {
                log.error(err);
                callback(err);
            } else {
                var parsedBody = JSON.parse(body);
                callback(err, parsedBody);
            }
        });
    };

    _exports.getSDHRepository = function getSDHRepository (rid, options, callback) {
        var uri = getValidAPIUri('repositories/' + rid);
        log.debug(uri);
        request(uri, function(err, resp, body) {
            if (err || resp.statusCode !== 200) {
                log.error(err);
                callback(err);
            } else {
                var parsedBody = JSON.parse(body);
                callback(err, parsedBody);
            }
        });
    };

    _exports.getSDHOrganizations = function getSDHOrganizations (callback) {
        var uri = getValidAPIUri('organization');
        log.debug(uri);
        request(uri, function(err, resp, body) {
            if (err || resp.statusCode !== 200) {
                log.error(err);
                callback(err);
            } else {
                var parsedBody = JSON.parse(body);
                callback(err, parsedBody);
            }
        });
    };

    // This metod is not avalable in SDH API by the moment
    _exports.getSDHOrganization = function getSDHOrganization (oid, options, callback) {
        var uri = getValidAPIUri('organizations/' + oid);
        log.debug(uri);
        request(uri, function(err, resp, body) {
            if (err || resp.statusCode !== 200) {
                log.error(err);
                callback(err);
            } else {
                var parsedBody = JSON.parse(body);
                callback(err, parsedBody);
            }
        });
    };

    return _exports;

}

