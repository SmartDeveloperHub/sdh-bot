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

module.exports = function(sdhApiUrl, imagesServiceUrl, log) {

    var _exports = {};

    /* PRIVATE */
    var getValidAPIUri = function getValidAPIUri(path) {
        var a = sdhApiUrl;
        if (sdhApiUrl[sdhApiUrl.length-1] !== '/'){
            a += '/';
        }
        return a + path;
    };

    var requestApiUri = function requestApiUri(uri, callback) { //TODO: optimize the others using this method
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

    var generateQueryParamsString = function generateQueryParamsString(params) {
        var qp = [];
        for (var param in params) {
            qp.push(param+"="+encodeURIComponent(params[param]));
        }
        return (qp.length ? "?" + qp.join('&'): '');
    };

    /* PUBLIC */
    _exports.getSDHMembers = function getSDHMembers(callback) {
        requestApiUri(getValidAPIUri('users'), callback);
    };

    _exports.getSDHMetrics = function getSDHMetrics(callback) {
        requestApiUri(getValidAPIUri('metrics'), callback);
    };

    _exports.getSDHMetricInfo = function getSDHMetricInfo(mid, callback) {
        requestApiUri(getValidAPIUri('metricinfo/' + mid), callback);
    };

    _exports.getSDHMetric = function getSDHMetric(mid, params, callback) {
        var qpStr = generateQueryParamsString(params);
        requestApiUri(getValidAPIUri('metrics/' + mid + qpStr), callback);
    };

    _exports.getSDHViews = function getSDHViews(callback) {
        requestApiUri(getValidAPIUri('tbdata/'), callback);
    };

    _exports.getSDHView = function getSDHView(vid, options, callback) {
        var qpStr = generateQueryParamsString(options);
        requestApiUri(getValidAPIUri('tbdata/' + vid + qpStr), callback);
    };

    _exports.getSDHViewInfo = function getSDHViewInfo(id, callback) {
        requestApiUri(getValidAPIUri('tbdatainfo/' + id), callback);
    };

    _exports.getSDHProducts = function getSDHProducts (callback) {
        requestApiUri(getValidAPIUri('products'), callback);
    };

    _exports.getSDHProduct = function getSDHProduct (prid, options, callback) {
        requestApiUri(getValidAPIUri('products/' + prid), callback);
    };

    _exports.getSDHProjects = function getSDHProjects (callback) {
        requestApiUri(getValidAPIUri('projects'), callback);
    };

    _exports.getSDHProject = function getSDHProject (pjid, options, callback) {
        requestApiUri(getValidAPIUri('projects/' + pjid), callback);
    };

    _exports.getSDHRepositories = function getSDHRepositories (callback) {
        requestApiUri(getValidAPIUri('repositories'), callback);
    };

    _exports.getSDHRepository = function getSDHRepository (rid, options, callback) {
        requestApiUri(getValidAPIUri('repositories/' + rid), callback);
    };

    _exports.getSDHOrganizations = function getSDHOrganizations (callback) {
        requestApiUri(getValidAPIUri('organization'), callback);
    };

    // This metod is not avalable in SDH API by the moment
    _exports.getSDHOrganization = function getSDHOrganization (oid, options, callback) {
        requestApiUri(getValidAPIUri('organizations/' + oid), callback);
    };

    _exports.getMetricsChart = function(options, callback) {
        request.post({url:imagesServiceUrl + '/persistent-image', json: options}, function(err, response, body) {
            if(!err && response.statusCode == 200) {
                callback(null, response.headers['location']);
            } else {
                callback(new Error("Could not retrieve an image from the images service: " + body));
            }

        })
    };

    return _exports;

};

