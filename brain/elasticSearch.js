var Promise = require("bluebird");

// Do not silently capture errors
Promise.onPossiblyUnhandledRejection(function(error){
    throw error;
});

module.exports = function(core, log) {

    var sdhData = Promise.promisifyAll(core.data);

    //TODO: just for testing
    var elasticsearch = require('elasticsearch');

    var elasticClient = new elasticsearch.Client({
        host: 'http://localhost:9200/',
        log: 'debug'
    });

    var addDocument = function(index, type, data, params) {

        var body = {};
        for(var param in data) {
            if(params.indexOf(param) != -1) {
                body[type + "_" + param] = data[param];
            }
        }

        return elasticClient.index({
            index: index,
            type: type,
            body: body
        });
    };

    var dumpMetrics = function() {
        return sdhData.getSDHMetricsAsync().then(function(metrics) {
            var prom = metrics.map(function(metric) {
                return addDocument("entities", "metric", metric, ["id", "title", "description"]);
            });
            return Promise.all(prom);
        }).catch(function(e) {
            log.error(e);
        });
    };



    elasticClient.indices.exists({
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
        return elasticClient.indices.putMapping({
            index: "entities",
            type: "member",
            body: {
                properties: {
                    member_id: {type: "string", "analyzer": "simple"},
                    member_nick: {type: "string", "analyzer": "simple"},
                    member_name: {type: "string", "analyzer": "simple"},
                    member_email: {type: "string", "analyzer": "simple"}
                }
            }
        });
    }).then(function() {
        return elasticClient.indices.putMapping({
            index: "entities",
            type: "metric",
            body: {
                properties: {
                    metric_id: {type: "string", "analyzer": "simple"},
                    metric_name: {type: "string", "analyzer": "snowball"},
                    metric_description: {type: "string", "analyzer": "snowball"}
                }
            }
        });
    }).then(function() {
        return dumpMetrics();
    }).then(function() {
        var p = [];
        for(var userId in sdhUsersByID) {
            var user = sdhUsersByID[userId];
            p.push(
                elasticClient.index({
                    index: "entities",
                    type: "member",
                    body: {
                        member_id: user.userid,
                        member_nick: user.nick,
                        member_name: user.name,
                        member_email: user.email
                    }
                })
            );
        }
        return p;
    }).then(function() {
        return elasticClient.search({
            index: "entities",
            body: {
                query: {
                    "multi_match": {
                        "query": "alejandra",
                        "type": "best_fields",
                        "fields": ["member_*"],
                        "tie_breaker": 0.3,
                        "fuzziness": "AUTO"
                    }
                    //"term" : { "member_name" : "Alejandro" }
                },
                "size": 100,
                "from": 0,
                "sort":{
                    "_score":{
                        "order":"desc"
                    }
                }
            }
        });
    }).then(function() {
        return Promise.delay(1000); //TODO: find a way to tell the elasticClient to flush the actions before executing the query
    }).then(function() {
        return elasticClient.search({
            index: "entities",
            body: {
                query: {
                    "multi_match": {
                        "query": "gato",
                        "type": "best_fields",
                        "fields": ["metric_id^3", "metric_title^2", "metric_description"],
                        "tie_breaker": 0.3,
                        "fuzziness": "AUTO"
                    }
                    //"term" : { "member_name" : "Alejandro" }
                },
                "size": 100,
                "from": 0,
                "sort":{
                    "_score":{
                        "order":"desc"
                    }
                }
            }
        });
    }).then(function(result) {
        log.info(result);
    });
};