var EventEmitter = require('events');
var AddonCollection = require('stremio-addon-client').AddonCollection;
var officialAddons = require('stremio-official-addons');
var MemoryStorage = require('./lib/memoryStorage');
var ApiClient = require('./apiClient');

var ENDPOINT = 'https://api.strem.io';

function ApiStore(options) {
    var endpoint = options.endpoint || ENDPOINT;
    var storage = options.storage || new MemoryStorage();
    var client = new ApiClient(endpoint, storage.getJSON('authKey'));
    var self = this;

    this.events = new EventEmitter();
    this.user = storage.getJSON('user');
    this.addons = new AddonCollection(officialAddons);

    this.request = function(method, params) {
        var currentClient = client;
        return new Promise(function(resolve, reject) {
            currentClient.request(method, params)
                .then(function(resp) {
                    if (currentClient !== client) {
                        reject(new Error('request interrupted'));
                        return;
                    }

                    resolve(resp);
                })
                .catch(function(err) {
                    if (currentClient !== client) {
                        reject(new Error('request interrupted'));
                        return;
                    }

                    reject(err);
                });
        });
    };

    this.loginWithEmail = function(email, password) {
        return this.request('login', { email: email, password: password })
            .then(function(result) {
                storage.setJSON('authKey', result.authKey);
                storage.setJSON('user', result.user);
                client = new ApiClient(endpoint, result.authKey);
                self.user = result.user;
            });
    };

    this.register = function(email, password) {
        return this.request('register', { email: email, password: password })
            .then(function(result) {
                storage.setJSON('authKey', result.authKey);
                storage.setJSON('user', result.user);
                client = new ApiClient(endpoint, result.authKey);
                self.user = result.user;
            });
    };
};

module.exports = ApiStore;
