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
var directives = {};

//TODO: export this method to the core root
module.exports = function(log) {

    var _exports = {};

    var isInteger = function(value) {
        return typeof value === "number" &&
            isFinite(value) &&
            Math.floor(value) === value;
    };

    /**
     *
     * @param pos The number of the capture group (starting from cero)
     * @param replaceMethod Optional. Regexp to find a value to replace or a function to execute.
     * @param replaceWith Optional. The value to replace with.
     * @constructor
     */
    var RgxSubstr = function RgxSubstr(pos, replaceMethod, replaceWith) {
        this.pos = pos;
        if(replaceMethod instanceof RegExp && replaceWith) {
            this.replaceRegexp = replaceRegexp;
            this.replaceWith = replaceWith;
        } else if (typeof replaceMethod === 'function') {
            this.replaceFunction = replaceMethod;
        }
    }

    RgxSubstr.prototype.getValueInMatch = function(rgxResult, extraInfo) {
        var value = rgxResult[this.pos + 1];
        if(this.replaceRegexp) {
            return (value + "").replace(this.replaceRegexp, this.replaceWith);
        } else if(this.replaceFunction) {
            return this.replaceFunction(value, extraInfo);
        } else {
            return value;
        }
    }
    _exports.RgxSubstr = RgxSubstr;


    _exports.registerDirective = function(pattern, operation, mappings) {

        try {
            var regex = (pattern instanceof RegExp ? pattern : new RegExp(pattern));
            var regexStr = regex.toString();
        } catch(e) {
            log.error("Invalid RegExp for pattern: " + e);
            return false;
        }

        // Check that the pattern does not exist
        if(directives[regexStr]) {
            return false;
        }

        if(typeof operation !== 'function') {
            log.error("Invalid operation for directive");
            return false;
        }

        // Add the directive to the list
        try {
            directives[regexStr] = {
                regex: regex,
                operation: operation,
                mappings: mappings
            }
        } catch(e) {
            log.error("Invalid RegExp for pattern: " + e);
            return false;
        }

    };

    var replaceMappings = function(mappings, matches, extraInfo) {

        var newObj = mappings;
        if (mappings && typeof mappings === 'object') {
            newObj = mappings instanceof Array ? [] : {};
            for (var i in mappings) {
                if(mappings[i] instanceof RgxSubstr) {
                    newObj[i] = mappings[i].getValueInMatch(matches, extraInfo)
                } else {
                    newObj[i] = replaceMappings(mappings[i], matches, extraInfo);
                }
            }
        }
        return newObj;

    };

    _exports.handleMessage = function(msg, cb, extraInfo) {

        for(var regexStr in directives) {
            var directive = directives[regexStr];

            // Reset the lastIndex just in case we have been given a global regexp
            directive.regex.lastIndex = 0;

            // Execute the regexp and create the arguments array for the operation given the mappings
            var substrings = directive.regex.exec(msg) //The substrings starts from index 1, 0 is the matched string
            if(substrings) {
                var mappings = directive.mappings;
                var operationArgs = [ cb ];

                if(mappings) {
                    operationArgs = operationArgs.concat(replaceMappings(mappings, substrings, extraInfo));
                }

                // Execute operation after all the promisses (if any) have been fullfilled
                Promise.map(operationArgs, function(arg) {
                    if(typeof arg === 'object') {
                        return Promise.props(arg); //If is a map object, make sure all the properties have been fullfilled
                    } else {
                        return arg;
                    }
                }).then(function(argValues) {
                    directive.operation.apply(null, argValues);
                });

                return true;
            }
        }

        return false;

    };


    return _exports;
}