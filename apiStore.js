var EventEmitter = require('events');
var AddonCollection = require('stremio-addon-client').AddonCollection;
var officialAddons = require('stremio-official-addons');
var MemoryStorage = require('./lib/memoryStorage');
var ApiClient = require('./apiClient');

var ENDPOINT = 'https://api.strem.io';
var INTERRUPTED_ERROR_MESSAGE = 'request interrupted';

function ApiStore(options) {
    var endpoint = options.endpoint || ENDPOINT;
    var storage = options.storage || new MemoryStorage();
    var client = new ApiClient(endpoint, storage.getJSON('authKey'));
    var self = this;

    this.events = new EventEmitter();
    this.user = storage.getJSON('user');
    this.addons = new AddonCollection();
    this.addons.load(storage.getJSON('addons') || officialAddons);

    this.request = function(method, params) {
        var currentClient = client;
        return new Promise(function(resolve, reject) {
            currentClient.request(method, params)
                .then(function(resp) {
                    if (currentClient !== client) {
                        reject(new Error(INTERRUPTED_ERROR_MESSAGE));
                        return;
                    }

                    resolve(resp);
                })
                .catch(function(err) {
                    if (currentClient !== client) {
                        reject(new Error(INTERRUPTED_ERROR_MESSAGE));
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

    this.logout = function() {
        return this.request('logout')
            .then(function() {
                storage.setJSON('authKey', null);
                storage.setJSON('user', null);
                client = new ApiClient(endpoint, null);
                self.user = null;
            })
            .catch(function(err) {
                if (err && err.message !== INTERRUPTED_ERROR_MESSAGE) {
                    storage.setJSON('authKey', null);
                    storage.setJSON('user', null);
                    client = new ApiClient(endpoint, null);
                    self.user = null;
                }
            });
    };
};

module.exports = ApiStore;
