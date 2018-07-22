var EventEmitter = require('events');

var ENDPOINT = 'https://api.strem.io';

function StremioAPI(options) {
    var options = Object.assign({ endpoint: ENDPOINT }, options)
    var storage = options.storage;

    this.events = new EventEmitter();
    this.user = storage.getUser();

    var self = this;

    function request(method, params) {
        var fetchOptions = {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(params)
        };

        return fetch(options.endpoint+'/api/'+method, fetchOptions)
            .then(function(resp) {
                if (resp.status !== 200) {
                    throw new Error('request failed with status code ' + resp.status);
                }

                if (resp.headers.get('content-type').indexOf('application/json') === -1) {
                    throw new Error('response type is not JSON');
                }

                return resp.json();
            })
            .then(function(body) {
                if (body.error) {
                    throw body.error;
                }

                if (!body.result) {
                    throw new Error('response has no result');
                }

                return body.result;
            });
    }

    this.request = function(method, params) {
        // @TODO: authKey
        return request(method, params);
    };

    function onUserUpdated(user) {
        var currentUserId = self.user && self.user.id;
        var currentUserLastModified = self.user && self.user.lastModified;
        var nextUserId = user && user.id;
        var nextUserLastModified = user && user.lastModified;
        if (currentUserId !== nextUserId || currentUserLastModified < nextUserLastModified) {
            self.user = user;
            storage.setUser(user);
            self.events.emit('user');
        }
    }

    this.loginWithEmail = function(email, password) {
        return request('login', { email: email, password: password })
            .then(function(result) {
                var user = result.user;
                user.authKey = result.authKey;
                onUserUpdated(user);
            });
    };

    this.register = function(email, password) {
        return request('register', { email: email, password: password })
            .then(function(result) {
                var user = result.user;
                user.authKey = result.authKey;
                onUserUpdated(user);
            });
    };

    this.logout = function() {
        var authKey = this.user && this.user.authKey;
        return request('logout', { authKey: authKey })
            .then(function() { })
            .catch(function() { })
            .then(function() {
                onUserUpdated(null);
            });
    };

    this.pullUser = function() {
        var authKey = this.user && this.user.authKey;
        return request('getUser', { authKey: authKey })
            .then(function(user) {
                user.authKey = authKey;
                onUserUpdated(user);
            });
    };

    this.pushUser = function() {
        return new Promise(function(resolve, reject) {
            if (self.user === null) {
                reject('cannot push null user');
                return;
            }

            // @TODO: document and think about this behaviour
            self.user.lastModified = Date.now();
            request('saveUser', self.user)
                .then(function() { })
                .catch(function() { })
                .then(function() {
                    onUserUpdated(self.user);
                    resolve();
                });
        });
    };

    Object.seal(this);
    return this;
}

module.exports = StremioAPI;
