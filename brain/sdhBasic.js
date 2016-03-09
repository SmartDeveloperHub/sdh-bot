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
    /* PRIVATE */
    var getValidAPIUri = function getValidAPIUri(path) {
        var a = SDH_API_URL;
        if (SDH_API_URL[SDH_API_URL.length-1] !== '/'){
            a += '/';
        }
        return a + path;
    };

    var preloadAllMetrics = function preloadAllMetrics() {
        getSDHMetrics(function(sdhMetrics) {
            log.info("SSDH Metric List:");
            log.info(JSON.stringify(sdhMetrics)); // Array
            GLOBAL.metricsById = {};
            for (var i = 0; i < sdhMetrics.length; i++) {
                metricsById[sdhMetrics[i].id] = sdhMetrics[i];
            }
        });
    };

    var preloadAllUsers = function preloadAllUsers() {
        bot.api.users.list({}, function(err, res) {
            if (err) {
                log.error(err);
                return;
            }
            getSDHMembers(function(sdhMembers) {
                log.info("Slack Users List:");
                log.info(JSON.stringify(res.members)); // Array
                log.info("SDH Members List:");
                log.info(JSON.stringify(sdhMembers)); // Array

                GLOBAL.usersBySlackId = {};
                GLOBAL.usersBySDHId = {};
                GLOBAL.usersByNick = {};
                // Pointers. Read Only
                GLOBAL.knownUsers = [];
                GLOBAL.knownUsersBySlackId = {};

                for (var i = 0; i < res.members.length; i++) {
                    var mi = res.members[i];
                    if (mi.deleted) {
                        continue;
                    }
                    var u = {
                        slack_name: mi.name,
                        slack_id: mi.id,
                        slack_team_id: mi.team_id,
                        slack_first_name: mi.profile.first_name,
                        slack_last_name: mi.profile.last_name,
                        slack_real_name: mi.profile.real_name_normalized,
                        slack_avatar: mi.profile.image_192, // image_original is optional... gravatar etc
                        slack_email: mi.profile.email,
                        slack_color: mi.color
                    };
                    usersBySlackId[mi.id] = u;
                    usersByNick[mi.name] = u;
                }
                for (var z = 0; z < sdhMembers.length; z++) {
                    var mix = false;
                    var mi = sdhMembers[z];
                    // position
                    var pos;
                    switch (mi.positionsByOrgId[1][0]) { // By de moment only 1 org and only 1 position for each org
                         case 1 :
                            pos = 'Director';
                            break;
                        case 2 :
                            pos = "Product Manager";
                            break;
                        case 3 :
                            pos = "Architect";
                            break;
                        case 4 :
                            pos = "Developer";
                            break;
                        default:
                            pos = "Unknown";
                            break;
                    };

                    if (mi.nick in usersByNick) {
                        // SDH & Slack user !! Mixing...
                        mix = true;
                        var mis = usersByNick[mi.nick];
                        usersBySDHId[mi.userid] = {
                            slack_name: mis.slack_name,
                            slack_id: mi.slack_id,
                            slack_team_id: mis.slack_team_id,
                            slack_first_name: mis.slack_first_name,
                            slack_last_name: mis.slack_last_name,
                            slack_real_name: mis.slack_real_name,
                            slack_avatar: mis.slack_avatar,
                            slack_email: mis.slack_email,
                            slack_color: mis.color
                        };
                        usersBySlackId[mis.slack_id]['sdh_nick'] = mi.nick;
                        usersBySlackId[mis.slack_id]['sdh_id'] = mi.userid;
                        usersBySlackId[mis.slack_id]['sdh_name'] = mi.name;
                        usersBySlackId[mis.slack_id]['sdh_avatar'] = mi.avatar;
                        usersBySlackId[mis.slack_id]['sdh_email'] = mi.email;
                        usersBySlackId[mis.slack_id]['sdh_position']  = pos;
                        usersBySlackId[mis.slack_id]['sdh_register']  = mi.register;
                    } else {
                        // Only SDH member
                        usersByNick[mi.nick] = {};
                        usersBySDHId[mi.userid] = {};
                    }

                    usersBySDHId[mi.userid]['sdh_nick'] = mi.nick;
                    usersBySDHId[mi.userid]['sdh_id'] = mi.userid;
                    usersBySDHId[mi.userid]['sdh_name'] = mi.name;
                    usersBySDHId[mi.userid]['sdh_avatar'] = mi.avatar;
                    usersBySDHId[mi.userid]['sdh_email'] = mi.email;
                    usersBySDHId[mi.userid]['sdh_position'] = pos;
                    usersBySDHId[mi.userid]['sdh_register'] = mi.register;

                    usersByNick[mi.nick]['sdh_nick'] = mi.nick;
                    usersByNick[mi.nick]['sdh_id'] = mi.userid;
                    usersByNick[mi.nick]['sdh_name'] = mi.name;
                    usersByNick[mi.nick]['sdh_avatar'] = mi.avatar;
                    usersByNick[mi.nick]['sdh_email'] = mi.email;
                    usersByNick[mi.nick]['sdh_position'] = pos;
                    usersByNick[mi.nick]['sdh_register'] = mi.register;

                    if(mix) {
                        // Read Only
                        knownUsers.push(usersByNick[mi.nick]);
                        knownUsersBySlackId[mis.slack_id] = usersByNick[mi.nick];
                    }
                }
                log.debug('-----------------  usersByNick   --------------------');
                log.debug(JSON.stringify(usersByNick));
                log.debug('-----------------  usersBySlackId   --------------------');
                log.debug(JSON.stringify(usersBySlackId));
                log.debug('-----------------  usersBySDHId   --------------------');
                log.debug(JSON.stringify(usersBySlackId));
                log.debug('-----------------  knownUsers   --------------------');
                log.debug(JSON.stringify(knownUsers));
                log.debug('-----------------  knownUsersBySlackId   --------------------');
                log.debug(JSON.stringify(knownUsersBySlackId));
                return knownUsers;
            });
        });
    };

    /* PUBLIC */
    module.exports.getSDHMembers = function getSDHMembers(callback) {
        var uri = getValidAPIUri('users');
        log.debug(uri);
        request(uri, function(err, resp, body) {
            var parsedBody = JSON.parse(body);
            if (err || resp.statusCode !== 200) {
                log.error("sdhBasic.getSDHMembers Fails: " + resp.statusCode);
                callback(resp.statusCode);
            } else {
                callback(parsedBody);
            }
        });
    };

    module.exports.getSDHMetrics = function getSDHMetrics(callback) {
        var uri = getValidAPIUri('metrics');
        log.debug(uri);
        request(uri, function(err, resp, body) {
            var parsedBody = JSON.parse(body);
            if (err || resp.statusCode !== 200) {
                log.error("sdhBasic.getSDHMetrics Fails: " + resp.statusCode);
                callback(resp.statusCode);
            } else {
                callback(parsedBody);
            }
        });
    };

    module.exports.getSDHMetric = function getSDHMetric(mid, options, callback) {
        var qp;
        // TODO query params
        var uri = getValidAPIUri('metrics/' + mid);
        log.debug(uri);
        request(uri, function(err, resp, body) {
            if (err || resp.statusCode !== 200) {
                log.error("sdhBasic.getSDHMetric Fails: " + resp.statusCode);
                callback(resp.statusCode);
            } else {
                var parsedBody = JSON.parse(body);
                callback(parsedBody);
            }
        });
    };

    module.exports.getSDHProducts = function getSDHProducts (callback) {
        var uri = getValidAPIUri('products');
        log.debug(uri);
        request(uri, function(err, resp, body) {
            if (err || resp.statusCode !== 200) {
                log.error("sdhBasic.getSDHProducts Fails: " + resp.statusCode);
                callback(resp.statusCode);
            } else {
                var parsedBody = JSON.parse(body);
                callback(parsedBody);
            }
        });
    };

    module.exports.getSDHProduct = function getSDHProduct (prid, options, callback) {
        var uri = getValidAPIUri('products/' + prid);
        log.debug(uri);
        request(uri, function(err, resp, body) {
            if (err || resp.statusCode !== 200) {
                log.error("sdhBasic.getSDHProduct Fails: " + resp.statusCode);
                callback(resp.statusCode);
            } else {
                var parsedBody = JSON.parse(body);
                callback(parsedBody);
            }
        });
    };

    module.exports.getSDHProjects = function getSDHProjects (callback) {
        var uri = getValidAPIUri('projects');
        log.debug(uri);
        request(uri, function(err, resp, body) {
            if (err || resp.statusCode !== 200) {
                log.error("sdhBasic.getSDHProjects Fails: " + resp.statusCode);
                callback(resp.statusCode);
            } else {
                var parsedBody = JSON.parse(body);
                callback(parsedBody);
            }
        });
    };

    module.exports.getSDHProject = function getSDHProject (pjid, options, callback) {
        var uri = getValidAPIUri('projects/' + pjid);
        log.debug(uri);
        request(uri, function(err, resp, body) {
            if (err || resp.statusCode !== 200) {
                log.error("sdhBasic.getSDHProject Fails: " + resp.statusCode);
                callback(resp.statusCode);
            } else {
                var parsedBody = JSON.parse(body);
                callback(parsedBody);
            }
        });
    };

    module.exports.getSDHPRepositories = function getSDHPRepositories (callback) {
        var uri = getValidAPIUri('repositories');
        log.debug(uri);
        request(uri, function(err, resp, body) {
            if (err || resp.statusCode !== 200) {
                log.error("sdhBasic.getSDHPRepositories Fails: " + resp.statusCode);
                callback(resp.statusCode);
            } else {
                var parsedBody = JSON.parse(body);
                callback(parsedBody);
            }
        });
    };

    module.exports.getSDHPRepository = function getSDHPRepository (rid, options, callback) {
        var uri = getValidAPIUri('repositories/' + rid);
        log.debug(uri);
        request(uri, function(err, resp, body) {
            if (err || resp.statusCode !== 200) {
                log.error("sdhBasic.getSDHPRepository Fails: " + resp.statusCode);
                callback(resp.statusCode);
            } else {
                var parsedBody = JSON.parse(body);
                callback(parsedBody);
            }
        });
    };

    module.exports.getSDHOrganizations = function getSDHOrganizations (callback) {
        var uri = getValidAPIUri('organization');
        log.debug(uri);
        request(uri, function(err, resp, body) {
            if (err || resp.statusCode !== 200) {
                log.error("sdhBasic.getSDHOrganizations Fails: " + resp.statusCode);
                callback(resp.statusCode);
            } else {
                var parsedBody = JSON.parse(body);
                callback(parsedBody);
            }
        });
    };

    // This method is not avalable in SDH API by the moment
    /*module.exports.getSDHOrganization = function getSDHOrganization (oid, options, callback) {
        var uri = getValidAPIUri('organizations/' + oid);
        log.debug(uri);
        request(uri, function(err, resp, body) {
            if (err || resp.statusCode !== 200) {
                log.error("sdhBasic.getSDHOrganization Fails: " + resp.statusCode);
                callback(resp.statusCode);
            } else {
                var parsedBody = JSON.parse(body);
                callback(parsedBody);
            }
        });
    };*/