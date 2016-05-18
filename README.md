# SDH-CORE-BOT

[![Hex.pm](https://img.shields.io/hexpm/l/plug.svg)](http://www.apache.org/licenses/LICENSE-2.0.txt)
[![npm version](https://badge.fury.io/js/sdh-core-bot.svg)](https://badge.fury.io/js/sdh-core-bot)

This is the Smart Developer Hub Core Bot.

Smart Developer Hub project.
For more information, please visit the [Smart Developer Hub website](http://www.smartdeveloperhub.org/).

SDH-CORE-BOT is distributed under the Apache License, version 2.0.

## Installation

```
npm install sdh-core-bot
```

## Configuration

To configure the data stored in Elastic Search and the methods provided in core.search configure the file "elasticConfig.json".
```
[
  {
    "index": "entities", // Name of the index
    "mappings": [ // Elastic search mappings
      {
        "class": "repo",  // Document type
        "attributes": {
          "id": {
            "type": "string",  // Type of the data
            "analyzer": "simple"  // Analyzer of Elastic Search to use
          },
          /* more */
        },
        "data": { // What data to store in Elastic Search
          "method": "getSDHRepositories", // Method in core.data to call (without arguments) to obtain the data
          "attributes": ["rid", "name"], // Attributes of the array of objects returned by the method to store in ES
          "config": {
            "trans":{ // Apply a transformation to the data to store
              "rid":{ // The transformation applies to the "rid" parameter
                "name":"id" // The transformation changes the name of the parameter ("rid") to "id"
              }
            }
          }
        },
        "operations": [ // Search operations exported to core.search
          {
            "name": "repositories", // Export an operation called core.search.repositories
            "search": ["id^2", "name"] // Search using parameters id and name, give double weight to id
          },
          /* more */
        ]
      },
    ],
    "operations": [ //Same as inside he mappings, but in this case search should be "<class>_<attribute>"
      {
        "name": "general", // Operation called core.search.general
        "search": ["org_id", "product_*"] // Search in org's id parameter and all the parameters of product 
      },
      /* more /*
    ]
  },
  /* more */
]
```