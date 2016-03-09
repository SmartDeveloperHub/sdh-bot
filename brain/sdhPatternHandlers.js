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
    var helpme = function helpme(clientId, msg, callback) {
        callback ("COREBOT Help common msg!");
    };
    var metric = function metric(clientId, msg, callback) {
        callback ("metric data");
    };
    var view = function view(clientId, msg, callback) {
        callback ("view data");
    };
    var org = function org(clientId, msg, callback) {
        callback ("A organization");
    };
    var product = function product(clientId, msg, callback) {
        callback ("A product");
    };
    var project = function project(clientId, msg, callback) {
        callback ("A project");
    };
    var repo = function repo(clientId, msg, callback) {
        callback ("A repository");
    };
    var member = function member(clientId, msg, callback) {
        callback ("A member");
    };
    var allMetrics = function allMetrics(clientId, msg, callback) {
        callback ("All metrics List");
    };
    var allViews = function allViews(clientId, msg, callback) {
        callback ("All views List");
    };
    var allOrgs = function allOrgs(clientId, msg, callback) {
        callback ("All organizations List");
    };
    var allProducts = function allProducts(clientId, msg, callback) {
        callback ("All products List");
    };
    var allProjects = function allProjects(clientId, msg, callback) {
        callback ("All projects List");
    };
    var allRepos = function allRepos(clientId, msg, callback) {
        callback ("All repositories List");
    };
    var allMembers = function allMembers(clientId, msg, callback) {
        callback ("All members List");
    };

/* PUBLIC */
    module.exports.phInfo = {
        '/help|ayuda/':{
            'callback': helpme,
            'description': "Return core bot help information"
        },
        '/metric|metrica/':{
            'callback': metric,
            'description': "Return metric data"
        },
        '/view|tbd/time based data':{
            'callback': view,
            'description': "Return metric data"
        },
        '/all metrics|todas las metricas/':{
            'callback': allMetrics,
            'description': "Return complete metrics list"
        },
        '/all views|all tbds|all time based data|todas las vistas/':{
            'callback': allViews,
            'description': "Return complete views list"
        },
        '/organization|organizacion/':{
            'callback': org,
            'description': "Return organization"
        },
        '/product|producto/':{
            'callback': product,
            'description': "Return product"
        },
        '/project|proyecto/':{
            'callback': project,
            'description': "Return project"
        },
        '/user|usuario|member|miembro/':{
            'callback': member,
            'description': "Return member"
        },
        '/repository|repositorio/':{
            'callback': repo,
            'description': "Return repository"
        },
        '/all organizations|todas las organizaciones/':{
            'callback': allOrgs,
            'description': "Return complete organizations list"
        },
        '/all products|todos los productos/':{
            'callback': allProducts,
            'description': "Return complete projects list"
        },
        '/all projects|todos los proyectos/':{
            'callback': allProjects,
            'description': "Return complete projects list"
        },
        '/all users|todos los usuarios|all members|todos los miembros/':{
            'callback': allMembers,
            'description': "Return complete products list"
        },
        '/all repositories|todos los repositorios/':{
            'callback': allRepos,
            'description': "Return complete products list"
        }
    }
