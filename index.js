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

    var loadStartDate = new Date();
    try {
        // global buyan
        var bunyan = require('bunyan');
        var PrettyStream = require('bunyan-prettystream');
    } catch (err) {
        console.error("Bot Error. bunyan logs problem: " + err);
    }
    try {
        // Set Config params
        require('./config');
    } catch (err) {
        console.error("Fatal BOT Error with config: " + err);
        log.info('Exiting...');
        setTimeout(function() {
            process.exit(0);
        }, 1000);
    }
    /* File Log */
    var prettyStdOut = new PrettyStream();
    prettyStdOut.pipe(process.stdout);
    GLOBAL.log = null;
    GLOBAL.mkdirp = require("mkdirp");
    GLOBAL.getDirName = require("path").dirname;
    mkdirp(getDirName(FILE_LOG_PATH), function (err) {
        if (err) {
            console.error("! Log file disabled");
            console.error("Error creating log file " +  FILE_LOG_PATH);
            log.error(err);
        } else {
            GLOBAL.moment = require("moment");
            GLOBAL.request = require('request');
            log = bunyan.createLogger({
                    name: 'SDH-BOT',
                    streams: [{
                        level: CONSOLE_LOG_LEVEL,
                        stream: prettyStdOut
                    },
                    {
                        level: FILE_LOG_LEVEL,
                        type: 'rotating-file',
                        path: FILE_LOG_PATH,
                        period: FILE_LOG_PERIOD + 'h',   // daily rotation
                        count: FILE_LOG_NFILES        // keep 3 back copies
                    }]
            });
            var oldBots = require('./botinterfaces.js');
            //startBOT();
        }
    });

    var startBOT = function startBOT () {
        log.info('...starting...');
        /*var Botkit = require('botkit');
        var controller = Botkit.slackbot();
        var bot = controller.spawn({
          token: SLACK_BOT_TOKEN
        })
        bot.startRTM(function(err,bot,payload) {
            if (err) {
                throw new Error('Could not connect to Slack');
            }
        });
        //Try out basic commands, bot.hears() will allow your bot to listen for a key word and reply.
        controller.hears(["api",".*api.*"],["direct_message","direct_mention","mention","ambient"],function(bot,message) {
            // do something to respond to message
            // all of the fields available in a normal Slack message object are available
            // https://api.slack.com/events/message
            bot.reply(message,'Decías algo de la API?');
        });
        controller.hears(['what is my name','who am i', 'quien soy', 'quien soy yo'],['direct_message','direct_mention','mention'],function(bot, message) {

            bot.reply(message,'Your name is pepe');
        });*/

        if (!SLACK_BOT_TOKEN) {
            console.log('Error: Specify SLACK_BOT_TOKEN');
            process.exit(1);
        }

        var Botkit = require('botkit');
        var os = require('os');

        var controller = Botkit.slackbot({
            debug: false,
        });

        var bot = controller.spawn({
            token: SLACK_BOT_TOKEN
        }).startRTM();

        // reply to @bot hello
        controller.on('',function(bot,message) {

          // reply to _message_ by using the _bot_ object
          bot.reply(message,'I heard you mention me!');

        });

        /*controller.on('ambient',function(bot,message) {

          // reply to _message_ by using the _bot_ object
          bot.reply(message,'Ok. ambient!');

        });*/

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
          bot.reply(message,'You are talking directly to me');

        });

        bot.api.channels.list({},function(err,response) {
            log.info('...channels.list...');
            // log.info(response); All channels list
        });

        bot.api.channels.info({},function(err,response) {
            log.info('...api.channels.info...');
            log.info(response); //All channel info
        });

        bot.api.channels.join({},function(err,response) {
            log.info('...api.channels.join...');
            log.info(response); //Channel join
        });

        bot.api.channels.leave({},function(err,response) {
            log.info('...api.channels.leave...');
            log.info(response); //Channel leave
        });

        controller.hears(['hello','hi'],'direct_message,direct_mention,mention',function(bot, message) {

            bot.api.reactions.add({
                timestamp: message.ts,
                channel: message.channel,
                name: 'robot_face',
            },function(err, res) {
                if (err) {
                    bot.botkit.log('Failed to add emoji reaction :(',err);
                }
            });

            controller.storage.users.get(message.user,function(err, user) {
                if (user && user.name) {
                    bot.reply(message,'Hello ' + user.name + '!!');
                } else {
                    bot.api.users.info({user:message.user}, function(err, res) {
                        if (err) {
                            log.error(err);
                            return;
                        }
                        bot.reply(message,'Hello ' + res.user.name + '!!');
                    });
                }
            });
        });

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
};
