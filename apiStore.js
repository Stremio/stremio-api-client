var EventEmitter = require('events');
var AddonCollection = require('stremio-addon-client').AddonCollection;
var mapURL = require('stremio-addon-client').mapURL;
var officialAddons = require('stremio-official-addons');
var MemoryStorage = require('./lib/memoryStorage');
var ApiClient = require('./apiClient');

var ENDPOINT = 'https://api.strem.io';
var INTERRUPTED_ERROR_MESSAGE = 'request interrupted';

function ApiStore(options) {
    options = options || {}
    var endpoint = options.endpoint || ENDPOINT;
    var storage = options.storage || new MemoryStorage();
    var client = new ApiClient({ endpoint: endpoint, authKey: storage.getJSON('authKey') });
    
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
                userChange(result.authKey, result.user);
                addonsUpdated(null, null);
            });
    };

    this.register = function(email, password) {
        return this.request('register', { email: email, password: password })
            .then(function(result) {
                userChange(result.authKey, result.user);
                addonsUpdated(null, null);
            });
    };

    this.logout = function() {
        return this.request('logout')
            .then(function() {
                userChange(null, null);
                addonsUpdated(null, null);
            })
            .catch(function(err) {
                if (err && err.message !== INTERRUPTED_ERROR_MESSAGE) {
                    userChange(null, null);
                    addonsUpdated(null, null);
                }
            });
    };

    //
    // pullAddonCollection, pushAddonCollection
    //
    this.pullAddonCollection = function() {
        if (!self.user) {
            return noUserError();
        }

        var params = { update: true, addFromURL: [] };
        var lastModified = storage.getJSON('addonsLastModified') || 0;

        var legacyKey = 'addons:'+(self.user ? self.user._id : '');
        params.addFromURL = mapLegacyAddonRepo(storage.getJSON(legacyKey));

        return this.request('addonCollectionGet', params)
            .then(function(resp) {
                if (!Array.isArray(resp.addons)) {
                    throw 'no resp.addons';
                }

                var newLastModified = new Date(resp.lastModified).getTime();
                if (resp.addons.length && newLastModified > lastModified) {
                    addonsUpdated(resp.addons, newLastModified);

                    if (params.addFromURL.length) {
                        storage.setJSON(legacyKey, null);
                    }
                }
            })
    };

    this.pushAddonCollection = function() {
        if (!self.user) {
            return noUserError();
        }

        var descriptors = self.addons.save();
        storage.setJSON('addons', descriptors);
        storage.setJSON('addonsLastModified', Date.now());
        return self.request('addonCollectionSet', { addons: descriptors });
    };

    //
    // pullUser, pushUser
    //
    this.pullUser = function() {
        if (!self.user) {
            return noUserError();
        }

        return this.request('getUser')
            .then(function(user) {
                if (!(user && user._id)) {
                    throw 'invalid user returned'
                }

                var lastModified = new Date(self.user.lastModified).getTime()
                var newLastModified = new Date(user.lastModified).getTime()
                if (newLastModified > lastModified) {
                    storage.setJSON('user', user);
                    self.user = user;
                }
            })
    };

    this.pushUser = function() {
        if (!self.user) {
            return noUserError();
        }

        self.user.lastModified = new Date();
        storage.setJSON('user', self.user);
        return self.request('saveUser', self.user);
    };

    //
    // Private methods
    //

    // only invoked when the user is changed by _id (different user)
    // call this with (null, null) when logging out
    function userChange(authKey, user) {
        storage.setJSON('authKey', authKey);
        storage.setJSON('user', user);
        client = new ApiClient({ endpoint: endpoint, authKey: authKey });
        self.user = user;
        self.events.emit('user-change', user);
    }

    // this may be invoked when the add-on set is updated
    function addonsUpdated(descriptors, lastModified) {
        storage.setJSON('addons', descriptors);
        storage.setJSON('addonsLastModified', lastModified || 0);
        self.addons.load(descriptors || officialAddons);
        self.events.emit('addons-change');
    }

    // remaps old add-on format into a list of URLs
    function mapLegacyAddonRepo(repo) {
        if (repo && Array.isArray(repo.addons)) {
            return repo.addons
            .filter(function(x) { return Array.isArray(x.endpoints) && typeof(x.endpoints[0]) === 'string' })
            .map(function(x) { return mapURL(x.endpoints[0]) })
        }
        return []
    }

    function noUserError() {
        return new Promise(function(resolve, reject) {
            reject(new Error('user required to invoke this'))
        })
    }

    Object.seal(this);
    return this;
};

module.exports = ApiStore;
