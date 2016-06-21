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

var Promise = require("bluebird");

// Do not silently capture errors
Promise.onPossiblyUnhandledRejection(function(error){
    throw error;
});

module.exports = function(elasticSearchUrl, elasticConfig, core, log) {

    var _exports = {};

    var sdhData = Promise.promisifyAll(core.data);

    //TODO: just for testing
    var elasticsearch = require('elasticsearch');

    var elasticClient = new elasticsearch.Client({
        host: elasticSearchUrl,
        log: 'debug',
        defer: function () {
            return Promise.defer();
        }
    });

    /**
     * Store a document in elastic search
     * @param index Index where to store the document
     * @param type Type of the docuement
     * @param data Object containing the data to store as a document
     * @param params Parameters of the "data" to store
     * @param options Extra options such as transformations
     * @returns {*}
     */
    var addDocument = function(index, type, data, params, options) {

        if(!options) {
            options = {};
        }

        if(!options.trans) {
            options.trans = {}; // Transformations
        }

        var body = {};
        for(var param in data) {
            if(params.indexOf(param) != -1) {

                var name = param;
                var value = data[param];

                if(options.trans[param]) { //Transform the parameter
                    var trans = options.trans[param];

                    if(trans.name) {
                        name = trans.name;
                    }

                }

                body[type + "_" + name] = value;
            }
        }

        return elasticClient.index({
            index: index,
            type: type,
            body: body
        });
    };

    var addAll = function(list, index, type, params, options) {
        var prom = list.map(function(data) {
            return addDocument(index, type, data, params, options);
        });
        return Promise.all(prom);
    };

    var addAllObjects = function(map, index, type, params, options) {

        var proms = [];
        for(var key in map) {
            if(map.hasOwnProperty(key)) {
                var data = map[key];
                proms.push(addDocument(index, type, data, params, options));
            }
        }

        return Promise.all(proms);
    };

    var createMapping = function(index, type, props) {

        var properties = {};
        for(var name in props) {
            if(props.hasOwnProperty(name)) {

                var p = props[name];

                properties[type + "_" + name] = {
                    type: (p.type ? p.type : "string"),
                    analyzer: (p.analyzer ? p.analyzer : "simple")
                }

            }
        }

        return elasticClient.indices.putMapping({
            index: index,
            type: type,
            body: {
                properties: properties
            }
        });
    };

    var makeMultiMatchQuery = function(index, fields, text, options) {

        if(!options) options = {};

        return elasticClient.search({
            index: index,
            body: {
                query: {
                    "multi_match": {
                        "query": text,
                        "type": "best_fields",
                        "fields": fields,
                        "tie_breaker": 0.3,
                        "fuzziness": "AUTO"
                    }
                },
                "size": (options.size ? options.size : 10),
                "from": (options.from ? options.from : 0),
                "sort":{
                    "_score":{
                        "order":"desc"
                    }
                }
            }
        }).then(function(result) {
            return result.hits.hits;
        }).catch(function(e) {
            log.error(e);
            return null;
        });

    };

    for(var i = 0; i < elasticConfig.length; i++) {
        var index = elasticConfig[i];

        // Create index mappings operations
        for(var m = 0; m < index.mappings.length; m++) {
            var mapping = index.mappings[m];

            for(var o = 0; o < mapping.operations.length; o++) {
                var operation = mapping.operations[o];

                //Add mapping class to search parameters
                var searchParams = [];
                for(var s = 0; s < operation.search.length; s++) {
                    searchParams.push(mapping.class + "_" + operation.search[s]);
                }
                _exports[operation.name] = makeMultiMatchQuery.bind(undefined, index.index, searchParams);
            }

        }

        // Create index general operations
        for(o = 0; o < index.operations.length; o++) {
            operation = index.operations[o];
            _exports[operation.name] = makeMultiMatchQuery.bind(undefined, index.index, operation.search);
        }

    }


    // ----------------------------------------------------------
    // ------------------- PUBLIC METHODS -----------------------
    // ----------------------------------------------------------
    _exports.fillWithData = function() {

        var promises = [];

        for(var i = 0; i < elasticConfig.length; i++) {
            var index = elasticConfig[i];
            var promise;

            // Delete index if exists
            promise = elasticClient.indices.exists({
                index: index.index
            }).then(function(index, exists) {
                if(exists) {
                    return elasticClient.indices.delete({
                        index: index.index
                    });
                }
            }.bind(null, index)).then(function(index) {
                return elasticClient.indices.create({
                    index: index.index
                });
            }.bind(null, index));

            // Create index mappings
            promise = promise.then(function() {

                var mappingProms = [];

                for(var m = 0; m < index.mappings.length; m++) {
                    var mapping = index.mappings[m];
                    mappingProms.push(createMapping(index.index, mapping.class, mapping.attributes));
                }

                return Promise.all(mappingProms);

            }.bind(null, index));

            // Fill with data
            promise = promise.then(function(index) {

                var fillDataProms = [];

                for(var m = 0; m < index.mappings.length; m++) {
                    var mapping = index.mappings[m];
                    var dataMethod;

                    // Check that the method provided exists in core.data and promisify it
                    if(typeof core.data[mapping.data.method] === 'function') {
                        dataMethod = Promise.promisify(core.data[mapping.data.method])
                    }

                    // Call the method to retrieve the data and then add it to elestic search
                    var prom = dataMethod().then(function(index, mapping, data) {
                        return addAll(data, index.index, mapping.class, mapping.data.attributes, mapping.data.config);
                    }.bind(null, index, mapping));

                    fillDataProms.push(prom);
                }

                return Promise.all(fillDataProms);

            }.bind(null, index));


            promises.push(promise);

        }

        return Promise.all(promises);

    };

    return _exports;

};