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

var bot = require("../sdhbot.js");

var startTest = function startTest() {
    log.info("** starting sdh Basic Tools async-test **");

    log.debug("1. Test getSDHMembers:");
    internalSDHtools.getSDHMembers(function(members) {
        log.debug("1->" + JSON.stringify(members));
        if (!members || !Array.isArray(members)) {
            log.error("- sdhBasic.getSDHMembers fails!");
        } else {
            log.debug('+ success');
        }
    });

    log.debug("2. Test getSDHMetrics:");
    internalSDHtools.getSDHMetrics(function(metrics) {
        log.debug("2->" + JSON.stringify(metrics));
        if (!metrics || !Array.isArray(metrics)) {
            log.error("- sdhBasic.getSDHMetrics fails!");
        } else {
            log.debug('+ success');
        }
    });

    log.debug("3. Test getSDHMetric:");
    internalSDHtools.getSDHMetric("developers", {}, function(metric) {
        log.debug("3->" + JSON.stringify(metric));
        if (!metric || !metric.values || !Array.isArray(metric.values) || !metric.interval) {
            log.error("- sdhBasic.getSDHMetric fails!");
        } else {
            log.debug('+ success');
        }
    });

    log.debug("4. Test getSDHProducts:");
    internalSDHtools.getSDHProducts(function(products) {
        log.debug("4->" + JSON.stringify(products));
        if (!products || !Array.isArray(products)) {
            log.error("- sdhBasic.getSDHProducts fails!");
        } else {
            log.debug('+ success');
        }
    });

    log.debug("5. Test getSDHProduct:");
    internalSDHtools.getSDHProduct("product-sdh-web", {}, function(product) {
        log.debug("5->" + JSON.stringify(product));
        if (!product || !product.productid || product.productid !== "product-sdh-web") {
            log.error("- sdhBasic.getSDHProduct fails!");
        } else {
            log.debug('+ success');
        }
    });

    log.debug("6. Test getSDHProjects:");
    internalSDHtools.getSDHProjects(function(projects) {
        log.debug("6->" + JSON.stringify(projects));
        if (!projects || !Array.isArray(projects)) {
            log.error("- sdhBasic.getSDHProjects fails!");
        } else {
            log.debug('+ success');
        }
    });

    log.debug("7. Test getSDHProject:");
    internalSDHtools.getSDHProject("project-sdh-web", {}, function(project) {
        log.debug("7->" + JSON.stringify(project));
        if (!project || !project.projectid || project.projectid !== "project-sdh-web") {
            log.error("- sdhBasic.getSDHProject fails!");
        } else {
            log.debug('+ success');
        }
    });

    log.debug("8. Test getSDHPRepositories:");
    internalSDHtools.getSDHPRepositories(function(repositories) {
        log.debug("8->" + JSON.stringify(repositories));
        if (!repositories || !Array.isArray(repositories)) {
            log.error("- sdhBasic.getSDHPRepositories fails!");
        } else {
            log.debug('+ success');
        }
    });

    log.debug("9. Test getSDHPRepository:");
    internalSDHtools.getSDHPRepository(43, {}, function(repository) {
        log.debug("9->" + JSON.stringify(repository));
        if (!repository || !repository.repositoryid || repository.repositoryid !== "43") {
            log.error("- sdhBasic.getSDHPRepository fails!");
        } else {
            log.debug('+ success');
        }
    });

    log.debug("10. Test getSDHOrganizations:");
    internalSDHtools.getSDHOrganizations(function(org) {
        log.debug("10->" + JSON.stringify(org));
        if (!org || !Array.isArray(org)) {
            log.error("- sdhBasic.getSDHOrganizations fails!");
        } else {
            log.debug('+ success');
        }
    });

    /*log.debug("11. Test getSDHOrganization:");
    internalSDHtools.getSDHOrganization(1, {}, function(org) {
        log.debug("11->" + JSON.stringify(org));
        if (!org || !org.organizationid || org.organizationid !== 1) {
            log.error("- sdhBasic.getSDHOrganization fails!");
        } else {
            log.debug('+ success');
        }
    });*/

    log.debug("11. Test getSDHViews:");
    internalSDHtools.getSDHViews(function(views) {
        log.debug("11->" + JSON.stringify(views));
        if (!views || !Array.isArray(views)) {
            log.error("- sdhBasic.getSDHViews fails!");
        } else {
            log.debug('+ success');
        }
    });

    log.debug("12. Test getSDHView:");
    internalSDHtools.getSDHView("view-director-products", {'uid':1004}, function(view) {
        log.debug("12->" + JSON.stringify(view));
        if (!view || !view.values || !Array.isArray(view.values) || !view.interval) {
            log.error("- sdhBasic.getSDHView fails!");
        } else {
            log.debug('+ success');
        }
    });
};

bot.init('testCore', startTest);