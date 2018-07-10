var EventEmitter = require('events');

var ENDPOINT = 'https://api9.strem.io/rpc';

function StremioAPI(options) {
    var storage = options.storage;
    this.events = new EventEmitter();
    this.user = storage.getUser();

    function sendRequest(method, params) {
        var fetchOptions = {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({ id: 1, method: method, params: [params], jsonrpc: '2.0' })
        };

        return fetch(ENDPOINT, fetchOptions)
            .then(function(resp) {
                if (resp.status !== 200) {
                    throw new Error('fetch failed with status code ' + resp.status);
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

    function onUserUpdated(user) {
        var currentUserId = this.user && this.user.id;
        var currentUserLastModified = this.user && this.user.lastModified;
        var nextUserId = user && user.id;
        var nextUserLastModified = user && user.lastModified;
        if (currentUserId !== nextUserId || currentUserLastModified < nextUserLastModified) {
            this.user = user;
            storage.setUser(user);
            this.events.emit('user');
        }
    }

    this.loginWithEmail = function(email, password) {
        var _this = this;
        return sendRequest('login', { email: email, password: password })
            .then(function(result) {
                var user = result.user;
                user.authKey = result.authKey;
                onUserUpdated.call(_this, user);
            });
    };

    this.loginWithToken = function(token) {
        var _this = this;
        return sendRequest('login', { token: token })
            .then(function(result) {
                var user = result.user;
                user.authKey = result.authKey;
                onUserUpdated.call(_this, user);
            });
    };

    this.register = function(email, password) {
        var _this = this;
        return sendRequest('register', { email: email, password: password })
            .then(function(result) {
                var user = result.user;
                user.authKey = result.authKey;
                onUserUpdated.call(_this, user);
            });
    };

    this.logout = function() {
        var _this = this;
        var authKey = this.user && this.user.authKey;
        return sendRequest('logout', { authKey: authKey })
            .then(function() { })
            .catch(function() { })
            .then(function() {
                onUserUpdated.call(_this, null);
            });
    };

    this.pullUser = function() {
        var _this = this;
        var authKey = this.user && this.user.authKey;
        return sendRequest('getUser', { authKey: authKey })
            .then(function(user) {
                user.authKey = authKey;
                onUserUpdated.call(_this, user);
            });
    };

    this.pushUser = function() {
        var _this = this;
        return new Promise(function(resolve, reject) {
            if (_this.user === null) {
                reject('cannot push null user');
                return;
            }

            _this.user.lastModified = Date.now();
            sendRequest('saveUser', _this.user)
                .then(function() { })
                .catch(function() { })
                .then(function() {
                    onUserUpdated(_this.user);
                    resolve();
                });
        });
    };

    Object.seal(this);
    return this;
}

module.exports = StremioAPI;
