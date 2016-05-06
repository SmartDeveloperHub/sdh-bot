var Promise = require("bluebird");

// Do not silently capture errors
Promise.onPossiblyUnhandledRejection(function(error){
    throw error;
});

module.exports = function(elasticSearchUrl, core, log) {

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
    }

    var addAllObjects = function(map, index, type, params, options) {

        var proms = [];
        for(var key in map) {
            if(map.hasOwnProperty(key)) {
                var data = map[key];
                proms.push(addDocument(index, type, data, params, options));
            }
        }

        return Promise.all(proms);
    }

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
    }

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

    }


    // ----------------------------------------------------------
    // ------------------- PUBLIC METHODS -----------------------
    // ----------------------------------------------------------
    _exports.fillWithData = function() {

        return elasticClient.indices.exists({
            index: "entities"
        }).then(function(exists) {
            if(exists) {
                return elasticClient.indices.delete({
                    index: "entities"
                });
            }
        }).then(function() {
            return elasticClient.indices.create({
                index: "entities"
            });
        }).then(function() {

            var mappingProms = [

                // Metrics
                createMapping("entities", "metric", {
                    id: { type: "string", "analyzer": "simple" },
                    name: { type: "string", "analyzer": "snowball" },
                    description: { type: "string", "analyzer": "snowball" }
                }),

                // Organization
                createMapping("entities", "org", {
                    title: { type: "string", "analyzer": "simple" },
                    purpose: { type: "string", "analyzer": "snowball" },
                    description: { type: "string", "analyzer": "snowball" },
                    clasification: { type: "string", "analyzer": "simple" }
                }),

                // Products
                createMapping("entities", "product", {
                    id: { type: "string", "analyzer": "simple" },
                    name: { type: "string", "analyzer": "simple" }
                }),

                // Projects
                createMapping("entities", "project", {
                    id: { type: "string", "analyzer": "simple" },
                    name: { type: "string", "analyzer": "simple" }
                }),

                // Repositories
                createMapping("entities", "repo", {
                    id: { type: "string", "analyzer": "simple" },
                    name: { type: "string", "analyzer": "simple" }
                }),

                // Users
                createMapping("entities", "user", {
                    id: { type: "string", "analyzer": "simple" },
                    name: { type: "string", "analyzer": "simple" },
                    nick: { type: "string", "analyzer": "simple" },
                    email: { type: "string", "analyzer": "simple" }
                })
            ];

            return Promise.all(mappingProms);

        }).then(function() {

            var dumpPromises = [

                // Metrics
                sdhData.getSDHMetricsAsync().then(function(metrics) {
                    return addAll(metrics, "entities", "metric", ["id", "title", "description"]);
                }),

                // Views
                sdhData.getSDHViewsAsync().then(function(views) {
                    return addAll(views, "entities", "view", ["id"]);
                }),

                // Organization
                addAllObjects(sdhOrganizationsByID, "entities", "org", ["title", "purpose", "description", "clasification"]),

                // Products
                addAllObjects(sdhProductsByID, "entities", "product", ["prid", "name"], {trans:{prid:{name:"id"}}}),

                // Projects
                addAllObjects(sdhProjectsByID, "entities", "project", ["pjid", "name"], {trans:{pjid:{name:"id"}}}),

                // Repositories
                addAllObjects(sdhReposByID, "entities", "repo", ["rid", "name"], {trans:{rid:{name:"id"}}}),

                // Users
                addAllObjects(sdhUsersByID, "entities", "user", ["uid", "name", "nick", "email"], {trans:{uid:{name:"id"}}})

            ];

            return Promise.all(dumpPromises).catch(function(e) {
                log.error(e);
            });

        });

    };

    _exports.metrics = function(text, options) {
        return makeMultiMatchQuery("entities", ["metric_id^3", "metric_title^2", "metric_description"], text, options);
    }

    _exports.views = function(text, options) {
        return makeMultiMatchQuery("entities", ["view_id"], text, options);
    }

    _exports.products = function(text, options) {
        return makeMultiMatchQuery("entities", ["product_id^2", "product_name"], text, options);
    }

    _exports.projects = function(text, options) {
        return makeMultiMatchQuery("entities", ["project_id^2", "project_name"], text, options);
    }

    _exports.repositories = function(text, options) {
        return makeMultiMatchQuery("entities", ["repo_id^2", "repo_name"], text, options);
    }

    _exports.users = function(text, options) {
        return makeMultiMatchQuery("entities", ["user_id^3", "user_email^3", "user_nick^2", "user_name"], text, options);
    }

    _exports.general = function(text, options) {
        return makeMultiMatchQuery("entities", ["org_*", "product_*", "project_*", "repo_*", "user_*"], text, options);
    }

    return _exports;

};