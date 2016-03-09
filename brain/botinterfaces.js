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

    var Botkit = require('botkit');
    var os = require('os');

    GLOBAL.controller = Botkit.slackbot({
        debug: false
    });

    var bot = controller.spawn({
        token: SLACK_BOT_TOKEN
    }).startRTM();

    // reply to @bot hello
    controller.on('',function(bot,message) {

      // reply to _message_ by using the _bot_ object
      bot.reply(message,'I heard you mention me!');

    });

    controller.on('ambient',function(bot,message) {

      // reply to _message_ by using the _bot_ object
      bot.reply(message,'Ok. ambient!');

    });

    /*controller.on('message_received',function(bot,message) {

      // reply to _message_ by using the _bot_ object
      bot.reply(message,'Ok. message_received!');

    });*/
    controller.on('user_group_join',function(bot,message) {

      // reply to _message_ by using the _bot_ object
        log.warn("New user: ");
        log.debug(message);
      bot.reply(message,'Ok. user_group_join!');

    });
    controller.on('user_channel_join',function(bot,message) {

      // reply to _message_ by using the _bot_ object
        log.warn("New user: ");
        log.debug(message);
      bot.reply(message,'Ok. user_channel_join!');

    });
    // reply to a direct message
    controller.on('direct_message',function(bot,message) {

      // reply to _message_ by using the _bot_ object
      //bot.reply(message,'You are talking directly to me');

    });

    bot.api.users.getPresence({},function(err,response) {
        log.info('....api.users.getPresence...');
        //log.info(response);
    });

    bot.api.users.info({},function(err,response) {
        log.info('....api.users.info...');
        //log.info(response);
    });

    bot.api.users.list({},function(err,response) {
        log.info('....api.users.list...');
        //log.info(response);
    });

    bot.api.users.setActive({},function(err,response) {
        log.info('....api.users.setActive...');
        //log.info(response);
    });

    bot.api.users.setPresence({},function(err,response) {
        log.info('....api.users.setPresence...');
        //log.info(response);
    });

    bot.api.channels.list({},function(err,response) {
        log.info('...channels.list...');
        //log.info(response); //All channels list
    });

    bot.api.channels.info({},function(err,response) {
        log.info('...api.channels.info...');
        //log.info(response); //All channel info
    });

    bot.api.channels.join({},function(err,response) {
        log.info('...api.channels.join...');
        //log.info(response); //Channel join
    });

    bot.api.channels.leave({},function(err,response) {
        log.info('...api.channels.leave...');
        //log.info(response); //Channel leave
    });
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

    controller.hears(['users'],'direct_message,direct_mention,mention',function(bot, message) {
        bot.reply(message,JSON.stringify(knownUsers));
    });

    var isPositiveInteger = function isPositiveInteger(val) {
        return val == "0" || ((val | 0) > 0 && val % 1 == 0);
    }

    var getTemporalExpresion = function getTemporalExpresion(tag) {
        var tempPatt = ['day', "week", "month", "year", "last"];
        if (tempPatt.indexOf(tag) > -1 || isPositiveInteger(tag)) {
            return tag;
        } else {
            return;
        }
    };

    var getUserFromTag = function getUserFromTag(tag) {
        // user tag example: '<@u04ekpega>'
        var puid = '';
        var aindex = tag.indexOf('<@');
        if (aindex > -1) {
            // format--> '<@u04ekpega>'
            puid = tag.slice(aindex+2, aindex+2+9).toUpperCase();
        } else if (tag.length == 9) {
            // format--> 'u04ekpega'
            puid = tag;
        } else {
            // format--> ??
        }
        return knownUsersBySlackId[puid];
    };

    var getUserMarkdown = function getUserMarkdown(userList, imageurl, metricLabel, rangeLabel) {
        var atachmentList = [];
        for(var i = 0; i < userList.length; i++){
            var userEnv = {
                uid: userList[i].sdh_id  ,
                name: userList[i].sdh_name
            };
            var mdUser = {
                "fallback": "User description atachment",
                "color": "#" +  userList[i].slack_color,
                //"pretext": "Optional text that appears above the attachment block",

                "author_name": userList[i].sdh_name,
                "author_link": SDH_DASHBOARD_URL + "?env=" + encodeURIComponent(JSON.stringify(userEnv)) + "&dashboard=" + encodeURIComponent("developer"),
                "author_icon": "https://sdh.conwet.fi.upm.es/assets/images/sdh_400ppp_RGB_imagotipo_small.png",

                "title": userList[i].sdh_position,
                "title_link": SDH_DASHBOARD_URL + "?env=" + encodeURIComponent(JSON.stringify(userEnv)) + "&dashboard=" + encodeURIComponent("developer"),

                "text": userList[i].slack_name + ", SDH member since " + moment(userList[i].sdh_register).format("DD/MM/YYYY"),

                /*"fields": [
                    {
                        "title": "Activity",
                        "value": parseInt(Math.random()*100)/ 100,
                        "short": true
                    },
                    {
                        "title": "Health",
                        "value": parseInt(Math.random()*100)/ 100 + "%",
                        "short": true
                    }
                ],*/
                // Under the msg Only 1, or thumb_url or image_url
                "thumb_url": userList[i].sdh_avatar,   // Right
                //"image_url": "http://s16.postimg.org/szdhiphw5/activity.png"
                //"image_url": "http://s28.postimg.org/9idinlsj1/fserena_Activitylastmonth.png"
            };
            if (imageurl) {
                mdUser["image_url"] = imageurl;
                mdUser["fallback"] = "metric atachment";
                mdUser["title"] = userList[i].slack_name + " " + metricLabel + " Metric.";
                mdUser["text"] = rangeLabel;
            }
            atachmentList.push(mdUser);
        }
        return atachmentList;
    };

    controller.hears(["give me (.*)"],'direct_message,direct_mention,mention',function(bot, message) {
        log.info("give me ---> " + message.text);
        var tags = message.text.toLowerCase().split(' ');
        var auxTags = [];
        for (var d = 0; d < tags.length; d ++) {
            if (tags[d] !== "" && tags[d] !== "give" && tags[d] !== "me" && tags[d].indexOf(bot.identity.id.toLowerCase()) == -1) {
                auxTags.push(tags[d]);
            }
        }
        tags = auxTags;
        log.debug(tags);
        var userList = [];
        for (var d = 0; d < tags.length; d ++) {
            var u = getUserFromTag(tags[d]);
            if (u) {
                userList.push(u);
            }
        }
        log.debug(userList);

        if (tags.indexOf("activity") > -1) {
            var imageurl = "http://s28.postimg.org/9idinlsj1/fserena_Activitylastmonth.png";
            var attach = getUserMarkdown(userList, imageurl, "Activity", "Last Month; (16 jan 2016  -  16 Feb 2016)");
        } else {
            var attach = getUserMarkdown(userList);
        }
        bot.reply(message,{
            "attachments": attach
        });
    });

    controller.hears(["metric (.*)"],'direct_message,direct_mention,mention',function(bot, message) {
        log.info("metric ---> " + message.text);
        var tags = message.text.toLowerCase().split(' ');
        var auxTags = [];
        for (var d = 0; d < tags.length; d ++) {
            if (tags[d] !== "" && tags[d] !== "metric" && tags[d].indexOf(bot.identity.id.toLowerCase()) == -1) {
                auxTags.push(tags[d]);
            }
        }
        tags = auxTags;
        log.debug(tags);
        var userList = [];
        var metricList = [];
        var tempExp = [];
        for (var d = 0; d < tags.length; d ++) {
            var u = getUserFromTag(tags[d]);
            var m = metricsById[tags[d]];
            var t = getTemporalExpresion(tags[d]);
            var discartExp = [];
            if (u) {
                userList.push(u);
            } else if(m) {
                metricList.push(m)
            } else if(t) {
                tempExp.push(t);
            } else {
                discartExp.push(tags[d]);
            }
        }
        // compose metric request/s
        log.debug("users: " + JSON.stringify(userList));
        log.debug("metrics: " + JSON.stringify(metricList));
        log.debug("tempTags: " + tempExp);

        // DEMO TODO
        var attach;
        if (tags.indexOf("activity") > -1) {
            var imageurl = "http://s28.postimg.org/9idinlsj1/fserena_Activitylastmonth.png";
            attach = getUserMarkdown(userList, imageurl, "Activity", "Last Month; (16 jan 2016  -  16 Feb 2016)");
        } else if (metricList.length == 0){
            attach = getUserMarkdown(userList);
        } else {
            for (var k = 0; k < metricList.length; k++) {
                // Metrics
                // TODO
                var options = {};
                getSDHMetric(metricList[k], options, function(req){
                    attach = req.values;
                });
            }

        }
        bot.reply(message,{
            "attachments": attach
        });
    });

    controller.hears(['hello','hi','hola'],'direct_message,direct_mention,mention',function(bot, message) {

        /*bot.api.reactions.add({
            timestamp: message.ts,
            channel: message.channel,
            name: 'robot_face',
        },function(err, res) {
            if (err) {
                bot.botkit.log('Failed to add emoji reaction :(',err);
            }
        });*/

        controller.storage.users.get(message.user,function(err, user) {
            if (user && user.name) {
                bot.reply(message,'Hello ' + user.name + ', what can I do for you?');
            } else {
                bot.api.users.info({user:message.user}, function(err, res) {
                    if (err) {
                        log.error(err);
                        return;
                    }
                    bot.reply(message,'Hello ' + res.user.name + ', what can I do for you?');
                });
            }
        });
        // Team Id by botkit
        bot.identifyTeam(function(err,team_id) {
            if (err) {
                log.error(err);
            } else {
                log.info("botkit Team:");
                log.info(team_id);
            }
        });
        // Team Id by slack api
        bot.api.team.info({},function(err,res) {
            if (err) {
                log.error(err);
            } else {
                log.info("Slack API Team:");
                log.info(JSON.stringify(res.team));
            }
        });
        // User
        bot.api.users.info({user:message.user}, function(err, res) {
            if (err) {
                log.error(err);
                return;
            }
            log.info("User:");
            log.info(JSON.stringify(res.user));
            //bot.reply(message,'Hello ' + res.user.name + '!!');
        });
        // usergroups
       /* bot.api.usergroups.list(function(err, res) {
            if (err) {
                log.error(err);
                return;
            }
            log.info("user:");
            log.info(JSON.stringify(res));
        });*/
        // usergroups users
        var groupId = 'T04EKPEG8';
        /*bot.api.usergroups.users.list({usergroup: groupId}, function(err, res) {
            if (err) {
                log.error(err);
                return;
            }
            log.info("usergroups users:");
            log.info(JSON.stringify(res));
        });*/
    });

    var getMembersUri = function getMembersUri() {
        var a = SDH_API_URL;
        if (SDH_API_URL[SDH_API_URL.length-1] !== '/'){
            a += '/';
        }
        return a + 'users';
    };

    var getMetricsUri = function getMetricsUri() {
        var a = SDH_API_URL;
        if (SDH_API_URL[SDH_API_URL.length-1] !== '/'){a += '/';}
        return a + 'metrics';
    };

    var getSDHMembers = function getSDHMembers(callback) {
        var uri = getMembersUri();
        log.info(uri);
        request(uri, function(err, resp, body) {
            var parsedBody = JSON.parse(body);
            if (err) {
                log.error(err);
                callback(err);
            } else {
                callback(parsedBody);
            }
        });
    };
    var getSDHMetrics = function getSDHMetrics(callback) {
        var uri = getMetricsUri();
        log.info(uri);
        request(uri, function(err, resp, body) {
            var parsedBody = JSON.parse(body);
            if (err) {
                log.error(err);
                callback(err);
            } else {
                callback(parsedBody);
            }
        });
    };
    var getSDHMetric = function getSDHMetric(mid, options, callback) {
        var qp;
        // TODO query params
        request(SDH_API_URL + "/metrics/" + mid, function(err, resp, body) {
            if (err || resp.statusCode !== 200) {
                log.error(err);
                callback(err);
            } else {
                var parsedBody = JSON.parse(body);
                callback(parsedBody);
            }
        });
    };
    controller.hears(['link'],'direct_message,direct_mention,mention',function(bot, message) {
        /*bot.reply(message,"\napi.slack.com is text based, so this link will not unfurl:");
        bot.reply(message,{"text": "https://api.slack.com"});

        bot.reply(message,"\npassing unfurl_links: true means the link will unfurl:");
        bot.reply(message,{"text": "https://api.slack.com", "unfurl_links": true});

        bot.reply(message,"\nthis xkcd link is an image, so the content will be unfurled by default:");
        bot.reply(message,{"text": "http://imgs.xkcd.com/comics/regex_golf.png"});

        bot.reply(message,"\nwe can disable that using the unfurl_media flag:");*/
        bot.reply(message,{"text": "http://imgs.xkcd.com/comics/regex_golf.png", "unfurl_media": false});

        /*bot.reply(message,"\neven though unfurl_links is true, this link has a label that matches the URL minus the protocol, so the link will not unfurl:");
        bot.reply(message,{"text": "https://api.slack.com|api.slack.com", "unfurl_links": true});

        bot.reply(message,"\nThe label for this link does not match the URL minus the protocol, so this link will unfurl:");
        bot.reply(message,{"text": "https://api.slack.com|Slack API", "unfurl_links": true});*/
    });

    controller.hears(['version'],'direct_message,direct_mention,mention',function(bot, message) {
        var pjson = require('./../package.json');
        log.info(pjson.version);
        bot.reply(message,{"text": "My version is: " + pjson.version + "\nhttps://www.npmjs.com/package/sdh-slackbot\nhttps://github.com/SmartDeveloperHub/sdh-slackbot.git"});
    });

    /* Return available metric titles filtered by other tags in message text*/
    controller.hears(['metrics'],'direct_message,direct_mention,mention',function(bot, message) {
        log.info("metrics ---> " + message.text);
        var tags = message.text.toLowerCase().split(' ');
        var auxTags = [];
        for (var d = 0; d < tags.length; d ++) {
            if (tags[d] !== "" && tags[d] !== "metrics" && tags[d].indexOf(bot.identity.id.toLowerCase()) == -1) {
                auxTags.push(tags[d]);
            }
        }
        tags = auxTags;
        log.info("tags: " + JSON.stringify(tags));
        request(SDH_API_URL + "/metrics", function(err, resp, body) {
            var parsedBody = JSON.parse(body);
            var parsedElements = [];
            if (err) {
                log.error(err);
            } else {
                for (var i = 0; i < parsedBody.length; i++) {
                    var metric = parsedBody[i];
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
                            parsedElements.push(metric.title);
                        }
                    }

                };
                bot.reply(message,{"text": JSON.stringify(parsedElements)});
            }
        });
    });

    /* Return available metric titles filtered by other tags in message text*/
    controller.hears(['views'],'direct_message,direct_mention,mention',function(bot, message) {
        log.info("---> " + message.text);
        var tags = message.text.toLowerCase().split(' ');
        var auxTags = [];
        for (var d = 0; d < tags.length; d ++) {
            if (tags[d] !== "" && tags[d] !== "views" && tags[d].indexOf(bot.identity.id.toLowerCase()) == -1) {
                auxTags.push(tags[d]);
            }
        }
        tags = auxTags;
        log.info("tags: " + JSON.stringify(tags));
        request(SDH_API_URL + "/tbdata", function(err, resp, body) {
            var parsedBody = JSON.parse(body);
            var parsedElements = [];
            if (err) {
                log.error(err);
            } else {
                for (var i = 0; i < parsedBody.length; i++) {
                    var view = parsedBody[i];
                    var refAtt = view.id.toLowerCase(); // Views have not titles
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
                            parsedElements.push(view.id);
                        }
                    }

                };
                bot.reply(message,{"text": JSON.stringify(parsedElements)});
            }
        });
    });

    controller.hears(['call me (.*)'],'direct_message,direct_mention,mention',function(bot, message) {
        var matches = message.text.match(/call me (.*)/i);
        var name = matches[1];
        controller.storage.users.get(message.user,function(err, user) {
            if (!user) {
                user = {
                    id: message.user,
                };
            }
            user.name = name;
            controller.storage.users.save(user,function(err, id) {
                bot.reply(message,'Got it. I will call you ' + user.name + ' from now on.');
            });
        });
    });

    controller.hears(['what is my name','who am i'],'direct_message,direct_mention,mention',function(bot, message) {

        controller.storage.users.get(message.user,function(err, user) {
            if (user && user.name) {
                bot.reply(message,'Your name is ' + user.name);
            } else {
                bot.reply(message,'I don\'t know yet!');
            }
        });
    });


    controller.hears(['shutdown'],'direct_message,direct_mention,mention',function(bot, message) {

        bot.startConversation(message,function(err, convo) {
            convo.ask('Are you sure you want me to shutdown?',[
                {
                    pattern: bot.utterances.yes,
                    callback: function(response, convo) {
                        convo.say('Bye!');
                        convo.next();
                        setTimeout(function() {
                            process.exit();
                        },3000);
                    }
                },
            {
                pattern: bot.utterances.no,
                default: true,
                callback: function(response, convo) {
                    convo.say('*Phew!*');
                    convo.next();
                }
            }
            ]);
        });
    });


    controller.hears(['uptime','identify yourself','who are you','what is your name'],'direct_message,direct_mention,mention',function(bot, message) {

        var hostname = os.hostname();
        var uptime = formatUptime(process.uptime());

        bot.reply(message,':robot_face: I am a bot named <@' + bot.identity.name + '>. I have been running for ' + uptime + ' on ' + hostname + '.');

    });

    controller.hears(['search'],'direct_message',function(bot, message) {
        var msg = message.text;
        //bot.reply(message,JSON.stringify(msg));
        var words = msg.split(" ");
        var st;
        for (var i=0; i < words.length; i++) {
            var w = words[i];
            if (w !== 'search') {
                if (st) {
                    st += " " + w;
                } else {
                    st = w;
                }
            }
        }
        if (st.length == 0) {
            return;
        }
        log.info('(slack) Searching google image: ' + st);
        var searchCallback = function (images) {
            log.info('(slack) Images from google for: "' + st + '"');
            var randomImg = images[randomIntFromInterval(0, images.length-1)];
            var firstImg = images[0];
            var imURL = firstImg.url;
            log.info('---> (slack) ' + imURL);
            bot.reply(message, imURL);
        };
        getImagesFromGoogle(st, searchCallback);
    });

    controller.hears(['meme'],'direct_message',function(bot, message) {
        var msg = message.text;
        //bot.reply(message,JSON.stringify(msg));
        var searchCallback = function (images) {
            var randomImg = images[randomIntFromInterval(0, images.length-1)];
            var firstImg = images[0];
            var imURL = firstImg.url;
            bot.reply(message, imURL);
        };
        getImagesFromGoogle(msg, searchCallback);
    });

    /* PRIVATE */
    function formatUptime(uptime) {
        var unit = 'second';
        if (uptime > 60) {
            uptime = uptime / 60;
            unit = 'minute';
        }
        if (uptime > 60) {
            uptime = uptime / 60;
            unit = 'hour';
        }
        if (uptime != 1) {
            unit = unit + 's';
        }

        uptime = uptime + ' ' + unit;
        return uptime;
    }


preloadAllUsers();
preloadAllMetrics()

var randomIntFromInterval = function randomIntFromInterval(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
};

        /* Telegram */
        var TelegramBot = require('node-telegram-bot-api');
        // Este id te lo da egram al crear el bot con BotFather
        var token = '182243281:AAEfX1Ol9KekpvF9lshCzcFu-uKM6LCaNpE';
        // Setup polling way
        var bot = new TelegramBot(token, {polling: true});
        /*bot.on('text', function (msg) {
          var chatId = msg.chat.id;
          bot.sendMessage(chatId,msg.from.first_name + " eco: " + msg.text);
        });*/
        // Matches /echo [whatever]
        bot.onText(/\/echo (.+)/, function (msg, match) {
          var fromId = msg.from.id;
          var resp = match[1];
          bot.sendMessage(fromId, resp);
        });
        bot.onText(/hola|hi|saludos|hello/, function (msg, match) {
            var fromId = msg.from.id;
          var chatId = msg.chat.id;
          bot.sendMessage(fromId, "Hi " + msg.from.first_name + "!!! I'm SDH-Bot");
        });

        // Any kind of message
        /*bot.on('message', function (msg) {
          var chatId = msg.chat.id;
          // photo can be: a file path, a stream or a Telegram file_id
          //var photo = './img/sdh_400ppp_RGB.png'; // Local image
            var url1 = "https://sdh.conwet.fi.upm.es/assets/images/sdh_400ppp_RGB.png";
            var photo = request(url1);
          bot.sendPhoto(chatId, photo, {caption: 'Smart Developer Hub'});
        });*/
        bot.onText(/version/,function(msg, match) {
            var fromId = msg.from.id;
            var pjson = require('./../package.json');
            log.info(pjson.version);
            bot.sendMessage(fromId, "My version is: " + pjson.version + "\nhttps://www.npmjs.com/package/sdh-slackbot\nhttps://github.com/SmartDeveloperHub/sdh-slackbot.git");
        });

/* Google Search */
/*TODO change this and use my own google-search package*/
var googleImages = require('google-images');

// TODO env var or config vars
// el primer parámetro es el id del search engine que he creado en mi cuenta de @centeropenm...(SDH-Search) El segundo la API key
// que se genera en https://console.developers.google.com para el motor de busqueda concreto. hay que generar una app
// que en mi caso es GoogleSearch4BOT
var client = googleImages('004571087642516385915:vh8bxxx-o38', 'AIzaSyDEOTbjMSFrkiyDrZLfz4De-yZ1KuFx35Q');

// paginate results
/*client.search('Steve Angello', {
    page: 2
});

// search for certain size
client.search('Steve Angello', {
    size: 'large'
});*/

    // PreGetting gatetes
    var gatetes;
    client.search('cat', {})
        .then(function (images) {
            gatetes = images;
            log.info("gatetes: " + images);
            /*
            [{
                "url": "http://steveangello.com/boss.jpg",
                "type": "image/jpeg",
                "width": 1024,
                "height": 768,
                "size": 102451,
                "thumbnail": {
                    "url": "http://steveangello.com/thumbnail.jpg",
                    "width": 512,
                    "height": 512
                }
            }]
             */
        });
        bot.onText(/gato|gatete|kitty|gatico/, function (msg, match) {
            var chatId = msg.chat.id;
            var theGatete = request(gatetes[randomIntFromInterval(0, gatetes.length-1)].url);
            bot.sendPhoto(chatId, theGatete, {caption: 'miau!'});
        });

// Image search telegram

        var getImagesFromGoogle = function getImagesFromGoogle(searchText, callback){
                client.search(searchText).then(callback);
        };

        bot.onText(/search/, function (msg, match) {

            var chatId = msg.chat.id;
            var words = msg.text.split(" ");
            var st = "";
            for (var i=0; i < words.length; i++) {
                var w = words[i];
                if (w !== 'search') {
                    if (st) {
                        st += " " + w;
                    } else {
                        st = w;
                    }
                }
            }
            if (st.length == 0) {
                return;
            }
            log.info('(telegram) Searching google image: ' + st);
            var searchCallback = function (images) {
                log.info('(telegram) Images from google for: "' + st + '"');
                var randomImg = images[randomIntFromInterval(0, images.length - 1)];
                var firstImg = images[0];
                var imURL = firstImg.url;

                if (firstImg.type !== "image/") {
                    var theImage = request(imURL);
                    log.info('---> (telegram) ' + imURL);
                    bot.sendPhoto(chatId, theImage, {caption: st});
                } else {
                    var defaultImg = request('http://princessmomo.com/wp-content/uploads/2011/09/incompatible.jpg');
                    log.info('---> (telegram) DEFAULT IMAGE');
                    bot.sendPhoto(chatId, defaultImg, {caption: "Not compatible img: " + imURL});
                }

            };
            getImagesFromGoogle(st, searchCallback);
        });

        bot.onText(/meme/,function(msg, match) {
            var chatId = msg.chat.id;
            var searchCallback = function (images) {
                var randomImg = images[randomIntFromInterval(0, images.length-1)];
                var firstImg = images[0];
                var imURL = firstImg.url;
                var theImage = request(imURL);
                bot.sendPhoto(chatId, theImage, {caption: msg.text});
            };
            getImagesFromGoogle(msg.text, searchCallback);
        });