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

var directives = {};

//TODO: export this method to the core root
module.exports = function(log) {

    var _exports = {};

    var isInteger = function(value) {
        return typeof value === "number" &&
            isFinite(value) &&
            Math.floor(value) === value;
    };


    _exports. registerDirective =function(pattern, operation, mappings) {

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

        //TODO: mapping contiene un array que indica para cada argument de la operación la variable del pattern que le corresponde o un texto
        //TODO: ejemplo [1,0,"coche"] sería que el primer param de la operacion es la segunda variable de la regex, el segundo es la primera y el tercero un texto "coche"
        //TODO
    };

    _exports.handleMessage = function(msg, cb) {

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
                    for(var a = 0; a < mappings.length; a++) {
                        var value = mappings[a];
                        if(typeof value === "number" && Math.floor(value) === value && value < substrings.length - 1) {
                            operationArgs.push(substrings[value + 1]);
                        } else if(typeof value === 'string') {
                            operationArgs.push(value);
                        } else {
                            log.warn("Invalid mapping '"+ value +"'for " + regexStr);
                        }
                    }
                }

                // Execute operation
                directive.operation.apply(null, operationArgs);
                return true;
            }
        }

        return false;

    };


    return _exports;
}