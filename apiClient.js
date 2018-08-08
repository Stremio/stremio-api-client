function ApiClient(options) {
    options = options || {}

    var fetch = options.fetch
    var authKey = options.authKey
    var endpoint = options.endpoint || 'https://api.strem.io'

    this.endpoint = endpoint

    this.request = function(method, params) {
        var fetchOptions = {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(Object.assign({ authKey: authKey }, params))
        };

        return fetch(endpoint + '/api/' + method, fetchOptions)
            .then(function(resp) {
                if (resp.status !== 200) {
                    throw new Error('request failed with status code ' + resp.status);
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
    };

    Object.freeze(this);
    return this;
}

module.exports = ApiClient;
